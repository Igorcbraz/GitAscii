import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  sql: vi.fn(),
  profiles: vi.fn(),
  load: vi.fn(),
  publish: vi.fn(),
}))
vi.mock('@/features/github/server/publishProfile', () => ({ publishProfileRequest: mocks.publish }))
vi.mock('@/lib/db/client', () => ({ sql: mocks.sql }))
vi.mock('@/features/pro/server/profileAccess', () => ({ assertProfileWriteAllowed: vi.fn() }))
vi.mock('@/features/pro/server/profileManagerStore', () => ({ getUserProfiles: mocks.profiles }))
vi.mock('@/lib/profileStorage', () => ({ loadProfileConfig: mocks.load }))

import { createConfiguration } from '@/engine/core/TemplateRenderer'

import { SCOPES } from './config'
import { readDraft, writeDraft } from './drafts'
import { automationMigration } from './migration'
import {
  authenticate,
  authorize,
  consentTicket,
  digest,
  exchangeToken,
  rateLimit,
  registerClient,
  revokeToken,
  validateAuthorization,
} from './oauth'
import { publishDraft } from './publication'

let db: PGlite
const origin = 'https://gitascii.test'
const verifier = 'x'.repeat(64)
const session = { username: 'alice', githubId: 1 }
const actor = { ...session, scopes: SCOPES }
const request = (token: string) =>
  new Request(`${origin}/mcp`, { headers: { Authorization: `Bearer ${token}` } })

beforeAll(async () => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', origin)
  vi.stubEnv('SESSION_SECRET', 'test-only-key-32-characters-long-not-production')
  db = new PGlite()
  mocks.sql.mockImplementation(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.reduce(
      (text, part, index) => text + (index ? `$${index}` : '') + part,
      ''
    )
    return (await db.query(query, values)).rows
  })
  await db.exec('CREATE TABLE users (github_id BIGINT UNIQUE NOT NULL, username TEXT NOT NULL)')
  await db.exec("INSERT INTO users VALUES (1, 'alice'), (2, 'bob')")
  await automationMigration.up()
}, 30000)

beforeEach(async () => {
  await db.exec(
    'TRUNCATE assistant_used_refresh_tokens, assistant_connections, assistant_codes, assistant_clients, assistant_rate_limits, editor_cloud_drafts, assistant_publications CASCADE'
  )
  mocks.profiles.mockResolvedValue([{ slug: 'default' }])
  mocks.load.mockResolvedValue(null)
  mocks.publish.mockReset().mockImplementation(async () => Response.json({ success: true }))
})
afterAll(async () => {
  await db?.close()
  vi.unstubAllEnvs()
})

async function grant() {
  const client = await registerClient({
    client_name: 'Test assistant',
    redirect_uris: ['https://client.test/callback'],
  })
  const input = {
    client_id: client.client_id,
    redirect_uri: 'https://client.test/callback',
    response_type: 'code' as const,
    resource: `${origin}/mcp`,
    code_challenge_method: 'S256' as const,
    code_challenge: digest(verifier),
    state: 'test-state',
    scope: SCOPES.join(' '),
  }
  const validated = await validateAuthorization(input)
  const ticket = consentTicket(validated.value, session.githubId)
  const location = await authorize(ticket, session, true)
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: client.client_id,
    redirect_uri: input.redirect_uri,
    code: location.searchParams.get('code')!,
    code_verifier: verifier,
    resource: `${origin}/mcp`,
  })
  return { input, ticket, location, params }
}

describe('OAuth backed by isolated PostgreSQL', () => {
  it('runs consent, PKCE exchange and authenticated account lookup without storing raw tokens', async () => {
    const { params, location } = await grant()
    expect(location.searchParams.get('state')).toBe('test-state')
    expect(location.searchParams.get('iss')).toBe(origin)
    const token = await exchangeToken(params)
    expect(await authenticate(request(token.access_token))).toMatchObject({
      username: 'alice',
      githubId: 1,
      scopes: [...SCOPES],
    })
    const rows = await db.query('SELECT * FROM assistant_connections')
    expect(JSON.stringify(rows.rows)).not.toContain(token.access_token)
    expect(JSON.stringify(rows.rows)).not.toContain(token.refresh_token)
    await expect(exchangeToken(params)).rejects.toMatchObject({ code: 'invalid_grant' })
  })
  it('does not consume a code for the wrong verifier, callback, client or audience', async () => {
    const { params } = await grant()
    for (const [key, value] of [
      ['code_verifier', 'z'.repeat(64)],
      ['redirect_uri', 'https://evil.test/callback'],
      ['client_id', 'wrong'],
      ['resource', 'https://evil.test/mcp'],
    ]) {
      const bad = new URLSearchParams(params)
      bad.set(key, value)
      await expect(exchangeToken(bad)).rejects.toBeInstanceOf(Error)
    }
    expect((await exchangeToken(params)).access_token).toBeTruthy()
  })
  it('rejects consent tampering, different accounts, unregistered callbacks and scope escalation', async () => {
    const { ticket, input } = await grant()
    await expect(authorize(ticket, { username: 'bob', githubId: 2 }, true)).rejects.toMatchObject({
      code: 'invalid_request',
    })
    await expect(authorize(ticket + 'tamper', session, true)).rejects.toBeInstanceOf(Error)
    await expect(
      validateAuthorization({ ...input, redirect_uri: 'https://evil.test' })
    ).rejects.toMatchObject({ code: 'invalid_client' })
    await expect(validateAuthorization({ ...input, scope: 'admin:grant' })).rejects.toMatchObject({
      code: 'invalid_scope',
    })
    const denied = await authorize(ticket, session, false)
    expect(denied.searchParams.get('error')).toBe('access_denied')
    expect(denied.searchParams.has('code')).toBe(false)
  })
  it('rotates refresh credentials and revokes the family on reuse, including older tokens', async () => {
    const { params } = await grant()
    const initial = await exchangeToken(params)
    const refresh = (token: string) =>
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: params.get('client_id')!,
        refresh_token: token,
        resource: `${origin}/mcp`,
      })
    const second = await exchangeToken(refresh(initial.refresh_token))
    const third = await exchangeToken(refresh(second.refresh_token))
    await expect(authenticate(request(initial.access_token))).rejects.toMatchObject({ status: 401 })
    await expect(exchangeToken(refresh(initial.refresh_token))).rejects.toMatchObject({
      code: 'invalid_grant',
    })
    await expect(authenticate(request(third.access_token))).rejects.toMatchObject({ status: 401 })
  })
  it('checks expiry, revocation, and the stable GitHub identity', async () => {
    const { params } = await grant()
    const token = await exchangeToken(params)
    await db.exec("UPDATE users SET username = 'renamed-alice' WHERE github_id = 1")
    expect((await authenticate(request(token.access_token))).username).toBe('renamed-alice')
    await db.exec("UPDATE users SET username = 'alice' WHERE github_id = 1")
    await revokeToken(
      new URLSearchParams({ client_id: params.get('client_id')!, token: token.access_token })
    )
    await expect(authenticate(request(token.access_token))).rejects.toMatchObject({ status: 401 })
    const next = await exchangeToken((await grant()).params)
    await db.exec(
      "UPDATE assistant_connections SET access_expires_at = NOW() - INTERVAL '1 minute'"
    )
    await expect(authenticate(request(next.access_token))).rejects.toMatchObject({ status: 401 })
  })
  it('enforces durable rate limits', async () => {
    await rateLimit('test', 1)
    await expect(rateLimit('test', 1)).rejects.toMatchObject({ status: 429 })
  })
})

describe('shared draft persistence and account isolation', () => {
  const layout = () => {
    const { widgets, globalStyles, templateId } = createConfiguration(1, 'alice', 'blank')
    return { widgets, globalStyles, templateId }
  }
  it('keeps drafts separate per account and ignores client-supplied ownership fields', async () => {
    await writeDraft(actor, 'default', 0, { layout: layout() })
    const bob = { ...actor, username: 'bob', githubId: 2 }
    expect((await readDraft(bob, 'default')).revision).toBe(0)
    await expect(
      writeDraft(actor, 'default', 1, { layout: { ...layout(), username: 'bob' } })
    ).rejects.toBeInstanceOf(Error)
  })
  it('allows only one competing creation and detects stale updates', async () => {
    const results = await Promise.allSettled([
      writeDraft(actor, 'default', 0, { layout: layout() }),
      writeDraft(actor, 'default', 0, { layout: layout() }),
    ])
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect((await readDraft(actor, 'default')).revision).toBe(1)
    await expect(writeDraft(actor, 'default', 0, { layout: layout() })).rejects.toMatchObject({
      code: 'REVISION_CONFLICT',
    })
  })
  it('persists undo/redo and refuses orphan profile drafts or read-only writes', async () => {
    const first = layout()
    await writeDraft(actor, 'default', 0, { layout: first })
    await writeDraft(actor, 'default', 1, {
      layout: { ...first, globalStyles: { ...first.globalStyles, textColor: '#ff0000' } },
    })
    expect(
      (await writeDraft(actor, 'default', 2, { history: 'undo' })).config.globalStyles.textColor
    ).toBe(first.globalStyles.textColor)
    expect(
      (await writeDraft(actor, 'default', 3, { history: 'redo' })).config.globalStyles.textColor
    ).toBe('#ff0000')
    await expect(
      writeDraft({ ...actor, scopes: ['profiles:read'] }, 'default', 4, { layout: first })
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_SCOPE' })
    await expect(writeDraft(actor, 'missing', 0, { layout: first })).rejects.toMatchObject({
      code: 'PROFILE_NOT_FOUND',
    })
  })
})

describe('explicit publication and idempotency', () => {
  it('publishes exactly the reviewed snapshot once and rejects a reused key with a different revision', async () => {
    const { widgets, globalStyles, templateId } = createConfiguration(1, 'alice', 'blank')
    await writeDraft(actor, 'default', 0, { layout: { widgets, globalStyles, templateId } })
    const id = crypto.randomUUID()
    expect((await publishDraft(actor, 'default', 1, id)).status).toBe('completed')
    expect((await publishDraft(actor, 'default', 1, id)).status).toBe('completed')
    expect(mocks.publish).toHaveBeenCalledTimes(1)
    const body = await (mocks.publish.mock.calls[0][0] as Request).json()
    expect(body.exportData.username).toBe('alice')
    expect(body.exportData.githubId).toBe(1)
    await expect(publishDraft(actor, 'default', 2, id)).rejects.toMatchObject({
      code: 'IDEMPOTENCY_CONFLICT',
    })
    await expect(
      publishDraft(
        { ...actor, scopes: ['profiles:read', 'profiles:write'] },
        'default',
        1,
        crypto.randomUUID()
      )
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_SCOPE' })
  })

  it('prevents parallel publication to the same profile and preserves uncertainty after interruption', async () => {
    const { widgets, globalStyles, templateId } = createConfiguration(1, 'alice', 'blank')
    await writeDraft(actor, 'default', 0, { layout: { widgets, globalStyles, templateId } })
    mocks.publish.mockRejectedValue(new Error('Remote connection lost'))
    const id = crypto.randomUUID()
    await expect(publishDraft(actor, 'default', 1, id)).rejects.toMatchObject({
      code: 'PUBLICATION_UNCERTAIN',
    })
    expect((await publishDraft(actor, 'default', 1, id)).status).toBe('running')
    await expect(publishDraft(actor, 'default', 1, crypto.randomUUID())).rejects.toMatchObject({
      code: 'PUBLICATION_BUSY',
    })
    expect(mocks.publish).toHaveBeenCalledTimes(1)
  })
})

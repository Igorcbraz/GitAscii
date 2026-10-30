import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  sql: vi.fn(),
  readDraft: vi.fn(),
  writeDraft: vi.fn(),
  authorize: vi.fn(),
  rateLimit: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({ getSession: mocks.session }))
vi.mock('@/lib/db/client', () => ({ sql: mocks.sql }))
vi.mock('./drafts', () => ({ readDraft: mocks.readDraft, writeDraft: mocks.writeDraft }))
vi.mock('./oauth', () => ({ authorize: mocks.authorize, rateLimit: mocks.rateLimit }))
vi.mock('@/engine/core/SVGEngine', () => ({
  renderSvg: () =>
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><text>Preview</text></svg>',
}))
vi.mock('@/features/github/api/fetchProfile', () => ({ fetchGitHubProfile: vi.fn() }))

import { DELETE as revokeConnection } from '@/app/api/account/connections/route'
import { PUT as saveDraft } from '@/app/api/editor/draft/route'
import { GET as exportDraft } from '@/app/api/editor/export/route'
import { POST as consent } from '@/app/oauth/consent/route'

const origin = 'https://gitascii.test'
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', origin)
  vi.stubEnv('GITASCII_MCP_ENABLED', 'true')
  mocks.session.mockResolvedValue({ username: 'alice', githubId: 1 })
  mocks.readDraft.mockResolvedValue({ revision: 1, config: {} })
  mocks.sql.mockResolvedValue([])
  mocks.rateLimit.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('browser parity and request boundaries', () => {
  it('rejects cross-origin draft writes and connection revocations before accessing data', async () => {
    const headers = { Origin: 'https://evil.test', 'Content-Type': 'application/json' }
    expect(
      (
        await saveDraft(
          new Request(`${origin}/api/editor/draft`, { method: 'PUT', headers, body: '{}' })
        )
      ).status
    ).toBe(403)
    expect(
      (
        await revokeConnection(
          new Request(`${origin}/api/account/connections`, {
            method: 'DELETE',
            headers,
            body: '{}',
          })
        )
      ).status
    ).toBe(403)
    expect(mocks.session).not.toHaveBeenCalled()
    expect(mocks.writeDraft).not.toHaveBeenCalled()
  })
  it('binds revocation to the session account, ignoring no ownership fields from the caller', async () => {
    const id = '00111111-2222-4333-8444-555555555555'
    const response = await revokeConnection(
      new Request(`${origin}/api/account/connections`, {
        method: 'DELETE',
        headers: { Origin: origin },
        body: JSON.stringify({ id }),
      })
    )
    expect(response.status).toBe(200)
    expect(mocks.sql.mock.calls[0].slice(1)).toEqual([id, 1])
  })
  it('rejects injected identity and unbounded bodies', async () => {
    const response = await saveDraft(
      new Request(`${origin}/api/editor/draft`, {
        method: 'PUT',
        headers: { Origin: origin },
        body: JSON.stringify({
          username: 'bob',
          githubId: 2,
          slug: 'default',
          expectedRevision: 0,
          operations: [{ type: 'add', widgetId: 'header' }],
        }),
      })
    )
    expect(response.status).toBe(400)
    expect(mocks.writeDraft).not.toHaveBeenCalled()
    const tooLarge = await saveDraft(
      new Request(`${origin}/api/editor/draft`, {
        method: 'PUT',
        headers: { Origin: origin },
        body: 'x'.repeat(300000),
      })
    )
    expect(tooLarge.status).toBe(413)
  })
  it('requires a session for downloads and serves sanitized SVG as a private attachment', async () => {
    mocks.session.mockResolvedValueOnce(null)
    expect((await exportDraft(new Request(`${origin}/api/editor/export`))).status).toBe(401)
    const result = await exportDraft(new Request(`${origin}/api/editor/export?format=svg`))
    expect(result.status).toBe(200)
    expect(result.headers.get('content-disposition')).toBe(
      'attachment; filename="gitascii_default.svg"'
    )
    expect(result.headers.get('content-security-policy')).toContain('sandbox')
    expect(result.headers.get('cache-control')).toBe('no-store')
    expect(await result.text()).not.toContain('<script')
    expect(mocks.readDraft.mock.calls[0][0]).toMatchObject({ username: 'alice', githubId: 1 })
  })
  it('returns the registered redirect to the consent form without a cross-origin fetch redirect', async () => {
    mocks.authorize.mockResolvedValue(new URL('https://client.test/callback?code=test'))
    const response = await consent(
      new Request(`${origin}/oauth/consent`, {
        method: 'POST',
        headers: { Origin: origin, Accept: 'application/json' },
        body: new URLSearchParams({ ticket: 'encrypted-test-ticket', decision: 'allow' }),
      })
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ redirectTo: 'https://client.test/callback?code=test' })
    expect(mocks.authorize).toHaveBeenCalledWith(
      'encrypted-test-ticket',
      { username: 'alice', githubId: 1 },
      true
    )
  })
})

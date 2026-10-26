import { createHash, randomBytes, randomUUID } from 'node:crypto'

import { z } from 'zod'

import { decryptSession, encryptSession, type UserSession } from '@/lib/auth'
import { sql } from '@/lib/db/client'

import { type Actor, appOrigin, SCOPES } from './config'
import { AutomationError } from './errors'

export const digest = (value: string) => createHash('sha256').update(value).digest('base64url')
const secret = () => randomBytes(32).toString('base64url')

export async function rateLimit(key: string, max = 60, seconds = 60) {
  const rows = await sql`INSERT INTO assistant_rate_limits (key, count, resets_at)
    VALUES (${key}, 1, NOW() + ${seconds} * INTERVAL '1 second')
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN assistant_rate_limits.resets_at <= NOW() THEN 1 ELSE assistant_rate_limits.count + 1 END,
      resets_at = CASE WHEN assistant_rate_limits.resets_at <= NOW() THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE assistant_rate_limits.resets_at END
    RETURNING count`
  if (Number(rows[0].count) > max)
    throw new AutomationError('RATE_LIMITED', 'Too many requests. Please try again later.', 429)
}

const redirectUri = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    const url = new URL(value)
    return (
      !url.hash &&
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' && ['127.0.0.1', '[::1]', 'localhost'].includes(url.hostname)))
    )
  }, 'Use HTTPS or a loopback callback URL.')

export const registrationSchema = z
  .object({
    client_name: z.string().trim().min(1).max(100),
    redirect_uris: z.array(redirectUri).min(1).max(5),
    token_endpoint_auth_method: z.literal('none').optional(),
    grant_types: z.array(z.enum(['authorization_code', 'refresh_token'])).optional(),
    response_types: z.array(z.literal('code')).optional(),
  })
  .strip()

export async function registerClient(input: unknown) {
  const value = registrationSchema.parse(input)
  await rateLimit('oauth:registration', 100, 3600)
  const id = randomUUID()
  await sql`INSERT INTO assistant_clients (id, name, redirect_uris) VALUES (${id}, ${value.client_name}, ${JSON.stringify(value.redirect_uris)}::jsonb)`
  return {
    ...value,
    client_id: id,
    token_endpoint_auth_method: 'none',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
  }
}

export const authorizationSchema = z
  .object({
    client_id: z.string().min(1).max(200),
    redirect_uri: redirectUri,
    response_type: z.literal('code'),
    code_challenge_method: z.literal('S256'),
    code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    resource: z.string().url(),
    state: z.string().max(2048).optional(),
    scope: z.string().max(500).default('account:read profiles:read'),
  })
  .strip()
export type Authorization = z.infer<typeof authorizationSchema>

export async function validateAuthorization(input: unknown) {
  const value = authorizationSchema.parse(input)
  if (value.resource !== `${appOrigin()}/mcp`)
    throw new AutomationError('invalid_target', 'The resource must be the GitAscii MCP URL.')
  const scopes = value.scope.split(/\s+/).filter(Boolean)
  if (!scopes.length || scopes.some((s) => !(SCOPES as readonly string[]).includes(s)))
    throw new AutomationError('invalid_scope', 'Unsupported permissions.')
  const rows =
    await sql`SELECT name, redirect_uris FROM assistant_clients WHERE id = ${value.client_id}`
  if (!rows[0] || !(rows[0].redirect_uris as string[]).includes(value.redirect_uri))
    throw new AutomationError(
      'invalid_client',
      'This application or callback has not been registered.'
    )
  return { value, scopes: [...new Set(scopes)], clientName: String(rows[0].name) }
}

export function consentTicket(value: Authorization, githubId: number) {
  return encryptSession(JSON.stringify({ value, githubId, expires: Date.now() + 600_000 }))
}

export async function authorize(ticket: string, session: UserSession, approved: boolean) {
  let payload: { value: Authorization; githubId: number; expires: number }
  try {
    payload = JSON.parse(decryptSession(ticket) || 'null')
  } catch {
    throw new AutomationError('invalid_request', 'Invalid authorization request.')
  }
  if (!payload || payload.githubId !== session.githubId || payload.expires < Date.now())
    throw new AutomationError('invalid_request', 'Authorization expired. Connect again.')
  const { value, scopes } = await validateAuthorization(payload.value)
  const redirect = new URL(value.redirect_uri)
  if (value.state !== undefined) redirect.searchParams.set('state', value.state)
  redirect.searchParams.set('iss', appOrigin())
  if (!approved) {
    redirect.searchParams.set('error', 'access_denied')
    return redirect
  }
  await rateLimit(`oauth:consent:${session.githubId}`, 20)
  const code = secret()
  await sql`INSERT INTO assistant_codes (hash, client_id, github_id, redirect_uri, challenge, scopes, expires_at)
    VALUES (${digest(code)}, ${value.client_id}, ${session.githubId}, ${value.redirect_uri}, ${value.code_challenge}, ${JSON.stringify(scopes)}::jsonb, NOW() + INTERVAL '5 minutes')`
  redirect.searchParams.set('code', code)
  return redirect
}

export async function exchangeToken(params: URLSearchParams) {
  await rateLimit('oauth:token', 1000)
  const clientId = params.get('client_id') || ''
  if (params.get('resource') !== `${appOrigin()}/mcp`)
    throw new AutomationError('invalid_target', 'Invalid resource.')
  const access = secret(),
    refresh = secret()
  let rows
  if (params.get('grant_type') === 'authorization_code') {
    const verifier = params.get('code_verifier') || ''
    if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier))
      throw new AutomationError('invalid_grant', 'Invalid PKCE verifier.')
    // Consumption and issuance are atomic. Invalid verifiers cannot consume a valid code.
    rows = await sql`WITH consumed AS (
      DELETE FROM assistant_codes WHERE hash = ${digest(params.get('code') || '')}
        AND client_id = ${clientId} AND redirect_uri = ${params.get('redirect_uri') || ''}
        AND challenge = ${digest(verifier)} AND expires_at > NOW() RETURNING github_id, scopes
    ) INSERT INTO assistant_connections (id, github_id, client_id, scopes, access_hash, refresh_hash, access_expires_at, expires_at)
      SELECT ${randomUUID()}::uuid, github_id, ${clientId}, scopes, ${digest(access)}, ${digest(refresh)}, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '30 days'
      FROM consumed RETURNING scopes`
  } else if (params.get('grant_type') === 'refresh_token') {
    const oldHash = digest(params.get('refresh_token') || '')
    if (params.has('scope'))
      throw new AutomationError(
        'invalid_scope',
        'Refresh preserves the originally granted permissions.'
      )
    await sql`UPDATE assistant_connections SET revoked_at = NOW()
      WHERE client_id = ${clientId} AND id IN (SELECT connection_id FROM assistant_used_refresh_tokens WHERE hash = ${oldHash}) AND revoked_at IS NULL`
    rows =
      await sql`WITH rotated AS (UPDATE assistant_connections SET previous_refresh_hash = refresh_hash,
      access_hash = ${digest(access)}, refresh_hash = ${digest(refresh)}, access_expires_at = NOW() + INTERVAL '1 hour'
      WHERE client_id = ${clientId} AND refresh_hash = ${oldHash} AND expires_at > NOW() AND revoked_at IS NULL RETURNING id, scopes),
      remembered AS (INSERT INTO assistant_used_refresh_tokens (hash, connection_id) SELECT ${oldHash}, id FROM rotated)
      SELECT scopes FROM rotated`
  } else
    throw new AutomationError('unsupported_grant_type', 'Use authorization_code or refresh_token.')
  if (!rows.length)
    throw new AutomationError(
      'invalid_grant',
      'Expired, revoked or invalid credentials. Connect again.'
    )
  return {
    access_token: access,
    refresh_token: refresh,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: (rows[0].scopes as string[]).join(' '),
  }
}

export async function authenticate(request: Request): Promise<Actor> {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(request.headers.get('authorization') || '')
  if (!match) throw new AutomationError('UNAUTHORIZED', 'Connect your GitAscii account.', 401)
  const rows = await sql`SELECT c.id, c.github_id, c.scopes, u.username FROM assistant_connections c
    JOIN users u ON u.github_id = c.github_id
    WHERE c.access_hash = ${digest(match[1])} AND c.revoked_at IS NULL AND c.access_expires_at > NOW() AND c.expires_at > NOW()`
  if (!rows[0])
    throw new AutomationError(
      'UNAUTHORIZED',
      'Your connection expired or was revoked. Connect again.',
      401
    )
  const actor = {
    githubId: Number(rows[0].github_id),
    username: String(rows[0].username),
    scopes: rows[0].scopes as string[],
    connectionId: String(rows[0].id),
  }
  await rateLimit(`mcp:${actor.githubId}`, 120)
  return actor
}

export async function revokeToken(params: URLSearchParams) {
  await rateLimit('oauth:revoke', 300)
  const hash = digest(params.get('token') || '')
  await sql`UPDATE assistant_connections SET revoked_at = NOW() WHERE client_id = ${params.get('client_id') || ''}
    AND (access_hash = ${hash} OR refresh_hash = ${hash}) AND revoked_at IS NULL`
}

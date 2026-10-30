import { API_ENDPOINTS } from '@/services/endpoints'

import { AutomationError } from './errors'

export const SCOPES = [
  'account:read',
  'profiles:read',
  'profiles:write',
  'profiles:publish',
  'analytics:read',
  'rules:write',
] as const
export type Scope = (typeof SCOPES)[number]
export interface Actor {
  githubId: number
  username: string
  scopes: readonly string[]
  connectionId?: string
}

export function appOrigin() {
  const url = new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NODE_ENV === 'production' ? API_ENDPOINTS.SITE.HOME : 'http://localhost:3000')
  )
  if (
    url.username ||
    url.password ||
    (url.protocol !== 'https:' &&
      !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname)))
  ) {
    throw new AutomationError('NOT_CONFIGURED', 'Configure a public HTTPS application URL.', 503)
  }
  return url.origin
}

export function requireAutomation() {
  if (process.env.GITASCII_MCP_ENABLED !== 'true')
    throw new AutomationError(
      'NOT_ENABLED',
      'Assistant connections are not enabled on this deployment.',
      503
    )
}

export function requireScope(actor: Actor, scope: Scope) {
  if (!actor.scopes.includes(scope))
    throw new AutomationError('INSUFFICIENT_SCOPE', `Reconnect with ${scope} permission.`, 403)
}

export function requireSameOrigin(request: Request) {
  if (request.headers.get('origin') !== appOrigin())
    throw new AutomationError('INVALID_ORIGIN', 'This request must originate from GitAscii.', 403)
}

export async function readBody(request: Request, limit = 262144) {
  if (Number(request.headers.get('content-length') || 0) > limit)
    throw new AutomationError('PAYLOAD_TOO_LARGE', 'Request is too large.', 413)
  const reader = request.body?.getReader()
  if (!reader) return ''
  let size = 0
  const parts: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      throw new AutomationError('PAYLOAD_TOO_LARGE', 'Request is too large.', 413)
    }
    parts.push(value)
  }
  return Buffer.concat(parts).toString('utf8')
}

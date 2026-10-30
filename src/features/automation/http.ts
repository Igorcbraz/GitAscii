import { ZodError } from 'zod'

import { ProfileLimitError } from '@/features/pro/server/profileAccess'
import { getSession } from '@/lib/auth'

import { type Actor, SCOPES } from './config'
import { AutomationError, publicError } from './errors'

export const privateHeaders = { 'Cache-Control': 'no-store', Pragma: 'no-cache' }
export async function browserActor(): Promise<Actor> {
  const session = await getSession()
  if (!session) throw new AutomationError('UNAUTHORIZED', 'Sign in to GitAscii.', 401)
  return { githubId: session.githubId, username: session.username, scopes: SCOPES }
}
export function errorResponse(error: unknown, oauth = false) {
  const result =
    error instanceof ZodError
      ? {
          code: 'INVALID_INPUT',
          message: 'Check the input fields.',
          details: error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
        }
      : error instanceof SyntaxError
        ? { code: 'INVALID_INPUT', message: 'Invalid request body.' }
        : error instanceof ProfileLimitError
          ? { code: 'PLAN_REQUIRED', message: error.message }
          : publicError(error)
  const status =
    error instanceof AutomationError
      ? error.status
      : error instanceof ZodError || error instanceof SyntaxError
        ? 400
        : error instanceof ProfileLimitError
          ? 403
          : 500
  return Response.json(
    oauth
      ? { error: result.code.toLowerCase(), error_description: result.message }
      : { error: result },
    { status, headers: { ...privateHeaders, ...(status === 429 ? { 'Retry-After': '60' } : {}) } }
  )
}

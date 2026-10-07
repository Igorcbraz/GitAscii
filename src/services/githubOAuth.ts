import 'server-only'

import { GITHUB_OAUTH, OAUTH_ERROR } from '@/constants/auth'

import { API_ENDPOINTS } from './endpoints'

interface GitHubOAuthProfile {
  login: string
  id: number
  name: string | null
  email: string | null
}

interface GitHubOAuthEmail {
  email: string
  primary: boolean
  verified: boolean
}

interface GitHubOAuthRequest {
  endpoint: string
  accessToken?: string
  body?: string
  timeoutMs?: number
}

function requestGithubOAuth({
  endpoint,
  accessToken,
  body,
  timeoutMs = GITHUB_OAUTH.timeoutMs,
}: GitHubOAuthRequest) {
  const headers = new Headers({ Accept: 'application/json', 'User-Agent': GITHUB_OAUTH.userAgent })
  if (accessToken) headers.set('Authorization', 'Bearer ' + accessToken)
  if (body) headers.set('Content-Type', 'application/json')
  return fetch(endpoint, {
    method: body ? 'POST' : 'GET',
    headers,
    body,
    signal: AbortSignal.timeout(timeoutMs),
  })
}

export async function exchangeGithubOAuthCode({
  clientId,
  clientSecret,
  code,
}: {
  clientId: string
  clientSecret: string
  code: string
}): Promise<string | null> {
  const response = await requestGithubOAuth({
    endpoint: API_ENDPOINTS.GITHUB.OAUTH_ACCESS_TOKEN,
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })
  if (!response.ok) throw new Error(OAUTH_ERROR.TOKEN_EXCHANGE_MESSAGE)
  const token: unknown = await response.json()
  if (
    typeof token !== 'object' ||
    token === null ||
    !('access_token' in token) ||
    typeof token.access_token !== 'string'
  )
    return null
  return token.access_token || null
}

export async function fetchGithubOAuthProfile(accessToken: string): Promise<GitHubOAuthProfile> {
  const response = await requestGithubOAuth({
    endpoint: API_ENDPOINTS.GITHUB.CURRENT_USER,
    accessToken,
  })
  if (!response.ok) throw new Error(OAUTH_ERROR.USER_PROFILE_MESSAGE)
  const profile: unknown = await response.json()
  if (
    typeof profile !== 'object' ||
    profile === null ||
    !('login' in profile) ||
    typeof profile.login !== 'string' ||
    !profile.login ||
    !('id' in profile) ||
    typeof profile.id !== 'number' ||
    !profile.id
  )
    throw new Error(OAUTH_ERROR.INVALID_USER_MESSAGE)
  return {
    login: profile.login,
    id: profile.id,
    name: 'name' in profile && typeof profile.name === 'string' ? profile.name : null,
    email: 'email' in profile && typeof profile.email === 'string' ? profile.email : null,
  }
}

function isGithubOAuthEmail(email: unknown): email is GitHubOAuthEmail {
  return (
    typeof email === 'object' &&
    email !== null &&
    'email' in email &&
    typeof email.email === 'string' &&
    'primary' in email &&
    typeof email.primary === 'boolean' &&
    'verified' in email &&
    typeof email.verified === 'boolean'
  )
}

export async function fetchGithubOAuthEmail(accessToken: string): Promise<string | undefined> {
  try {
    const response = await requestGithubOAuth({
      endpoint: API_ENDPOINTS.GITHUB.USER_EMAILS,
      accessToken,
      timeoutMs: GITHUB_OAUTH.emailTimeoutMs,
    })
    if (!response.ok) {
      console.warn('[OAuth] Optional email lookup failed', { status: response.status })
      return undefined
    }
    const payload: unknown = await response.json()
    if (!Array.isArray(payload)) throw new Error('Invalid GitHub email response')
    const emails = payload.filter(isGithubOAuthEmail)
    const preferredEmail =
      emails.find((email) => email.primary && email.verified) ||
      emails.find((email) => email.verified) ||
      emails[0]
    return preferredEmail?.email
  } catch (error) {
    logGithubOAuthWarning('Optional email lookup failed', error)
    return undefined
  }
}

export function logGithubOAuthWarning(context: string, error: unknown) {
  console.warn('[OAuth] ' + context, {
    errorName: error instanceof Error ? error.name : 'UnknownError',
  })
}

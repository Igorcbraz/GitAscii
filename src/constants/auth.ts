export const GITHUB_OAUTH = {
  timeoutMs: 15_000,
  emailTimeoutMs: 4000,
  stateCookie: 'oauth_state',
  allUsersKey: 'gitascii:all:users',
  userAgent: 'GitAscii-App',
} as const

export const OAUTH_STAGE = {
  VALIDATION: 'validation',
  TOKEN_EXCHANGE: 'token_exchange',
  USER_PROFILE: 'user_profile',
  SESSION: 'session',
} as const
export type OAuthStage = (typeof OAUTH_STAGE)[keyof typeof OAUTH_STAGE]

export const OAUTH_ERROR = {
  TIMEOUT_NAME: 'TimeoutError',
  TIMEOUT_CODE: 'github_oauth_timeout',
  TIMEOUT_MESSAGE: 'GitHub did not respond in time. Please start sign-in again.',
  UNEXPECTED_MESSAGE: 'Unable to complete GitHub sign-in. Please start sign-in again.',
  TOKEN_EXCHANGE_MESSAGE: 'Failed to exchange code for access token',
  USER_PROFILE_MESSAGE: 'Failed to fetch user details from GitHub',
  INVALID_USER_MESSAGE: 'Invalid user details returned from GitHub',
} as const

import { afterEach, expect, it, vi } from 'vitest'

const { neon } = vi.hoisted(() => ({ neon: vi.fn(() => vi.fn()) }))
vi.mock('@neondatabase/serverless', () => ({ neon }))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  vi.clearAllMocks()
})

it('blocks accidental local development access to Neon before constructing a client', async () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv(
    'DATABASE_URL',
    'postgres://user:password@ep-example-pooler.us-east-2.aws.neon.tech/db'
  )
  vi.stubEnv('GITASCII_ALLOW_NEON_IN_DEVELOPMENT', '')
  const { getDbClient } = await import('./client')
  expect(() => getDbClient()).toThrow('must not wake Neon')
  expect(neon).not.toHaveBeenCalled()
})

it.each([
  ['development', 'localhost', ''],
  ['production', 'ep-example.us-east-2.aws.neon.tech', ''],
  ['development', 'ep-example.us-east-2.aws.neon.tech', 'true'],
])('allows explicit database configuration: %s / %s / opt-in=%s', async (mode, host, optIn) => {
  vi.stubEnv('NODE_ENV', mode)
  vi.stubEnv('DATABASE_URL', `postgres://user:password@${host}/db`)
  vi.stubEnv('GITASCII_ALLOW_NEON_IN_DEVELOPMENT', optIn)
  const { getDbClient } = await import('./client')
  getDbClient()
  getDbClient()
  expect(neon).toHaveBeenCalledTimes(1)
})

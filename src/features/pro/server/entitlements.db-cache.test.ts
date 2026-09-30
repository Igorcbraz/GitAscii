import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getUserPlanTierFromDb,
  getUserSettingsFromDb,
  updateUserSettingsInDb,
} from '@/lib/db/repositories/userRepository'

import {
  getProEntitlements,
  getUserSettings,
  invalidateEntitlementsCache,
  updateUserSettings,
} from './entitlements'

const redisRead = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db/client', () => ({ hasDbConfig: () => true }))
vi.mock('@/lib/db/repositories/userRepository', () => ({
  getUserPlanTierFromDb: vi.fn(),
  getUserSettingsFromDb: vi.fn(),
  getUserByStripeCustomerId: vi.fn(),
  updateUserSettingsInDb: vi.fn(),
}))
vi.mock('./redisClient', () => ({ getProRedisClient: () => ({ hgetall: redisRead }) }))

describe('Postgres entitlement reads', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'production')
    invalidateEntitlementsCache()
  })

  it('reuses a short local cache without reading Redis', async () => {
    vi.mocked(getUserPlanTierFromDb).mockResolvedValue('pro')

    expect((await getProEntitlements('Alice')).tier).toBe('pro')
    expect((await getProEntitlements('alice')).tier).toBe('pro')
    expect(getUserPlanTierFromDb).toHaveBeenCalledTimes(1)
    expect(redisRead).not.toHaveBeenCalled()

    invalidateEntitlementsCache('alice')
    await getProEntitlements('alice')
    expect(getUserPlanTierFromDb).toHaveBeenCalledTimes(2)
  })

  it('invalidates settings after the authoritative Postgres update', async () => {
    const original = {
      emailAlertsEnabled: true,
      dailyDigestEnabled: false,
      themePreference: 'system' as const,
      anonymizeReferrers: true,
      publishIntervalMinutes: 1440,
      planTier: 'free' as const,
    }
    const updated = { ...original, themePreference: 'dark' as const }
    vi.mocked(getUserSettingsFromDb).mockResolvedValueOnce(original).mockResolvedValueOnce(updated)
    vi.mocked(updateUserSettingsInDb).mockResolvedValue(updated)

    expect((await getUserSettings('Alice')).themePreference).toBe('system')
    expect((await getUserSettings('alice')).themePreference).toBe('system')
    expect(getUserSettingsFromDb).toHaveBeenCalledTimes(1)
    expect((await updateUserSettings('alice', { themePreference: 'dark' })).themePreference).toBe(
      'dark'
    )
    expect((await getUserSettings('alice')).themePreference).toBe('dark')
    expect(getUserSettingsFromDb).toHaveBeenCalledTimes(2)
    expect(redisRead).not.toHaveBeenCalled()
  })
})

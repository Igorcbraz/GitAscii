import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { loadProfileConfig, saveProfileConfig } from '@/lib/profileStorage'

import { REDIS_KEYS } from './analyticsStore'
import { createProfileVersion, getUserProfiles, restoreProfileVersion } from './profileManagerStore'
import { getProRedisClient, resetProRedisMemoryStoreForTesting } from './redisClient'

vi.mock('@/lib/githubApp', () => ({
  getInstallationTokenForUser: vi.fn().mockResolvedValue({ token: null }),
}))

beforeEach(() => {
  resetProRedisMemoryStoreForTesting()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() => Promise.resolve(Response.json([], { status: 200 })))
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('profile ownership and listing regressions', () => {
  it('binds new and legacy version restores to the owning account', async () => {
    const other = createConfiguration(2, 'other-owner', 'blank')
    other.profileName = 'Unchanged'
    await saveProfileConfig(other)
    const version = await createProfileVersion('version-owner', 'default', { config: other })
    expect(version.config?.username).toBe('version-owner')
    // Simulate a snapshot stored before identity binding was introduced.
    await getProRedisClient().set(
      REDIS_KEYS.profileVersionItem('version-owner', 'default', version.id),
      JSON.stringify({ ...version, config: other })
    )
    await restoreProfileVersion('version-owner', 'default', version.id)
    expect((await loadProfileConfig('other-owner', 'default'))?.profileName).toBe('Unchanged')
    expect((await loadProfileConfig('version-owner', 'default'))?.username).toBe('version-owner')
  })

  it('checks GitHub once for the entire profile list and preserves unpublished status', async () => {
    const redis = getProRedisClient()
    await redis.sadd(REDIS_KEYS.userProfiles('listing-owner'), 'default', 'work', 'draft')
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json([
        { type: 'file', name: 'gitascii.json' },
        { type: 'file', name: 'gitascii_work.json' },
      ])
    )
    const profiles = await getUserProfiles('listing-owner')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(profiles.find((p) => p.slug === 'work')?.isSynced).toBe(true)
    expect(profiles.find((p) => p.slug === 'draft')?.isSynced).toBe(false)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getProfileConfigFromDb,
  saveProfileConfigInDb,
} from '@/lib/db/repositories/profileRepository'

import { loadProfileConfig } from './profileStorage'

const redisRead = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db/client', () => ({ hasDbConfig: () => true }))
vi.mock('@/lib/db/repositories/profileRepository', () => ({
  getProfileConfigFromDb: vi.fn(),
  saveProfileConfigInDb: vi.fn(),
}))
vi.mock('@/features/pro/server/redisClient', () => ({
  getProRedisClient: () => ({ get: redisRead }),
}))
vi.mock('@/services/profileSvgCache', () => ({ invalidateSvgCache: vi.fn() }))

describe('profile configuration during a Postgres outage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('serves the GitHub fallback without overwriting the authoritative configuration', async () => {
    vi.mocked(getProfileConfigFromDb).mockRejectedValue(new Error('Postgres unavailable'))
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ widgets: [] }), { status: 200 }))
    )

    const config = await loadProfileConfig('outage-user', 'default')

    expect(config?.username).toBe('outage-user')
    expect(redisRead).not.toHaveBeenCalled()
    expect(saveProfileConfigInDb).not.toHaveBeenCalled()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CounterStore } from './__tests__/counterStore'

const mocks = vi.hoisted(() => ({
  proUsers: vi.fn(),
  count: vi.fn(),
  store: null as CounterStore | null,
}))
vi.mock('@upstash/redis', () => ({
  Redis: class {
    constructor() {
      return mocks.store!
    }
  },
}))
vi.mock('@/lib/db/client', () => ({ hasDbConfig: () => true }))
vi.mock('@/lib/db/repositories/userRepository', () => ({
  getProUsersFromDb: mocks.proUsers,
  getUserCountFromDb: mocks.count,
}))

describe('public counter integration with the repository boundary', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.store = new CounterStore()
    mocks.count.mockResolvedValue(426)
    mocks.proUsers.mockResolvedValue(['alice'])
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.invalid')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-only')
    vi.stubEnv('GITHUB_CLIENT_ID', '')
    vi.stubEnv('GITHUB_CLIENT_SECRET', '')
    vi.stubEnv('PRO_USERNAMES', '')
    vi.stubEnv('PRO_ADMIN_USERS', '')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('loads each counter once across module reloads and five-minute landing refreshes', async () => {
    for (let i = 0; i < 12; i++) {
      vi.resetModules()
      const counters = await import('./socialProofStore')
      expect(await counters.getLoggedInUsersCount()).toBe(426)
      expect(await counters.getProSocialProof()).toEqual({ count: 1, usernames: ['alice'] })
      vi.advanceTimersByTime(300_000)
    }
    expect(mocks.count).toHaveBeenCalledTimes(1)
    expect(mocks.proUsers).toHaveBeenCalledTimes(1)
    const counters = await import('./socialProofStore')
    await counters.getLoggedInUsersCount()
    await counters.getProSocialProof()
    expect(mocks.count).toHaveBeenCalledTimes(2)
    expect(mocks.proUsers).toHaveBeenCalledTimes(2)
  })

  it('caches zero and empty lists across workers', async () => {
    mocks.count.mockResolvedValue(0)
    mocks.proUsers.mockResolvedValue([])
    for (let i = 0; i < 10; i++) {
      vi.resetModules()
      const counters = await import('./socialProofStore')
      expect(await counters.getLoggedInUsersCount()).toBe(0)
      expect(await counters.getProSocialProof()).toEqual({ count: 0, usernames: [] })
    }
    expect(mocks.count).toHaveBeenCalledTimes(1)
    expect(mocks.proUsers).toHaveBeenCalledTimes(1)
  })

  it.each(['missing-config', 'redis-offline'])(
    'makes zero repository calls with %s',
    async (mode) => {
      if (mode === 'missing-config') vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
      else mocks.store!.failReads = true
      for (let i = 0; i < 10; i++) {
        vi.resetModules()
        const counters = await import('./socialProofStore')
        await counters.getLoggedInUsersCount()
        await counters.getProSocialProof()
      }
      expect(mocks.count).not.toHaveBeenCalled()
      expect(mocks.proUsers).not.toHaveBeenCalled()
    }
  )

  it('preserves the last good count through a database outage', async () => {
    const counters = await import('./socialProofStore')
    await counters.getLoggedInUsersCount()
    vi.advanceTimersByTime(3_600_000)
    mocks.count.mockRejectedValue(new Error('DB unavailable'))
    expect(await counters.getLoggedInUsersCount()).toBe(426)
    vi.resetModules()
    expect(await (await import('./socialProofStore')).getLoggedInUsersCount()).toBe(426)
    expect(mocks.count).toHaveBeenCalledTimes(2)
  })
})

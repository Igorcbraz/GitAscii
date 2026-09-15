import { beforeEach, describe, expect, it, vi } from 'vitest'

const redis = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
  get: vi.fn(async (key: string) => redis.values.get(key) ?? null),
  set: vi.fn(async (key: string, value: unknown) => {
    redis.values.set(key, value)
    return 'OK'
  }),
}))

vi.mock('@/features/pro/server/redisClient', () => ({ getProRedisClient: () => redis }))
vi.mock('@/lib/auth', () => ({ getSession: vi.fn(async () => null) }))

const user = {
  login: 'octocat',
  id: 1,
  public_repos: 1,
}

const repo = {
  name: 'hello-world',
  fork: false,
  language: 'TypeScript',
  stargazers_count: 1,
  forks_count: 0,
}

describe('fetchGitHubProfile public resilience', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    redis.values.clear()
    delete process.env.GITHUB_TOKEN
  })

  it('persists complete public data for other Worker instances', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify(user), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify([repo]), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    )

    const { fetchGitHubProfile } = await import('./fetchProfile')
    const result = await fetchGitHubProfile('Octocat', { publicOnly: true })

    expect(result.languages).toEqual({ TypeScript: 1 })
    expect(redis.set).toHaveBeenCalledWith('github-profile:v1:octocat', expect.any(String), {
      ex: 604800,
    })
  }, 15000)

  it('uses stale complete data when GitHub rate-limits repositories', async () => {
    redis.values.set(
      'github-profile:v1:octocat',
      JSON.stringify({
        data: {
          user,
          repos: [repo],
          languages: { TypeScript: 1 },
          totalStars: 1,
          totalForks: 0,
          contributions: { totalContributions: 0, weeks: [] },
        },
        timestamp: Date.now() - 11 * 60 * 1000,
      })
    )
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(user), { status: 200 }))
        .mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
    )

    const { fetchGitHubProfile } = await import('./fetchProfile')
    const result = await fetchGitHubProfile('Octocat', { publicOnly: true })

    expect(result.repos).toHaveLength(1)
    expect(result.languages).toEqual({ TypeScript: 1 })
  })
})

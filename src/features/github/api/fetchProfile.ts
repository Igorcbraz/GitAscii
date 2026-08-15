import { API_ENDPOINTS } from '@/services/endpoints'

import { getSession } from '../../../lib/auth'
import type { GitHubRepo, GitHubUser, NormalizedGitHubData } from '../types/github'
import { generateMockContributions, getMockGitHubData } from './mockProfile'

interface CacheEntry {
  data: NormalizedGitHubData
  timestamp: number
}

const profileCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes cache

export async function fetchGitHubProfile(username: string): Promise<NormalizedGitHubData> {
  const cacheKey = username.toLowerCase()
  const cached = profileCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const session = await getSession().catch(() => null)
    const token = session?.accessToken || process.env.GITHUB_TOKEN

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    }

    if (token) {
      headers.Authorization = `token ${token}`
    }

    const userRes = await fetch(API_ENDPOINTS.GITHUB.USER_INFO(username), {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })

    if (!userRes.ok) {
      if (userRes.status === 404) {
        throw new Error(`GitHub user '${username}' not found.`)
      }
      return getMockGitHubData(username)
    }

    const user: GitHubUser = await userRes.json()

    const reposRes = await fetch(
      `${API_ENDPOINTS.GITHUB.USER_INFO(username)}/repos?sort=updated&per_page=30`,
      {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      }
    )

    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : []

    const languages: Record<string, number> = {}
    let totalStars = 0
    let totalForks = 0

    repos.forEach((repo) => {
      if (!repo.fork) {
        totalStars += repo.stargazers_count || 0
        totalForks += repo.forks_count || 0
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1
        }
      }
    })

    const result: NormalizedGitHubData = {
      user,
      repos: repos.filter((r) => !r.fork).slice(0, 6),
      languages,
      totalStars,
      totalForks,
      readmeContent: null,
      contributions: generateMockContributions(),
    }

    if (token) {
      try {
        const gqlQuery = {
          query: `
            query($username: String!) {
              user(login: $username) {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        color
                        contributionCount
                        date
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username },
        }

        const gqlRes = await fetch(API_ENDPOINTS.GITHUB.GRAPHQL, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(gqlQuery),
        })

        if (gqlRes.ok) {
          const gqlData = await gqlRes.json()
          const calendar = gqlData?.data?.user?.contributionsCollection?.contributionCalendar
          if (calendar) {
            result.contributions = {
              totalContributions: calendar.totalContributions,
              weeks: calendar.weeks,
            }
          }
        }
      } catch (gqlErr) {
        console.warn('Failed to fetch contributions via GraphQL:', gqlErr)
      }
    }

    try {
      const readmeRes = await fetch(API_ENDPOINTS.GITHUB.RAW_PROFILE_README(username, 'main'), {
        signal: AbortSignal.timeout(4000),
      })
      if (readmeRes.ok) {
        result.readmeContent = await readmeRes.text()
      } else {
        const readmeResMaster = await fetch(
          API_ENDPOINTS.GITHUB.RAW_PROFILE_README(username, 'master'),
          { signal: AbortSignal.timeout(4000) }
        )
        if (readmeResMaster.ok) {
          result.readmeContent = await readmeResMaster.text()
        }
      }
    } catch (e) {
      console.warn('Failed to fetch README for', username, e)
    }

    profileCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    return result
  } catch (error) {
    console.warn("Falling back to mock data for user '%s':", username, error)
    return getMockGitHubData(username)
  }
}

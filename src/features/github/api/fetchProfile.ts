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

export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user '${username}' not found.`)
    this.name = 'GitHubUserNotFoundError'
  }
}

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
        throw new GitHubUserNotFoundError(username)
      }
      return getMockGitHubData(username)
    }

    const user: GitHubUser = await userRes.json()

    const reposRes = await fetch(
      `${API_ENDPOINTS.GITHUB.USER_INFO(username)}/repos?sort=updated&per_page=100`,
      {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.mercy-preview+json, application/vnd.github.v3+json',
        },
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
      socialAccounts: [],
      contributions: generateMockContributions(),
    }

    try {
      const socialRes = await fetch(API_ENDPOINTS.GITHUB.USER_SOCIAL_ACCOUNTS(username), {
        headers,
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(4000),
      })
      if (socialRes.ok) {
        const socialData = await socialRes.json()
        if (Array.isArray(socialData)) {
          result.socialAccounts = socialData
        }
      }
    } catch (socialErr) {
      console.warn('Failed to fetch social accounts for', username, socialErr)
    }

    if (token) {
      try {
        const gqlQuery = {
          query: `
            query($username: String!) {
              user(login: $username) {
                socialAccounts(first: 20) {
                  nodes {
                    provider
                    url
                  }
                }
                repositories(first: 100, ownerAffiliations: [OWNER], orderBy: {field: UPDATED_AT, direction: DESC}) {
                  nodes {
                    name
                    description
                    stargazerCount
                    forkCount
                    repositoryTopics(first: 10) {
                      nodes {
                        topic {
                          name
                        }
                      }
                    }
                    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                      nodes {
                        name
                      }
                    }
                  }
                }
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
          signal: AbortSignal.timeout(8000),
        })

        if (gqlRes.ok) {
          const gqlData = await gqlRes.json()
          const gqlSocials = gqlData?.data?.user?.socialAccounts?.nodes
          if (
            Array.isArray(gqlSocials) &&
            gqlSocials.length > 0 &&
            (!result.socialAccounts || result.socialAccounts.length === 0)
          ) {
            result.socialAccounts = gqlSocials
          }

          const gqlRepos = gqlData?.data?.user?.repositories?.nodes
          if (Array.isArray(gqlRepos)) {
            gqlRepos.forEach((r: any) => {
              const langNodes = r.languages?.nodes || []
              langNodes.forEach((l: any) => {
                if (l.name) {
                  result.languages[l.name] = (result.languages[l.name] || 0) + 1
                }
              })
              const topicNodes = r.repositoryTopics?.nodes || []
              const topics = topicNodes.map((t: any) => t.topic?.name).filter(Boolean)
              if (topics.length > 0) {
                const existing = result.repos.find((er) => er.name === r.name)
                if (existing) {
                  existing.topics = topics
                }
              }
            })
          }

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
        } else {
          const apiReadmeRes = await fetch(API_ENDPOINTS.GITHUB.REPO_README(username, username), {
            headers: { ...headers, Accept: 'application/vnd.github.raw' },
            signal: AbortSignal.timeout(4000),
          })
          if (apiReadmeRes.ok) {
            result.readmeContent = await apiReadmeRes.text()
          }
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
    if (error instanceof GitHubUserNotFoundError) {
      throw error
    }
    console.warn("Falling back to mock data for user '%s':", username, error)
    return getMockGitHubData(username)
  }
}

import { getProRedisClient } from '@/features/pro/server/redisClient'
import { API_ENDPOINTS } from '@/services/endpoints'

import { getSession } from '../../../lib/auth'
import type { GitHubRepo, GitHubUser, NormalizedGitHubData } from '../types/github'
import {
  calculateDerivedInsights,
  calculateLanguageBreakdown,
  calculateTemporalHabits,
} from '../utils/insightsCalculator'
import {
  calculateCodingVelocity,
  calculateDeveloperDNA,
  calculateDeveloperScores,
} from '../utils/scoreCalculator'
import { generateMockContributions, getMockGitHubData } from './mockProfile'

interface CacheEntry {
  data: NormalizedGitHubData
  timestamp: number
}

const profileCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes cache
const PERSISTENT_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60
const PERSISTENT_CACHE_PREFIX = 'github-profile:v1'

interface PersistentProfileEntry {
  data: NormalizedGitHubData
  timestamp: number
}

function isUsableProfile(
  data: NormalizedGitHubData | null | undefined
): data is NormalizedGitHubData {
  if (!data?.user?.login || !Array.isArray(data.repos)) return false
  return !(Number(data.user.public_repos || 0) > 0 && data.repos.length === 0)
}

async function readPersistentProfile(username: string): Promise<PersistentProfileEntry | null> {
  try {
    const value = await getProRedisClient().get<PersistentProfileEntry>(
      `${PERSISTENT_CACHE_PREFIX}:${username.toLowerCase()}`
    )
    const entry = typeof value === 'string' ? JSON.parse(value) : value
    return entry && isUsableProfile(entry.data) && Number.isFinite(entry.timestamp) ? entry : null
  } catch {
    return null
  }
}

async function persistProfile(username: string, data: NormalizedGitHubData): Promise<void> {
  if (!isUsableProfile(data)) return
  try {
    await getProRedisClient().set(
      `${PERSISTENT_CACHE_PREFIX}:${username.toLowerCase()}`,
      JSON.stringify({ data, timestamp: Date.now() } satisfies PersistentProfileEntry),
      { ex: PERSISTENT_CACHE_TTL_SECONDS }
    )
  } catch {}
}

export class GitHubUserNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user '${username}' not found.`)
    this.name = 'GitHubUserNotFoundError'
  }
}

export async function fetchGitHubProfile(
  username: string,
  options: { publicOnly?: boolean; fresh?: boolean } = {}
): Promise<NormalizedGitHubData> {
  const cacheKey = `${options.publicOnly ? 'public' : 'session'}:${username.toLowerCase()}`
  const cached = profileCache.get(cacheKey)
  if (!options.fresh && cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const persistent = options.publicOnly ? await readPersistentProfile(username) : null
  if (persistent && Date.now() - persistent.timestamp < CACHE_TTL_MS) {
    profileCache.set(cacheKey, persistent)
    return persistent.data
  }

  try {
    const session = options.publicOnly ? null : await getSession().catch(() => null)
    const token = session?.accessToken || process.env.GITHUB_TOKEN

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    }

    if (token) {
      headers.Authorization = `token ${token}`
    }

    const userRequest = fetch(API_ENDPOINTS.GITHUB.USER_INFO(username), {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })
    const reposRequest = fetch(
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

    const [userRes, reposRes] = await Promise.all([userRequest, reposRequest])

    if (!userRes.ok) {
      if (userRes.status === 404) throw new GitHubUserNotFoundError(username)
      if (persistent) return persistent.data
      throw new Error(`GitHub user request failed with HTTP ${userRes.status}`)
    }
    if (!reposRes.ok) {
      if (persistent) return persistent.data
      throw new Error(`GitHub repositories request failed with HTTP ${reposRes.status}`)
    }

    const user: GitHubUser = await userRes.json()

    const repos: GitHubRepo[] = await reposRes.json()

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
      repos: repos.filter((r) => !r.fork),
      languages,
      totalStars,
      totalForks,
      readmeContent: null,
      socialAccounts: [],
      contributions: generateMockContributions(),
    }

    const loadSocial = async () => {
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
        console.warn(
          'Failed to fetch social accounts for',
          username.replace(/[\r\n]/g, ''),
          socialErr
        )
      }
    }

    const loadGraphql = async () => {
      if (!token) return
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

    // Optional enrichments are independent. Running them together keeps a cold
    // public render bounded by the slowest GitHub call instead of their sum.
    await Promise.all([loadSocial(), loadGraphql()])

    if (!options.publicOnly)
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
        console.warn('Failed to fetch README for', username.replace(/[\r\n]/g, ''), e)
      }

    try {
      const languageBreakdown = calculateLanguageBreakdown(result.languages, result.repos)
      const weeks = result.contributions?.weeks || []
      const habits = calculateTemporalHabits(weeks)
      const derivedInsights = calculateDerivedInsights(
        result.user,
        result.repos,
        result.languages,
        habits,
        result.totalStars
      )
      const developerScores = calculateDeveloperScores(
        result.user,
        result.repos,
        result.contributions?.totalContributions || 0,
        weeks,
        result.totalStars,
        result.totalForks,
        result.activityMetrics
      )
      const developerDna = calculateDeveloperDNA(
        result.user,
        result.repos,
        result.contributions?.totalContributions || 0,
        result.totalStars,
        result.languages
      )
      const codingVelocity = calculateCodingVelocity(
        result.activityMetrics,
        result.contributions?.totalContributions || 0
      )

      result.languageBreakdown = languageBreakdown
      result.habits = habits
      result.derivedInsights = derivedInsights
      result.developerScores = developerScores
      result.developerDna = developerDna
      result.codingVelocity = codingVelocity
    } catch (calcErr) {
      console.warn('Failed to calculate derived insights/scores:', calcErr)
    }

    profileCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })
    if (options.publicOnly) await persistProfile(username, result)

    return result
  } catch (error) {
    if (error instanceof GitHubUserNotFoundError) {
      throw error
    }
    if (persistent) return persistent.data
    console.warn("Falling back to mock data for user '%s':", username.replace(/[\r\n]/g, ''), error)
    return getMockGitHubData(username)
  }
}

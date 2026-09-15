import type { GitHubRepo, GitHubUser, NormalizedGitHubData } from '@/features/github/types/github'
import {
  calculateDerivedInsights,
  calculateLanguageBreakdown,
  calculateTemporalHabits,
} from '@/features/github/utils/insightsCalculator'
import {
  calculateCodingVelocity,
  calculateDeveloperDNA,
  calculateDeveloperScores,
} from '@/features/github/utils/scoreCalculator'

export async function fetchGitHubDataForAction(
  username: string,
  token: string
): Promise<NormalizedGitHubData> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitAscii-Action',
    Authorization: `Bearer ${token}`,
  }

  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  })

  if (!userRes.ok) {
    throw new Error(`Failed to fetch user data for ${username} (HTTP ${userRes.status})`)
  }

  const user: GitHubUser = await userRes.json()

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
    {
      headers: {
        ...headers,
        Accept: 'application/vnd.github.mercy-preview+json, application/vnd.github.v3+json',
      },
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
    repos: repos.filter((r) => !r.fork),
    languages,
    totalStars,
    totalForks,
    readmeContent: null,
    socialAccounts: [],
    contributions: { totalContributions: 0, weeks: [] },
  }

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
            repositories(first: 100, privacy: PUBLIC, ownerAffiliations: [OWNER], orderBy: {field: UPDATED_AT, direction: DESC}) {
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

    const gqlRes = await fetch('https://api.github.com/graphql', {
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
      const calendar = gqlData?.data?.user?.contributionsCollection?.contributionCalendar
      if (calendar) {
        result.contributions = {
          totalContributions: calendar.totalContributions,
          weeks: calendar.weeks,
        }
      }

      const gqlSocials = gqlData?.data?.user?.socialAccounts?.nodes
      if (Array.isArray(gqlSocials) && gqlSocials.length > 0) {
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
    }
  } catch (gqlErr) {
    console.warn('Action GraphQL fetch warning:', gqlErr)
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
    console.warn('Action calculation warning:', calcErr)
  }

  return result
}

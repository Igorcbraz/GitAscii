import { getSession } from '../../../lib/auth'
import type { GitHubRepo, GitHubUser, NormalizedGitHubData } from '../types/github'
import { getMockGitHubData } from './mockProfile'

const GITHUB_API_BASE = 'https://api.github.com'

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

    const userRes = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
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
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
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
    }

    try {
      const encodedUser = encodeURIComponent(username)
      const readmeRes = await fetch(
        `https://raw.githubusercontent.com/${encodedUser}/${encodedUser}/main/README.md`,
        { signal: AbortSignal.timeout(4000) }
      )
      if (readmeRes.ok) {
        result.readmeContent = await readmeRes.text()
      } else {
        const readmeResMaster = await fetch(
          `https://raw.githubusercontent.com/${encodedUser}/${encodedUser}/master/README.md`,
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

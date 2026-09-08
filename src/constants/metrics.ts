import { templateList } from '@/data/templatesData'
import { getStoredProfiles } from '@/features/explore/getCommunityProfiles'
import { getLoggedInUsersCount, getProSocialProof } from '@/features/pro/server/socialProofStore'
import { getAppInstallations } from '@/lib/githubApp'
import { API_ENDPOINTS } from '@/services/endpoints'

import { WIDGET_IDS } from './widgetIds'

export interface LandingMetrics {
  stars: number
  users: number
  readmes: number
  templates: number
  widgets: number
  profiles: number
  proCustomers: number
  proUsernames: string[]
  loggedInUsers: number
}

export const TEMPLATES_COUNT = templateList?.length || 18
export const WIDGETS_COUNT = Object.keys(WIDGET_IDS).length || 70

export const DEFAULT_LANDING_METRICS: LandingMetrics = {
  stars: 173,
  users: 15,
  readmes: 24,
  templates: TEMPLATES_COUNT,
  widgets: WIDGETS_COUNT,
  profiles: 7,
  proCustomers: 0,
  proUsernames: [],
  loggedInUsers: 0,
}

export async function fetchLandingMetrics(): Promise<LandingMetrics> {
  let stars = DEFAULT_LANDING_METRICS.stars
  let users = DEFAULT_LANDING_METRICS.users
  let profilesCount = DEFAULT_LANDING_METRICS.profiles
  let readmes = DEFAULT_LANDING_METRICS.readmes
  let proCustomers = DEFAULT_LANDING_METRICS.proCustomers
  let proUsernames = DEFAULT_LANDING_METRICS.proUsernames
  let loggedInUsers = DEFAULT_LANDING_METRICS.loggedInUsers

  try {
    const [starRes, installations, storedProfiles, socialProofRes, loggedInRes] =
      await Promise.allSettled([
        fetch(API_ENDPOINTS.GITHUB.GITASCII_REPO, {
          headers: {
            'User-Agent': 'GitAscii-App',
            Accept: 'application/vnd.github.v3+json',
          },
          next: { revalidate: 300 },
          signal: AbortSignal.timeout(3000),
        }),
        getAppInstallations(),
        getStoredProfiles(),
        getProSocialProof(),
        getLoggedInUsersCount(),
      ])

    if (starRes.status === 'fulfilled' && starRes.value.ok) {
      const repoData = await starRes.value.json()
      if (typeof repoData?.stargazers_count === 'number' && repoData.stargazers_count > 0) {
        stars = repoData.stargazers_count
      }
    }

    if (
      installations.status === 'fulfilled' &&
      Array.isArray(installations.value) &&
      installations.value.length > 0
    ) {
      users = Math.max(DEFAULT_LANDING_METRICS.users, installations.value.length)
    }

    if (storedProfiles.status === 'fulfilled' && Array.isArray(storedProfiles.value)) {
      profilesCount = Math.max(DEFAULT_LANDING_METRICS.profiles, storedProfiles.value.length)
      readmes = Math.max(DEFAULT_LANDING_METRICS.readmes, profilesCount * 3)
      if (users < profilesCount) {
        users = profilesCount
      }
    }

    if (socialProofRes.status === 'fulfilled') {
      proCustomers = socialProofRes.value.count
      proUsernames = socialProofRes.value.usernames
    }

    if (loggedInRes.status === 'fulfilled' && loggedInRes.value > 0) {
      loggedInUsers = loggedInRes.value
      users = Math.max(users, loggedInUsers)
    }
  } catch (error) {
    console.warn('Failed to fetch dynamic landing metrics, using fallbacks:', error)
  }

  return {
    stars,
    users,
    readmes,
    templates: TEMPLATES_COUNT,
    widgets: WIDGETS_COUNT,
    profiles: profilesCount,
    proCustomers,
    proUsernames,
    loggedInUsers,
  }
}

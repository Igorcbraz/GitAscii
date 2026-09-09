import { unstable_cache } from 'next/cache'

import type { SavedConfiguration } from '@/engine/types'
import { getAppInstallations } from '@/lib/githubApp'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { CommunityProfileItem } from './constants'

export type { CommunityProfileItem }

function parseConfigToProfileItem(config: SavedConfiguration): CommunityProfileItem | null {
  if (!config || !config.username) return null

  const asciiWidget = config.widgets?.find(
    (w) =>
      w.widgetId === 'ascii-art' &&
      Array.isArray((w.config as Record<string, unknown>)?.asciiText) &&
      ((w.config as Record<string, unknown>).asciiText as unknown[]).length > 0
  )

  return {
    username: config.username,
    profileSlug: config.profileSlug || 'default',
    templateId: config.templateId || 'terminal',
    widgetsCount: config.widgets?.length || 0,
    hasAsciiArt: Boolean(asciiWidget),
    tags: [
      config.templateId || 'terminal',
      asciiWidget ? 'ASCII Art' : 'SVG Widgets',
      'Verified Data',
    ],
    isStored: true,
  }
}

async function fetchConfigFromUrl(url: string): Promise<SavedConfiguration | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(3000),
    })

    if (!res.ok) return null
    const text = await res.text()
    const config = JSON.parse(text)
    if (config && typeof config === 'object' && Array.isArray(config.widgets)) {
      return config as SavedConfiguration
    }
  } catch {
    // Non-blocking fetch error
  }
  return null
}

async function fetchUserGitAscii(username: string): Promise<SavedConfiguration | null> {
  const urls = [
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', 'gitascii.json'),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', '.github/gitascii.json'),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', 'gitascii.json'),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', '.github/gitascii.json'),
  ]

  for (const url of urls) {
    const config = await fetchConfigFromUrl(url)
    if (config) return config
  }

  return null
}

export const getStoredProfiles = unstable_cache(
  async (): Promise<CommunityProfileItem[]> => {
    const profileMap = new Map<string, CommunityProfileItem>()
    const installedUsers = await getAppInstallations()

    const chunkSize = 10
    for (let i = 0; i < installedUsers.length; i += chunkSize) {
      const chunk = installedUsers.slice(i, i + chunkSize)
      await Promise.allSettled(
        chunk.map(async (username) => {
          try {
            const config = await fetchUserGitAscii(username)
            if (!config) return
            const profileItem = parseConfigToProfileItem(config)
            if (profileItem) {
              profileMap.set(profileItem.username.toLowerCase(), profileItem)
            }
          } catch (e) {
            console.warn(`Failed to load profile for ${username}:`, e)
          }
        })
      )
    }

    return Array.from(profileMap.values())
  },
  ['community-profiles'],
  { revalidate: 600 }
)

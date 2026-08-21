import type { SavedConfiguration } from '@/engine/types'
import { getAppInstallations } from '@/lib/githubApp'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface CommunityProfileItem {
  username: string
  profileSlug: string
  templateId: string
  widgetsCount: number
  hasAsciiArt: boolean
  tags: string[]
  isStored: boolean
}

const DEFAULT_SEED_USERS = [
  'Igorcbraz',
  'shadcn',
  'leerob',
  'antfu',
  'sindresorhus',
  'developit',
  'torvalds',
]

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
      next: { revalidate: 1800 },
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

  const results = await Promise.allSettled(urls.map((url) => fetchConfigFromUrl(url)))
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      return r.value
    }
  }

  return null
}

let cachedProfiles: { data: CommunityProfileItem[]; timestamp: number } | null = null
const PROFILES_CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

export async function getStoredProfiles(): Promise<CommunityProfileItem[]> {
  if (cachedProfiles && Date.now() - cachedProfiles.timestamp < PROFILES_CACHE_TTL_MS) {
    return cachedProfiles.data
  }

  const profileMap = new Map<string, CommunityProfileItem>()

  const installedUsers = await getAppInstallations()
  const candidateUsers = Array.from(new Set([...installedUsers, ...DEFAULT_SEED_USERS]))

  const fetchPromises = candidateUsers.map(async (username) => {
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

  await Promise.allSettled(fetchPromises)

  const result = Array.from(profileMap.values())
  cachedProfiles = { data: result, timestamp: Date.now() }

  return result
}

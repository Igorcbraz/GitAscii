import type { SavedConfiguration } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'

import { profileRepository } from './profileRepository'

const memoryCache = new Map<string, SavedConfiguration>()

export async function saveProfileConfig(config: SavedConfiguration): Promise<void> {
  const username = config.username.toLowerCase()
  const slug = (config.profileSlug || 'default').toLowerCase()
  const cacheKey = `${username}_${slug}`

  await profileRepository.save(config)

  memoryCache.set(cacheKey, config)
}

async function fetchConfigFromGitHub(
  username: string,
  slug: string
): Promise<SavedConfiguration | null> {
  const filename = slug === 'default' ? 'gitascii.json' : `gitascii_${slug.toLowerCase()}.json`
  const urls = [
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', filename),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', `.github/${filename}`),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', filename),
    API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', `.github/${filename}`),
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        next: { revalidate: 60 },
      })
      if (res.ok) {
        const text = await res.text()
        try {
          const config = JSON.parse(text)
          if (config && typeof config === 'object') {
            return config as SavedConfiguration
          }
        } catch {
          // Response is not valid JSON (e.g. XML/HTML error or 404 payload)
        }
      }
    } catch {
      // Continue to next URL
    }
  }
  return null
}

export async function loadProfileConfig(
  username: string,
  slug: string
): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase()
  const slugLower = slug.toLowerCase()
  const cacheKey = `${usernameLower}_${slugLower}`

  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null
  }

  let config = await profileRepository.get(usernameLower, slugLower)

  if (!config) {
    config = await fetchConfigFromGitHub(username, slugLower)
  }

  if (config) {
    memoryCache.set(cacheKey, config)
  }
  return config
}

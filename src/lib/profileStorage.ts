import type { SavedConfiguration } from '@/engine/types'
import { REDIS_KEYS } from '@/features/pro/server/analyticsStore'
import { getProRedisClient } from '@/features/pro/server/redisClient'
import {
  getProfileConfigFromDb,
  saveProfileConfigInDb,
} from '@/lib/db/repositories/profileRepository'
import { API_ENDPOINTS } from '@/services/endpoints'
import { invalidateSvgCache } from '@/services/profileSvgCache'

interface CacheEntry {
  config: SavedConfiguration
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry>()
const MEMORY_CACHE_TTL_MS = 60 * 1000 // 60 seconds TTL

export async function invalidateProfileConfig(
  username: string,
  slug: string = 'default'
): Promise<void> {
  const usernameLower = username.toLowerCase()
  const slugLower = slug.toLowerCase()
  memoryCache.delete(`${usernameLower}_${slugLower}`)
  try {
    const redis = getProRedisClient()
    const configKey = REDIS_KEYS.profileConfig(usernameLower, slugLower)
    await redis.del(configKey)
  } catch {}
  await invalidateSvgCache(usernameLower)
}

export function cacheProfileConfig(config: SavedConfiguration): void {
  const username = config.username.toLowerCase()
  const slug = (config.profileSlug || 'default').toLowerCase()
  const cacheKey = `${username}_${slug}`

  memoryCache.set(cacheKey, {
    config,
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })
}

export async function saveProfileConfig(config: SavedConfiguration): Promise<void> {
  cacheProfileConfig(config)
  const username = config.username.toLowerCase()
  const slug = (config.profileSlug || 'default').toLowerCase()

  await saveProfileConfigInDb(username, slug, config)

  try {
    const redis = getProRedisClient()
    const configKey = REDIS_KEYS.profileConfig(username, slug)
    await redis.set(configKey, JSON.stringify(config))
  } catch (err) {
    console.warn('[ProfileStorage] Failed to persist config to Redis:', err)
  }

  await invalidateSvgCache(username)
}

async function fetchConfigFromGitHub(
  username: string,
  slug: string
): Promise<SavedConfiguration | null> {
  const filename = slug === 'default' ? 'gitascii.json' : `gitascii_${slug.toLowerCase()}.json`
  const timestamp = Date.now()
  const urls = [
    `${API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', filename)}?t=${timestamp}`,
    `${API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'main', `.github/${filename}`)}?t=${timestamp}`,
    `${API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', filename)}?t=${timestamp}`,
    `${API_ENDPOINTS.GITHUB.RAW_PROFILE_FILE(username, 'master', `.github/${filename}`)}?t=${timestamp}`,
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      })
      if (!res.ok) {
        continue
      }
      const text = await res.text()
      try {
        const config = JSON.parse(text)
        if (config && typeof config === 'object' && Array.isArray(config.widgets)) {
          return config as SavedConfiguration
        }
      } catch (parseError) {
        console.warn(`Failed to parse profile JSON from ${url}:`, parseError)
      }
    } catch (fetchError) {
      console.warn(`Failed to fetch profile configuration from ${url}:`, fetchError)
    }
  }
  return null
}

export async function loadProfileConfig(
  username: string,
  slug: string,
  options: { bypassMemory?: boolean; preferGitHub?: boolean } = {}
): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase()
  const slugLower = slug.toLowerCase()
  const cacheKey = `${usernameLower}_${slugLower}`

  if (options.preferGitHub) {
    const githubConfig = await fetchConfigFromGitHub(username, slugLower)
    if (githubConfig) {
      memoryCache.set(cacheKey, {
        config: githubConfig,
        expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
      })
      try {
        const redis = getProRedisClient()
        await redis.set(
          REDIS_KEYS.profileConfig(usernameLower, slugLower),
          JSON.stringify(githubConfig)
        )
      } catch {}
      return githubConfig
    }
  }

  const cached = memoryCache.get(cacheKey)
  if (!options.bypassMemory && cached && cached.expiresAt > Date.now()) {
    return cached.config
  }

  try {
    const redis = getProRedisClient()
    const configKey = REDIS_KEYS.profileConfig(usernameLower, slugLower)
    const redisData = await redis.get<string | SavedConfiguration>(configKey)
    if (redisData) {
      const parsedConfig =
        typeof redisData === 'string' ? (JSON.parse(redisData) as SavedConfiguration) : redisData
      if (parsedConfig && Array.isArray(parsedConfig.widgets)) {
        memoryCache.set(cacheKey, {
          config: parsedConfig,
          expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
        })
        return parsedConfig
      }
    }
  } catch (err) {
    console.warn('[ProfileStorage] Error reading config from Redis:', err)
  }

  try {
    const dbConfig = await getProfileConfigFromDb(usernameLower, slugLower)
    if (dbConfig && Array.isArray(dbConfig.widgets)) {
      memoryCache.set(cacheKey, {
        config: dbConfig,
        expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
      })
      try {
        const redis = getProRedisClient()
        const configKey = REDIS_KEYS.profileConfig(usernameLower, slugLower)
        await redis.set(configKey, JSON.stringify(dbConfig))
      } catch {}
      return dbConfig
    }
  } catch (dbErr) {
    console.warn('[ProfileStorage] Error reading config from PostgreSQL:', dbErr)
  }

  const config = await fetchConfigFromGitHub(username, slugLower)

  if (config) {
    memoryCache.set(cacheKey, {
      config,
      expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
    })

    try {
      const redis = getProRedisClient()
      const configKey = REDIS_KEYS.profileConfig(usernameLower, slugLower)
      void redis.set(configKey, JSON.stringify(config)).catch(() => {})
    } catch {}
  } else {
    memoryCache.delete(cacheKey)
  }
  return config
}

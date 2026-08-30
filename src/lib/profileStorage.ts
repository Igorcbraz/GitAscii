import type { SavedConfiguration } from '@/engine/types'
import { REDIS_KEYS } from '@/features/pro/server/analyticsStore'
import { getProRedisClient } from '@/features/pro/server/redisClient'
import { API_ENDPOINTS } from '@/services/endpoints'
import { invalidateSvgCache } from '@/services/profileSvgService'

interface CacheEntry {
  config: SavedConfiguration
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry>()
const MEMORY_CACHE_TTL_MS = 60 * 1000 // 60 seconds TTL

export function invalidateProfileConfig(username: string, slug: string = 'default'): void {
  const usernameLower = username.toLowerCase()
  const slugLower = slug.toLowerCase()
  memoryCache.delete(`${usernameLower}_${slugLower}`)
  try {
    const redis = getProRedisClient()
    const configKey = REDIS_KEYS.profileConfig(usernameLower, slugLower)
    void redis.del(configKey).catch(() => {})
  } catch {}
  invalidateSvgCache(usernameLower)
}

export function cacheProfileConfig(config: SavedConfiguration): void {
  const username = config.username.toLowerCase()
  const slug = (config.profileSlug || 'default').toLowerCase()
  const cacheKey = `${username}_${slug}`

  memoryCache.set(cacheKey, {
    config,
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })
  invalidateSvgCache(username)
}

export async function saveProfileConfig(config: SavedConfiguration): Promise<void> {
  cacheProfileConfig(config)
  try {
    const redis = getProRedisClient()
    const username = config.username.toLowerCase()
    const slug = (config.profileSlug || 'default').toLowerCase()
    const configKey = REDIS_KEYS.profileConfig(username, slug)
    await redis.set(configKey, JSON.stringify(config))
  } catch (err) {
    console.warn('[ProfileStorage] Failed to persist config to Redis:', err)
  }
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
  slug: string
): Promise<SavedConfiguration | null> {
  const usernameLower = username.toLowerCase()
  const slugLower = slug.toLowerCase()
  const cacheKey = `${usernameLower}_${slugLower}`

  const cached = memoryCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
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

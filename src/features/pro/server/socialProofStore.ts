import { hasDbConfig } from '@/lib/db/client'
import { getProUsersFromDb, getUserCountFromDb } from '@/lib/db/repositories/userRepository'
import { API_ENDPOINTS } from '@/services/endpoints'

import { createPublicCounterCache } from './publicCounterCache'
import { getProRedisClient } from './redisClient'

export interface ProSocialProofData {
  count: number
  usernames: string[]
}

async function loadProSocialProof(): Promise<ProSocialProofData> {
  const proUsers: string[] = []
  const proUsersSet = new Set<string>()

  if (hasDbConfig()) {
    const dbProUsers = await getProUsersFromDb()
    for (const u of dbProUsers) {
      const normalized = u.toLowerCase().trim()
      if (normalized && !proUsersSet.has(normalized)) {
        proUsersSet.add(normalized)
        proUsers.push(normalized)
      }
    }
  }

  const envProUsers = (process.env.PRO_USERNAMES || process.env.PRO_ADMIN_USERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  for (const u of envProUsers) {
    if (!proUsersSet.has(u)) {
      proUsersSet.add(u)
      proUsers.push(u)
    }
  }

  if (!hasDbConfig())
    try {
      const redis = getProRedisClient()
      let cursor = 0
      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: 'gitascii:pro:*:settings',
          count: 100,
        })
        cursor = nextCursor

        if (keys.length > 0) {
          const pipeline = redis.pipeline()
          for (const key of keys) {
            pipeline.hget(key, 'planTier')
          }
          const results = await pipeline.exec()

          for (let i = 0; i < keys.length; i++) {
            const planTier = results[i]
            if (planTier === 'pro') {
              const parts = keys[i].split(':')
              if (parts.length >= 4) {
                const extracted = parts[2].toLowerCase()
                if (!proUsersSet.has(extracted)) {
                  proUsersSet.add(extracted)
                  proUsers.push(extracted)
                }
              }
            }
          }
        }
      } while (cursor !== 0)
    } catch (err) {
      console.warn('[SocialProof] Fallback scan failed:', err)
    }

  if (proUsers.length > 0) {
    try {
      await getProRedisClient().sadd('gitascii:pro:customers', ...proUsers)
    } catch {
      console.warn('[SocialProof] Failed to persist customer index')
    }
  }

  return {
    count: proUsers.length,
    usernames: proUsers.slice(0, 8),
  }
}

function validSocialProof(value: unknown): value is ProSocialProofData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<ProSocialProofData>
  return (
    typeof data.count === 'number' &&
    Number.isInteger(data.count) &&
    data.count >= 0 &&
    Array.isArray(data.usernames) &&
    data.usernames.length <= 8 &&
    data.usernames.every((username) => typeof username === 'string')
  )
}

export const getProSocialProof = createPublicCounterCache({
  key: 'gitascii:public:social-proof:v2',
  load: loadProSocialProof,
  valid: validSocialProof,
  fallback: () => ({ count: 0, usernames: [] }),
})

export const getLoggedInUsersCount = createPublicCounterCache({
  key: 'gitascii:public:user-count:v2',
  load: loadLoggedInUsersCount,
  valid: (value): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0,
  fallback: () => 0,
})

async function loadLoggedInUsersCount(): Promise<number> {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (clientId && clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      const res = await fetch(API_ENDPOINTS.GITHUB.OAUTH_GRANTS(clientId), {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'GitAscii-App',
        },
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const link = res.headers.get('link') ?? ''
        const lastMatch = link.match(/[?&]page=(\d+)>;\s*rel="last"/)
        if (lastMatch) return parseInt(lastMatch[1], 10)
        const data = await res.json()
        if (Array.isArray(data)) return data.length
      }
    }
  } catch (error) {
    console.warn('[SocialProof] GitHub OAuth grants lookup failed:', error)
  }

  if (hasDbConfig()) return getUserCountFromDb()

  try {
    const redis = getProRedisClient()
    return await redis.scard('gitascii:all:users')
  } catch (error) {
    console.warn('[SocialProof] Redis user count fallback failed:', error)
  }

  throw new Error('User count unavailable')
}

import type { ProProfileRecord } from '../types/profiles'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gitascii.com'

export async function getUserProfiles(username: string): Promise<ProProfileRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const profilesSetKey = REDIS_KEYS.userProfiles(u)

  let slugs = await redis.smembers(profilesSetKey)

  if (!slugs || slugs.length === 0 || !slugs.includes('default')) {
    await redis.sadd(profilesSetKey, 'default')
    slugs = await redis.smembers(profilesSetKey)
  }

  const profiles: ProProfileRecord[] = []

  for (const slug of slugs) {
    const metaKey = REDIS_KEYS.profileMeta(u, slug)
    const data = await redis.hgetall<any>(metaKey)

    const isDefault = slug === 'default' || data?.isDefault === 'true' || data?.isDefault === true
    const publicUrl = slug === 'default' ? `${APP_URL}/${u}` : `${APP_URL}/${u}/${slug}`
    const rawSvgUrl = slug === 'default' ? `${APP_URL}/${u}.svg` : `${APP_URL}/${u}/${slug}.svg`

    if (data && data.name) {
      profiles.push({
        id: data.id || `prof_${slug}`,
        slug,
        name: data.name,
        description: data.description || '',
        status: data.status || 'active',
        isDefault,
        widgetsCount: Number(data.widgetsCount || 3),
        totalViews: Number(data.totalViews || 0),
        createdAt: data.createdAt || new Date().toISOString(),
        lastUpdated: data.updatedAt || data.lastUpdated || new Date().toISOString(),
        publicUrl,
        rawSvgUrl,
      })
    } else {
      const now = new Date().toISOString()
      const defaultRecord: ProProfileRecord = {
        id: `prof_${slug}`,
        slug,
        name:
          slug === 'default'
            ? 'Primary GitHub Profile'
            : `${slug.charAt(0).toUpperCase() + slug.slice(1)} Profile`,
        description:
          slug === 'default'
            ? 'Main README dashboard displayed on your GitHub profile.'
            : `Custom profile for ${slug}`,
        status: 'active',
        isDefault,
        widgetsCount: 4,
        totalViews: 0,
        createdAt: now,
        lastUpdated: now,
        publicUrl,
        rawSvgUrl,
      }

      await redis.hset(metaKey, {
        id: defaultRecord.id,
        name: defaultRecord.name,
        description: defaultRecord.description,
        status: defaultRecord.status,
        isDefault: String(defaultRecord.isDefault),
        widgetsCount: defaultRecord.widgetsCount,
        totalViews: defaultRecord.totalViews,
        createdAt: defaultRecord.createdAt,
        updatedAt: defaultRecord.lastUpdated,
      })

      profiles.push(defaultRecord)
    }
  }

  return profiles.sort((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return a.name.localeCompare(b.name)
  })
}

export async function createProfile(
  username: string,
  data: { slug: string; name: string; description?: string }
): Promise<ProProfileRecord> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = data.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '')

  if (!cleanSlug) {
    throw new Error('Invalid profile identifier/slug.')
  }

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis.sadd(profilesSetKey, cleanSlug)

  const now = new Date().toISOString()
  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)

  const publicUrl = cleanSlug === 'default' ? `${APP_URL}/${u}` : `${APP_URL}/${u}/${cleanSlug}`
  const rawSvgUrl =
    cleanSlug === 'default' ? `${APP_URL}/${u}.svg` : `${APP_URL}/${u}/${cleanSlug}.svg`

  const record: ProProfileRecord = {
    id: `prof_${cleanSlug}`,
    slug: cleanSlug,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    status: 'active',
    isDefault: false,
    widgetsCount: 1,
    totalViews: 0,
    createdAt: now,
    lastUpdated: now,
    publicUrl,
    rawSvgUrl,
  }

  await redis.hset(metaKey, {
    id: record.id,
    name: record.name,
    description: record.description,
    status: record.status,
    isDefault: 'false',
    widgetsCount: record.widgetsCount,
    totalViews: 0,
    createdAt: now,
    updatedAt: now,
  })

  return record
}

export async function updateProfile(
  username: string,
  slug: string,
  updates: Partial<ProProfileRecord>
): Promise<ProProfileRecord | null> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)

  const existing = await redis.hgetall<any>(metaKey)
  if (!existing) return null

  const now = new Date().toISOString()
  const payload: Record<string, any> = {
    updatedAt: now,
  }

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.widgetsCount !== undefined) payload.widgetsCount = updates.widgetsCount
  if (updates.isDefault !== undefined) payload.isDefault = String(updates.isDefault)

  await redis.hset(metaKey, payload)

  const profiles = await getUserProfiles(username)
  return profiles.find((p) => p.slug === cleanSlug) || null
}

export async function deleteProfile(username: string, slug: string): Promise<boolean> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  if (cleanSlug === 'default') {
    throw new Error('The default profile cannot be deleted.')
  }

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis.srem(profilesSetKey, cleanSlug)

  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)
  await redis.del(metaKey)

  return true
}

import type { SavedConfiguration, WidgetInstance } from '@/engine/types'
import { loadProfileConfig, saveProfileConfig } from '@/lib/profileStorage'

import type { ProfileVersionRecord, ProProfileRecord } from '../types/profiles'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gitascii.com'
const MAX_VERSIONS_PER_PROFILE = 20

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

    const isDefault =
      data?.isDefault === 'true' ||
      data?.isDefault === true ||
      (slug === 'default' && data?.isDefault !== 'false')
    const publicUrl = slug === 'default' ? `${APP_URL}/${u}` : `${APP_URL}/${u}/${slug}`
    const rawSvgUrl = slug === 'default' ? `${APP_URL}/${u}.svg` : `${APP_URL}/${u}/${slug}.svg`

    const versionsListKey = REDIS_KEYS.profileVersions(u, slug)
    const versionIds = await redis.zrange<string[]>(versionsListKey, 0, -1).catch(() => [])
    const versionCount = versionIds?.length || 1

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
        versionCount,
        healthStatus: (data.healthStatus as any) || 'operational',
        renderSuccessRate: data.renderSuccessRate ? Number(data.renderSuccessRate) : 100,
        lastRenderDurationMs: data.lastRenderDurationMs
          ? Number(data.lastRenderDurationMs)
          : undefined,
        lastRenderedAt: data.lastRenderedAt || undefined,
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
        versionCount: 1,
        healthStatus: 'operational',
        renderSuccessRate: 100,
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

  const MAX_PROFILES_LIMIT = 10
  const existingProfiles = await getUserProfiles(u)
  if (existingProfiles.length >= MAX_PROFILES_LIMIT) {
    throw new Error(`Maximum profile limit (${MAX_PROFILES_LIMIT}) reached.`)
  }

  if (existingProfiles.some((p) => p.slug === cleanSlug)) {
    throw new Error(`Profile with slug "${cleanSlug}" already exists.`)
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
    versionCount: 1,
    healthStatus: 'operational',
    renderSuccessRate: 100,
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

  const initialConfig: SavedConfiguration = {
    version: 1,
    githubId: 0,
    username: u,
    profileSlug: cleanSlug,
    profileName: data.name,
    templateId: 'terminal',
    widgets: [],
    globalStyles: {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      accentColor: '#c5ff4a',
      borderColor: 'rgba(255,255,255,0.1)',
      fontFamily: 'monospace',
      borderRadius: 8,
      padding: 16,
      themeMode: 'dark',
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
      generatedBy: 'manual',
    },
  }
  await saveProfileConfig(initialConfig)
  await createProfileVersion(u, cleanSlug, {
    config: initialConfig,
    label: 'Initial Profile Setup (v1)',
    description: 'Initial blank profile created',
    createdBy: u,
  })

  return record
}

export async function duplicateProfile(
  username: string,
  sourceSlug: string,
  target: { slug: string; name: string; description?: string }
): Promise<ProProfileRecord> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const srcSlug = (sourceSlug || 'default').toLowerCase().trim()
  const cleanSlug = target.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!cleanSlug) {
    throw new Error('Valid target profile slug is required.')
  }

  const existing = await getUserProfiles(u)
  const sourceProfile = existing.find((p) => p.slug === srcSlug)
  if (!sourceProfile) {
    throw new Error(`Source profile "${srcSlug}" does not exist.`)
  }

  const MAX_PROFILES_LIMIT = 10
  if (existing.length >= MAX_PROFILES_LIMIT) {
    throw new Error(`Maximum profile limit (${MAX_PROFILES_LIMIT}) reached.`)
  }

  if (existing.some((p) => p.slug === cleanSlug)) {
    throw new Error(`A profile with slug "${cleanSlug}" already exists.`)
  }

  const now = new Date().toISOString()
  const sourceConfig = await loadProfileConfig(u, srcSlug)

  const duplicatedWidgets: WidgetInstance[] = (sourceConfig?.widgets || []).map((w, idx) => ({
    ...w,
    instanceId: `inst_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
  }))

  const newConfig: SavedConfiguration = {
    version: 1,
    githubId: sourceConfig?.githubId || 0,
    username: u,
    profileSlug: cleanSlug,
    profileName: target.name.trim(),
    templateId: sourceConfig?.templateId || 'terminal',
    widgets: duplicatedWidgets,
    globalStyles: sourceConfig?.globalStyles || {
      backgroundColor: '#0a0a0a',
      textColor: '#ffffff',
      accentColor: '#c5ff4a',
      borderColor: 'rgba(255,255,255,0.1)',
      fontFamily: 'monospace',
      borderRadius: 8,
      padding: 16,
      themeMode: 'dark',
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
      generatedBy: 'manual',
    },
  }

  await saveProfileConfig(newConfig)

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis.sadd(profilesSetKey, cleanSlug)

  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)
  const publicUrl = `${APP_URL}/${u}/${cleanSlug}`
  const rawSvgUrl = `${APP_URL}/${u}/${cleanSlug}.svg`

  const record: ProProfileRecord = {
    id: `prof_${cleanSlug}`,
    slug: cleanSlug,
    name: target.name.trim(),
    description: target.description?.trim() || `Cloned from ${sourceProfile.name}`,
    status: 'active',
    isDefault: false,
    widgetsCount: duplicatedWidgets.length || sourceProfile.widgetsCount || 1,
    totalViews: 0,
    versionCount: 1,
    healthStatus: 'operational',
    renderSuccessRate: 100,
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

  await createProfileVersion(u, cleanSlug, {
    config: newConfig,
    label: `Cloned from /${srcSlug} (v1)`,
    description: `Duplicated from "${sourceProfile.name}"`,
    createdBy: u,
  })

  return record
}

export async function setDefaultProfile(
  username: string,
  targetSlug: string
): Promise<ProProfileRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = targetSlug.toLowerCase().trim()

  const profiles = await getUserProfiles(u)
  const targetExists = profiles.some((p) => p.slug === cleanSlug)
  if (!targetExists) {
    throw new Error(`Profile "${cleanSlug}" not found.`)
  }

  for (const p of profiles) {
    const metaKey = REDIS_KEYS.profileMeta(u, p.slug)
    const shouldBeDefault = p.slug === cleanSlug
    await redis.hset(metaKey, {
      isDefault: String(shouldBeDefault),
      updatedAt: new Date().toISOString(),
    })
  }

  return getUserProfiles(u)
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
  if (updates.healthStatus !== undefined) payload.healthStatus = updates.healthStatus
  if (updates.renderSuccessRate !== undefined) payload.renderSuccessRate = updates.renderSuccessRate
  if (updates.lastRenderDurationMs !== undefined)
    payload.lastRenderDurationMs = updates.lastRenderDurationMs
  if (updates.lastRenderedAt !== undefined) payload.lastRenderedAt = updates.lastRenderedAt
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

  const profiles = await getUserProfiles(u)
  const target = profiles.find((p) => p.slug === cleanSlug)
  if (target?.isDefault) {
    throw new Error(
      'Cannot delete the currently designated default profile. Set another profile as default first.'
    )
  }

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis.srem(profilesSetKey, cleanSlug)

  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)
  await redis.del(metaKey)

  const configKey = REDIS_KEYS.profileConfig(u, cleanSlug)
  await redis.del(configKey)

  const versionsListKey = REDIS_KEYS.profileVersions(u, cleanSlug)
  const versionIds = await redis.zrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  if (versionIds && versionIds.length > 0) {
    for (const vId of versionIds) {
      await redis.del(REDIS_KEYS.profileVersionItem(u, cleanSlug, vId))
    }
  }
  await redis.del(versionsListKey)

  return true
}

export async function createProfileVersion(
  username: string,
  slug: string,
  snapshot: {
    config: SavedConfiguration
    label?: string
    description?: string
    createdBy?: string
  }
): Promise<ProfileVersionRecord> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const now = new Date().toISOString()
  const timestamp = Date.now()

  const versionsListKey = REDIS_KEYS.profileVersions(u, cleanSlug)
  const existingVersionIds = await redis.zrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  const nextVersionNumber = (existingVersionIds?.length || 0) + 1

  const versionId = `ver_${timestamp}_${Math.random().toString(36).slice(2, 7)}`
  const record: ProfileVersionRecord = {
    id: versionId,
    profileSlug: cleanSlug,
    versionNumber: nextVersionNumber,
    label: snapshot.label || `Version ${nextVersionNumber}`,
    description: snapshot.description || '',
    config: snapshot.config,
    widgetsCount: snapshot.config?.widgets?.length || 0,
    createdAt: now,
    createdBy: snapshot.createdBy || u,
  }

  const itemKey = REDIS_KEYS.profileVersionItem(u, cleanSlug, versionId)
  await redis.set(itemKey, JSON.stringify(record))
  await redis.zadd(versionsListKey, { score: timestamp, member: versionId })

  if (existingVersionIds && existingVersionIds.length >= MAX_VERSIONS_PER_PROFILE) {
    const toRemove = existingVersionIds.slice(
      0,
      existingVersionIds.length - MAX_VERSIONS_PER_PROFILE + 1
    )
    for (const oldId of toRemove) {
      await redis.del(REDIS_KEYS.profileVersionItem(u, cleanSlug, oldId))
      await redis.zrem(versionsListKey, oldId)
    }
  }

  return record
}

export async function getProfileVersions(
  username: string,
  slug: string
): Promise<ProfileVersionRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const versionsListKey = REDIS_KEYS.profileVersions(u, cleanSlug)

  const versionIds = await redis.zrevrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  if (!versionIds || versionIds.length === 0) {
    return []
  }

  const versions: ProfileVersionRecord[] = []
  for (const vId of versionIds) {
    const itemKey = REDIS_KEYS.profileVersionItem(u, cleanSlug, vId)
    const raw = await redis.get<string | ProfileVersionRecord>(itemKey)
    if (raw) {
      const parsed: ProfileVersionRecord = typeof raw === 'string' ? JSON.parse(raw) : raw
      versions.push(parsed)
    }
  }

  return versions
}

export async function getProfileVersionById(
  username: string,
  slug: string,
  versionId: string
): Promise<ProfileVersionRecord | null> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const itemKey = REDIS_KEYS.profileVersionItem(u, cleanSlug, versionId)

  const raw = await redis.get<string | ProfileVersionRecord>(itemKey)
  if (!raw) return null
  return typeof raw === 'string' ? (JSON.parse(raw) as ProfileVersionRecord) : raw
}

export async function restoreProfileVersion(
  username: string,
  slug: string,
  versionId: string
): Promise<{ profile: ProProfileRecord; restoredVersion: ProfileVersionRecord }> {
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  const targetVersion = await getProfileVersionById(u, cleanSlug, versionId)
  if (!targetVersion || !targetVersion.config) {
    throw new Error(`Version snapshot "${versionId}" not found for profile "/${cleanSlug}".`)
  }

  const restoredConfig: SavedConfiguration = {
    ...targetVersion.config,
    profileSlug: cleanSlug,
    metadata: {
      ...targetVersion.config.metadata,
      updatedAt: new Date().toISOString(),
    },
  }

  await saveProfileConfig(restoredConfig)

  await updateProfile(u, cleanSlug, {
    widgetsCount: restoredConfig.widgets?.length || targetVersion.widgetsCount || 0,
    status: 'active',
  })

  const newSnapshot = await createProfileVersion(u, cleanSlug, {
    config: restoredConfig,
    label: `Restored to v${targetVersion.versionNumber}`,
    description: `Rolled back to snapshot from ${new Date(targetVersion.createdAt).toLocaleDateString()}`,
    createdBy: u,
  })

  const profiles = await getUserProfiles(u)
  const currentProfile = profiles.find((p) => p.slug === cleanSlug) || profiles[0]

  return {
    profile: currentProfile,
    restoredVersion: newSnapshot,
  }
}

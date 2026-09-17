import type { SavedConfiguration, WidgetInstance } from '@/engine/types'
import { hasDbConfig } from '@/lib/db/client'
import {
  createProfileInDb,
  createProfileVersionInDb,
  deleteProfileFromDb,
  getProfileVersionByIdFromDb,
  getProfileVersionsFromDb,
  getUserProfilesFromDb,
  updateProfileInDb,
} from '@/lib/db/repositories/profileRepository'
import { getInstallationTokenForUser } from '@/lib/githubApp'
import { loadProfileConfig, saveProfileConfig } from '@/lib/profileStorage'
import { API_ENDPOINTS } from '@/services/endpoints'

import {
  DEFAULT_PROFILE_SLUG,
  MAX_PROFILES_PER_USER,
  PROFILE_STATUS,
  type ProfileVersionRecord,
  type ProProfileRecord,
} from '../types/profiles'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

const MAX_VERSIONS_PER_PROFILE = 20

function getPublishedProfileUrls(username: string, slug: string) {
  return {
    publicUrl: API_ENDPOINTS.GITHUB.PROFILE_FILE_PAGE(username, slug, 'dark'),
    rawSvgUrl: API_ENDPOINTS.GITHUB.PUBLISHED_PROFILE(username, slug, 'dark'),
  }
}
const GITHUB_HISTORY_TIMEOUT_MS = 10_000
const GITHUB_VERSION_TIMEOUT_MS = 10_000

interface GitHubCommitHistoryItem {
  sha: string
  author?: { login?: string }
  commit?: {
    message?: string
    author?: { name?: string; date?: string }
  }
}

export async function getUserProfiles(username: string): Promise<ProProfileRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const profilesSetKey = REDIS_KEYS.userProfiles(u)

  let dbProfiles: ProProfileRecord[] = []
  try {
    dbProfiles = await getUserProfilesFromDb(u)
  } catch (dbErr) {
    console.warn(`[ProfileManager] PostgreSQL lookup warning for ${u}:`, dbErr)
  }

  if (hasDbConfig() && dbProfiles.length === 0) {
    const now = new Date().toISOString()
    const defaultProfile: ProProfileRecord = {
      id: `prof_${u}_default`,
      slug: DEFAULT_PROFILE_SLUG,
      name: 'Default Profile',
      description: 'Your primary GitHub profile README',
      status: PROFILE_STATUS.ACTIVE,
      isDefault: true,
      widgetsCount: 1,
      totalViews: 0,
      versionCount: 1,
      healthStatus: 'operational',
      renderSuccessRate: 100,
      createdAt: now,
      lastUpdated: now,
      ...getPublishedProfileUrls(u, DEFAULT_PROFILE_SLUG),
    }
    await createProfileInDb(u, defaultProfile)
    dbProfiles = await getUserProfilesFromDb(u)
  }

  if (hasDbConfig()) {
    const p = redis.pipeline()
    for (const profile of dbProfiles) {
      p.sadd(profilesSetKey, profile.slug)
      p.hset(REDIS_KEYS.profileMeta(u, profile.slug), {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        status: profile.status,
        isDefault: String(profile.isDefault),
        widgetsCount: profile.widgetsCount,
        totalViews: profile.totalViews,
        healthStatus: profile.healthStatus,
        renderSuccessRate: profile.renderSuccessRate,
        createdAt: profile.createdAt,
        updatedAt: profile.lastUpdated,
      })
    }
    void p.exec().catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
    return dbProfiles.map((profile) => ({
      ...profile,
      ...getPublishedProfileUrls(u, profile.slug),
    }))
  }

  let slugs = await redis.smembers(profilesSetKey).catch(() => [] as string[])

  if ((!slugs || slugs.length === 0) && dbProfiles.length > 0) {
    try {
      const p = redis.pipeline()
      for (const prof of dbProfiles) {
        p.sadd(profilesSetKey, prof.slug)
        p.hset(REDIS_KEYS.profileMeta(u, prof.slug), {
          id: prof.id,
          name: prof.name,
          description: prof.description,
          status: prof.status,
          isDefault: String(prof.isDefault),
          widgetsCount: prof.widgetsCount,
          totalViews: prof.totalViews,
          healthStatus: prof.healthStatus,
          renderSuccessRate: prof.renderSuccessRate,
          createdAt: prof.createdAt,
          updatedAt: prof.lastUpdated,
        })
      }
      await p.exec()
    } catch (error) {
      console.warn('[ProfileManager] Failed to hydrate Redis profile cache:', error)
    }
    return dbProfiles
  }

  if (!slugs || slugs.length === 0 || !slugs.includes('default')) {
    await redis
      .sadd(profilesSetKey, 'default')
      .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
    slugs = await redis.smembers(profilesSetKey).catch(() => ['default'])
  }

  const profiles: ProProfileRecord[] = []

  if (slugs.length > 0) {
    const p = redis.pipeline()
    for (const slug of slugs) {
      p.hgetall(REDIS_KEYS.profileMeta(u, slug))
      p.zrange(REDIS_KEYS.profileVersions(u, slug), 0, -1)
    }
    const results = await p.exec<any[]>().catch(() => [])

    const gitVersionsList = await Promise.allSettled(
      slugs.map((slug) => getGitCommitsVersionHistory(u, slug))
    )

    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i]
      const data = results[i * 2]
      const versionIds = results[i * 2 + 1] || []
      const settled = gitVersionsList[i]
      const gitVersions = settled && settled.status === 'fulfilled' ? settled.value : []
      const dbMatch = dbProfiles.find((dp) => dp.slug === slug)
      const isSynced =
        gitVersions.length > 0 ||
        dbMatch?.isSynced ||
        data?.isSynced === 'true' ||
        data?.isSynced === true

      const isDefault =
        data?.isDefault !== undefined
          ? data.isDefault === 'true' || data.isDefault === true
          : (dbMatch?.isDefault ?? slug === 'default')

      const { publicUrl, rawSvgUrl } = getPublishedProfileUrls(u, slug)
      const versionCount =
        gitVersions.length || versionIds?.length || dbMatch?.versionCount || (isSynced ? 1 : 0)

      const storedStatus = data?.status || dbMatch?.status
      const status =
        storedStatus === PROFILE_STATUS.ACTIVE || storedStatus === PROFILE_STATUS.DRAFT
          ? storedStatus
          : versionCount > 0
            ? PROFILE_STATUS.ACTIVE
            : PROFILE_STATUS.DRAFT

      if (data && data.name) {
        profiles.push({
          id: data.id || `prof_${slug}`,
          slug,
          name: data.name,
          description: data.description || '',
          status,
          isDefault,
          isSynced,
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
      } else if (dbMatch) {
        profiles.push({
          ...dbMatch,
          isSynced,
          versionCount,
          status,
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
          status,
          isDefault,
          isSynced,
          widgetsCount: 4,
          totalViews: 0,
          versionCount,
          healthStatus: 'operational',
          renderSuccessRate: 100,
          createdAt: now,
          lastUpdated: now,
          publicUrl,
          rawSvgUrl,
        }

        await redis
          .hset(REDIS_KEYS.profileMeta(u, slug), {
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
          .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

        void createProfileInDb(u, defaultRecord).catch((error) =>
          console.warn('[ProfileManager cache operation] Failed:', error)
        )

        profiles.push(defaultRecord)
      }
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

  const existingProfiles = await getUserProfiles(u)
  if (existingProfiles.length >= MAX_PROFILES_PER_USER) {
    throw new Error(`Maximum profile limit (${MAX_PROFILES_PER_USER}) reached.`)
  }

  if (existingProfiles.some((p) => p.slug === cleanSlug)) {
    throw new Error(`Profile with slug "${cleanSlug}" already exists.`)
  }

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis
    .sadd(profilesSetKey, cleanSlug)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  const now = new Date().toISOString()
  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)

  const { publicUrl, rawSvgUrl } = getPublishedProfileUrls(u, cleanSlug)

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

  await createProfileInDb(u, record)

  await redis
    .hset(metaKey, {
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
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

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
  let cleanSlug = target.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')

  while (cleanSlug.startsWith('-')) {
    cleanSlug = cleanSlug.slice(1)
  }
  while (cleanSlug.endsWith('-')) {
    cleanSlug = cleanSlug.slice(0, -1)
  }

  if (!cleanSlug) {
    throw new Error('Valid target profile slug is required.')
  }

  const existing = await getUserProfiles(u)
  const sourceProfile = existing.find((p) => p.slug === srcSlug)
  if (!sourceProfile) {
    throw new Error(`Source profile "${srcSlug}" does not exist.`)
  }

  if (existing.length >= MAX_PROFILES_PER_USER) {
    throw new Error(`Maximum profile limit (${MAX_PROFILES_PER_USER}) reached.`)
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
  await redis
    .sadd(profilesSetKey, cleanSlug)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)
  const { publicUrl, rawSvgUrl } = getPublishedProfileUrls(u, cleanSlug)

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

  await createProfileInDb(u, record, newConfig)

  await redis
    .hset(metaKey, {
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
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  await createProfileVersion(u, cleanSlug, {
    config: newConfig,
    label: `Cloned from /${srcSlug} (v1)`,
    description: `Duplicated from "${sourceProfile.name}"`,
    createdBy: u,
  })

  return record
}

export async function promoteProfileToCanonicalDefault(
  username: string,
  targetSlug: string
): Promise<ProProfileRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const cleanSlug = targetSlug.toLowerCase().trim()

  const profiles = await getUserProfiles(u)
  const target = profiles.find((p) => p.slug === cleanSlug)
  const currentDefault = profiles.find((p) => p.slug === DEFAULT_PROFILE_SLUG)

  if (!target || !currentDefault) {
    throw new Error(`Profile "${cleanSlug}" or "default" not found.`)
  }

  const sourceConfig = await loadProfileConfig(u, cleanSlug, { bypassMemory: true })
  const oldDefaultConfig = await loadProfileConfig(u, DEFAULT_PROFILE_SLUG, { bypassMemory: true })

  if (!sourceConfig) throw new Error(`Profile configuration "${cleanSlug}" not found.`)

  const now = new Date().toISOString()

  const canonicalConfig: SavedConfiguration = {
    ...sourceConfig,
    profileSlug: DEFAULT_PROFILE_SLUG,
    profileName: target.name,
    metadata: {
      ...sourceConfig.metadata,
      updatedAt: now,
      revision: `rev_${Date.now()}`,
    },
  }
  await saveProfileConfig(canonicalConfig)
  await createProfileVersion(u, DEFAULT_PROFILE_SLUG, {
    config: canonicalConfig,
    label: `Promoted from /${cleanSlug}`,
    description: `Canonical default updated from "${target.name}"`,
    createdBy: u,
  })

  if (oldDefaultConfig) {
    const backupConfig: SavedConfiguration = {
      ...oldDefaultConfig,
      profileSlug: cleanSlug,
      profileName: currentDefault.name,
      metadata: {
        ...oldDefaultConfig.metadata,
        updatedAt: now,
        revision: `rev_${Date.now()}_backup`,
      },
    }
    await saveProfileConfig(backupConfig)
  }

  await updateProfileInDb(u, DEFAULT_PROFILE_SLUG, {
    name: target.name,
    description: target.description,
  })
  await updateProfileInDb(u, cleanSlug, {
    name: currentDefault.name,
    description: currentDefault.description,
  })

  await redis
    .hset(REDIS_KEYS.profileMeta(u, DEFAULT_PROFILE_SLUG), {
      name: target.name,
      description: target.description,
      updatedAt: now,
    })
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  await redis
    .hset(REDIS_KEYS.profileMeta(u, cleanSlug), {
      name: currentDefault.name,
      description: currentDefault.description,
      updatedAt: now,
    })
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

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

  if (!hasDbConfig()) {
    const existing = await redis.hgetall<Record<string, unknown>>(metaKey).catch(() => null)
    if (!existing || Object.keys(existing).length === 0) return null
  }

  const dbUpdated = await updateProfileInDb(u, cleanSlug, updates)

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

  await redis
    .hset(metaKey, payload)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  return dbUpdated
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

  const deleted = await deleteProfileFromDb(u, cleanSlug)
  if (!deleted && hasDbConfig()) return false

  const profilesSetKey = REDIS_KEYS.userProfiles(u)
  await redis
    .srem(profilesSetKey, cleanSlug)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  const metaKey = REDIS_KEYS.profileMeta(u, cleanSlug)
  await redis
    .del(metaKey)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  const configKey = REDIS_KEYS.profileConfig(u, cleanSlug)
  await redis
    .del(configKey)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  const versionsListKey = REDIS_KEYS.profileVersions(u, cleanSlug)
  const versionIds = await redis.zrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  if (versionIds && versionIds.length > 0) {
    const keysToDelete = versionIds.map((vId) => REDIS_KEYS.profileVersionItem(u, cleanSlug, vId))
    await redis
      .del(...keysToDelete)
      .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
  }
  await redis
    .del(versionsListKey)
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

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
  const dbVersions = hasDbConfig() ? await getProfileVersionsFromDb(u, cleanSlug) : []
  const existingVersionIds = hasDbConfig()
    ? dbVersions.map((version) => version.id)
    : await redis.zrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  const nextVersionNumber =
    (dbVersions.length > 0
      ? Math.max(...dbVersions.map((version) => version.versionNumber))
      : existingVersionIds?.length || 0) + 1

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

  await createProfileVersionInDb(u, cleanSlug, record)

  const itemKey = REDIS_KEYS.profileVersionItem(u, cleanSlug, versionId)
  await redis
    .set(itemKey, JSON.stringify(record))
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
  await redis
    .zadd(versionsListKey, { score: timestamp, member: versionId })
    .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))

  if (existingVersionIds && existingVersionIds.length >= MAX_VERSIONS_PER_PROFILE) {
    const toRemove = existingVersionIds.slice(
      0,
      existingVersionIds.length - MAX_VERSIONS_PER_PROFILE + 1
    )
    for (const oldId of toRemove) {
      await redis
        .del(REDIS_KEYS.profileVersionItem(u, cleanSlug, oldId))
        .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
      await redis
        .zrem(versionsListKey, oldId)
        .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
    }
  }

  return record
}

export async function getGitCommitsVersionHistory(
  username: string,
  slug: string
): Promise<ProfileVersionRecord[]> {
  try {
    const u = username.toLowerCase().trim()
    const cleanSlug = slug.toLowerCase().trim()
    if (!u || !cleanSlug) return []

    const filePath = `profiles/${cleanSlug}/dark.svg`
    const legacyFilePath = cleanSlug === 'default' ? 'gitascii.json' : `gitascii_${cleanSlug}.json`

    const authHeaders: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-App',
    }

    try {
      const { token } = await getInstallationTokenForUser(u)
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`
      }
    } catch (tokenErr) {
      console.warn('[ProfileManager] Failed to get installation token for history fetch:', tokenErr)
    }

    let res = await fetch(
      API_ENDPOINTS.GITHUB.COMMITS_FOR_PATH(u, u, filePath, 'gitascii') + '&_t=' + Date.now(),
      {
        headers: authHeaders,
        signal: AbortSignal.timeout(GITHUB_HISTORY_TIMEOUT_MS),
        cache: 'no-store',
      }
    )

    let commits: unknown = []
    if (res.ok) {
      commits = await res.json()
    } else {
      console.error(
        '[ProfileManager] GitHub API error (primary):',
        res.status,
        await res.text().catch(() => '')
      )
    }

    if (!res.ok || !Array.isArray(commits) || commits.length === 0) {
      res = await fetch(
        API_ENDPOINTS.GITHUB.COMMITS_FOR_PATH(u, u, legacyFilePath) + '&_t=' + Date.now(),
        {
          headers: authHeaders,
          signal: AbortSignal.timeout(GITHUB_HISTORY_TIMEOUT_MS),
          cache: 'no-store',
        }
      )
      if (res.ok) {
        commits = await res.json()
      } else {
        console.error(
          '[ProfileManager] GitHub API error (legacy):',
          res.status,
          await res.text().catch(() => '')
        )
      }
    }

    if (!Array.isArray(commits) || commits.length === 0) {
      return []
    }

    let defaultWidgetsCount = 3
    try {
      const dbProfiles = await getUserProfilesFromDb(u)
      const matched = dbProfiles.find((dp) => dp.slug === cleanSlug)
      if (matched && matched.widgetsCount > 0) {
        defaultWidgetsCount = matched.widgetsCount
      }
    } catch (error) {
      console.warn('[ProfileManager] Failed to load the baseline widget count:', error)
    }

    return (commits as GitHubCommitHistoryItem[]).map((commit, index) => {
      const sha = String(commit.sha)
      const message = String(commit.commit?.message || `Commit ${sha.slice(0, 7)}`)
      const firstLine = message.split('\n')[0]
      const author = commit.author?.login || commit.commit?.author?.name || u
      const date = commit.commit?.author?.date || new Date().toISOString()

      const widgetMatch =
        message.match(/(?:with\s+|(?:\(|\[))(\d+)\s+widgets?/i) ||
        message.match(/(\d+)\s+widgets?/i)
      const widgetsCount = widgetMatch ? parseInt(widgetMatch[1], 10) : defaultWidgetsCount

      return {
        id: sha,
        profileSlug: cleanSlug,
        versionNumber: commits.length - index,
        label: firstLine,
        description: message,
        widgetsCount,
        createdAt: date,
        createdBy: author,
      }
    })
  } catch (error) {
    console.warn('[ProfileManager] Failed to load Git commit history:', error)
    return []
  }
}

export async function getProfileVersions(
  username: string,
  slug: string
): Promise<ProfileVersionRecord[]> {
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  const gitVersions = await getGitCommitsVersionHistory(u, cleanSlug)
  if (gitVersions.length > 0) {
    return gitVersions
  }

  const redis = getProRedisClient()
  const versionsListKey = REDIS_KEYS.profileVersions(u, cleanSlug)

  if (hasDbConfig()) {
    const dbVersions = await getProfileVersionsFromDb(u, cleanSlug)
    if (dbVersions.length > 0) {
      const p = redis.pipeline()
      for (const version of dbVersions) {
        p.set(REDIS_KEYS.profileVersionItem(u, cleanSlug, version.id), JSON.stringify(version))
        p.zadd(versionsListKey, {
          score: new Date(version.createdAt).getTime(),
          member: version.id,
        })
      }
      void p
        .exec()
        .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
    }
    return dbVersions
  }

  const versionIds = await redis.zrevrange<string[]>(versionsListKey, 0, -1).catch(() => [])
  if (!versionIds || versionIds.length === 0) {
    try {
      const dbVersions = await getProfileVersionsFromDb(u, cleanSlug)
      if (dbVersions.length > 0) {
        const p = redis.pipeline()
        for (const v of dbVersions) {
          p.set(REDIS_KEYS.profileVersionItem(u, cleanSlug, v.id), JSON.stringify(v))
          p.zadd(versionsListKey, { score: new Date(v.createdAt).getTime(), member: v.id })
        }
        await p.exec()
        return dbVersions
      }
    } catch (error) {
      console.warn('[ProfileManager] Failed to hydrate profile versions from PostgreSQL:', error)
    }
    return []
  }

  const versions: ProfileVersionRecord[] = []
  if (versionIds.length > 0) {
    const p = redis.pipeline()
    for (const vId of versionIds) {
      p.get(REDIS_KEYS.profileVersionItem(u, cleanSlug, vId))
    }
    const results = await p.exec<any[]>()
    for (const raw of results) {
      if (raw) {
        const parsed: ProfileVersionRecord = typeof raw === 'string' ? JSON.parse(raw) : raw
        versions.push(parsed)
      }
    }
  }

  return versions
}

export async function getProfileVersionById(
  username: string,
  slug: string,
  versionId: string
): Promise<ProfileVersionRecord | null> {
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  if (/^[0-9a-f]{40}$/i.test(versionId)) {
    try {
      const filePath = cleanSlug === 'default' ? 'gitascii.json' : `gitascii_${cleanSlug}.json`
      const res = await fetch(API_ENDPOINTS.GITHUB.RAW_USER_CONTENT(u, u, versionId, filePath), {
        signal: AbortSignal.timeout(GITHUB_VERSION_TIMEOUT_MS),
      })
      if (res.ok) {
        const config: SavedConfiguration = await res.json()
        return {
          id: versionId,
          profileSlug: cleanSlug,
          versionNumber: 1,
          label: `Commit ${versionId.slice(0, 7)}`,
          description: `Git version snapshot from ${versionId.slice(0, 7)}`,
          config,
          widgetsCount: config?.widgets?.length || 0,
          createdAt: config?.metadata?.updatedAt || new Date().toISOString(),
          createdBy: u,
        }
      }
    } catch (error) {
      console.warn('[ProfileManager] Failed to load the Git profile version:', error)
    }
  }

  const redis = getProRedisClient()
  const itemKey = REDIS_KEYS.profileVersionItem(u, cleanSlug, versionId)

  if (hasDbConfig()) {
    const dbVersion = await getProfileVersionByIdFromDb(u, cleanSlug, versionId)
    if (dbVersion)
      void redis
        .set(itemKey, JSON.stringify(dbVersion))
        .catch((error) => console.warn('[ProfileManager cache operation] Failed:', error))
    return dbVersion
  }

  const raw = await redis.get<string | ProfileVersionRecord>(itemKey).catch(() => null)
  if (!raw) {
    try {
      const dbVersion = await getProfileVersionByIdFromDb(u, cleanSlug, versionId)
      if (dbVersion) {
        void redis.set(itemKey, JSON.stringify(dbVersion)).catch((error) => {
          console.warn('[ProfileManager] Failed to cache the profile version:', error)
        })
        return dbVersion
      }
    } catch (error) {
      console.warn('[ProfileManager] Failed to load the profile version from PostgreSQL:', error)
    }
    return null
  }
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
    label: `Restored to v${targetVersion.versionNumber || versionId.slice(0, 7)}`,
    description: `Rolled back to snapshot ${versionId.slice(0, 7)} from ${new Date(targetVersion.createdAt).toLocaleDateString()}`,
    createdBy: u,
  })

  const profiles = await getUserProfiles(u)
  const currentProfile = profiles.find((p) => p.slug === cleanSlug) || profiles[0]

  return {
    profile: currentProfile,
    restoredVersion: newSnapshot,
  }
}

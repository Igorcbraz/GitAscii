import { hasDbConfig } from '@/lib/db/client'
import {
  getUserByStripeCustomerId,
  getUserPlanTierFromDb,
  getUserSettingsFromDb,
  updateUserSettingsInDb,
} from '@/lib/db/repositories/userRepository'

import type { ProEntitlements, ProPlanTier, ProUserSettings } from '../types/subscription'
import { PRO_PLAN_TIERS } from '../types/subscription'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

interface CachedEntitlements {
  entitlements: ProEntitlements
  expiresAt: number
}

const entitlementsCache = new Map<string, CachedEntitlements>()
const entitlementsPending = new Map<string, Promise<ProEntitlements>>()
const ENTITLEMENTS_CACHE_TTL_MS = 60 * 1000
const FREE_ENTITLEMENTS_CACHE_TTL_MS = 30 * 1000
const settingsCache = new Map<string, { settings: ProUserSettings; expiresAt: number }>()
const SETTINGS_CACHE_TTL_MS = 60 * 1000
const MAX_CACHE_ENTRIES = 1000

function remember<T extends { expiresAt: number }>(cache: Map<string, T>, key: string, value: T) {
  cache.delete(key)
  if (cache.size >= MAX_CACHE_ENTRIES) {
    for (const [cachedKey, cachedValue] of cache) {
      if (cachedValue.expiresAt <= Date.now()) cache.delete(cachedKey)
    }
  }
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
  cache.set(key, value)
}

export function invalidateEntitlementsCache(username?: string): void {
  if (username) {
    const key = username.toLowerCase().trim()
    entitlementsCache.delete(key)
    settingsCache.delete(key)
  } else {
    entitlementsCache.clear()
    settingsCache.clear()
  }
}

function isEnvProUser(username: string): boolean {
  const allowed = (process.env.PRO_USERNAMES || process.env.PRO_ADMIN_USERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(username.toLowerCase().trim())
}

export function computeEntitlements(tier: ProPlanTier): ProEntitlements {
  const isPro = tier !== PRO_PLAN_TIERS.FREE
  return {
    tier,
    maxProfiles: isPro ? 10 : 1,
    analyticsRetentionDays: isPro ? 90 : 7,
    widgetErrorAlertsEnabled: isPro,
    customDomainEnabled: isPro,
    instantSvgPurgeEnabled: isPro,
    prioritySupport: isPro,
    monthlyEmailQuota: isPro ? 1000 : 0,
  }
}

export async function getProEntitlements(username: string): Promise<ProEntitlements> {
  const u = username.toLowerCase().trim()

  if (process.env.NODE_ENV !== 'production') {
    try {
      // Dynamic import next/headers so it only runs when request context is available
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      const devOverride = cookieStore.get('gitascii_dev_pro_override')?.value
      if (devOverride === 'pro') {
        return computeEntitlements(PRO_PLAN_TIERS.PRO)
      }
    } catch (error) {
      console.warn(`[Entitlements] Environment Pro lookup failed for ${u}:`, error)
    }
  }

  if (isEnvProUser(u)) {
    return computeEntitlements(PRO_PLAN_TIERS.PRO)
  }

  const databaseConfigured = hasDbConfig()
  const cached = entitlementsCache.get(u)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.entitlements
  }

  const pending = entitlementsPending.get(u)
  if (pending) return pending

  const lookup = loadProEntitlements(u, databaseConfigured)
  entitlementsPending.set(u, lookup)
  try {
    return await lookup
  } finally {
    entitlementsPending.delete(u)
  }
}

async function loadProEntitlements(
  u: string,
  databaseConfigured: boolean
): Promise<ProEntitlements> {
  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  let raw: Record<string, unknown> | null = null
  if (!databaseConfigured) {
    try {
      raw = await redis.hgetall(key)
    } catch (err) {
      console.warn(`[Entitlements] Redis read failed for ${u}:`, err)
    }
  }

  let tier: ProPlanTier | null = null

  if (raw && typeof raw.planTier === 'string') {
    tier = raw.planTier as ProPlanTier
  }

  // PostgreSQL is authoritative in production. Redis may contain a stale Pro tier
  // briefly after a downgrade, so never let it authorize paid data collection.
  if (databaseConfigured) {
    try {
      tier = await getUserPlanTierFromDb(u)
    } catch (dbErr) {
      console.warn(`[Entitlements] DB lookup failed for ${u}:`, dbErr)
    }
  }

  if (!tier) {
    tier = (raw?.planTier as ProPlanTier) || PRO_PLAN_TIERS.FREE
  }

  const entitlements = computeEntitlements(tier)

  remember(entitlementsCache, u, {
    entitlements,
    expiresAt:
      Date.now() +
      (tier !== PRO_PLAN_TIERS.FREE ? ENTITLEMENTS_CACHE_TTL_MS : FREE_ENTITLEMENTS_CACHE_TTL_MS),
  })

  return entitlements
}

export async function isProUser(username: string): Promise<boolean> {
  const entitlements = await getProEntitlements(username)
  return entitlements.tier !== PRO_PLAN_TIERS.FREE && entitlements.widgetErrorAlertsEnabled
}

export async function getUserSettings(username: string): Promise<ProUserSettings> {
  const u = username.toLowerCase().trim()
  const isEnvPro = isEnvProUser(u)

  if (hasDbConfig()) {
    const cached = settingsCache.get(u)
    if (cached && cached.expiresAt > Date.now()) return cached.settings
    const dbSettings = await getUserSettingsFromDb(u)
    const settings = dbSettings
      ? { ...dbSettings, planTier: isEnvPro ? PRO_PLAN_TIERS.PRO : dbSettings.planTier }
      : {
          emailAlertsEnabled: true,
          dailyDigestEnabled: false,
          themePreference: 'system',
          anonymizeReferrers: true,
          publishIntervalMinutes: 1440,
          planTier: isEnvPro ? PRO_PLAN_TIERS.PRO : PRO_PLAN_TIERS.FREE,
        }
    remember(settingsCache, u, {
      settings: settings as ProUserSettings,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
    })
    return settings as ProUserSettings
  }

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  let raw: Record<string, unknown> | null = null
  try {
    raw = await redis.hgetall<Record<string, unknown>>(key)
  } catch (err) {
    console.warn(`[Entitlements] Redis read failed in getUserSettings for ${u}:`, err)
  }

  const redisPlanTier = raw?.planTier as ProPlanTier | undefined
  const needsDbLookup =
    !raw || Object.keys(raw).length === 0 || redisPlanTier !== PRO_PLAN_TIERS.PRO

  if (needsDbLookup && hasDbConfig()) {
    try {
      const dbSettings = await getUserSettingsFromDb(u)
      if (dbSettings) {
        if (dbSettings.planTier === PRO_PLAN_TIERS.PRO || !raw || Object.keys(raw).length === 0) {
          const cachePayload: Record<string, any> = {
            emailAlertsEnabled: String(dbSettings.emailAlertsEnabled),
            dailyDigestEnabled: String(dbSettings.dailyDigestEnabled),
            themePreference: dbSettings.themePreference,
            anonymizeReferrers: String(dbSettings.anonymizeReferrers),
            planTier: isEnvPro ? PRO_PLAN_TIERS.PRO : dbSettings.planTier || PRO_PLAN_TIERS.FREE,
            publishIntervalMinutes: String(dbSettings.publishIntervalMinutes || 1440),
          }
          if (dbSettings.alertEmailAddress)
            cachePayload.alertEmailAddress = dbSettings.alertEmailAddress
          if (dbSettings.stripeCustomerId)
            cachePayload.stripeCustomerId = dbSettings.stripeCustomerId
          if (dbSettings.stripeSubscriptionId)
            cachePayload.stripeSubscriptionId = dbSettings.stripeSubscriptionId
          if (dbSettings.stripePriceId) cachePayload.stripePriceId = dbSettings.stripePriceId
          if (dbSettings.stripeSubscriptionStatus)
            cachePayload.stripeSubscriptionStatus = dbSettings.stripeSubscriptionStatus
          if (dbSettings.stripeCurrentPeriodEnd)
            cachePayload.stripeCurrentPeriodEnd = String(dbSettings.stripeCurrentPeriodEnd)

          void redis
            .hset(key, cachePayload)
            .catch((error) => console.warn('[Entitlements cache operation] Failed:', error))
          if (dbSettings.planTier === PRO_PLAN_TIERS.PRO) {
            void redis
              .sadd('gitascii:pro:customers', u)
              .catch((error) => console.warn('[Entitlements cache operation] Failed:', error))
          }
          return {
            ...dbSettings,
            publishIntervalMinutes: raw?.publishIntervalMinutes
              ? Math.max(60, Number(raw.publishIntervalMinutes))
              : Math.max(60, dbSettings.publishIntervalMinutes || 1440),
            planTier: isEnvPro ? PRO_PLAN_TIERS.PRO : dbSettings.planTier,
          }
        }
      }
    } catch (dbErr) {
      console.warn(`[Entitlements] DB getUserSettings failed for ${u}:`, dbErr)
    }
  }

  return {
    emailAlertsEnabled: raw?.emailAlertsEnabled === 'true' || raw?.emailAlertsEnabled === undefined,
    alertEmailAddress:
      typeof raw?.alertEmailAddress === 'string' ? raw.alertEmailAddress : undefined,
    dailyDigestEnabled: raw?.dailyDigestEnabled === 'true',
    themePreference: (raw?.themePreference as 'system' | 'dark' | 'light') || 'system',
    anonymizeReferrers: raw?.anonymizeReferrers !== 'false',
    publishIntervalMinutes: raw?.publishIntervalMinutes
      ? Math.max(60, Number(raw.publishIntervalMinutes))
      : 1440,
    planTier: isEnvPro ? PRO_PLAN_TIERS.PRO : (raw?.planTier as ProPlanTier) || PRO_PLAN_TIERS.FREE,
    stripeCustomerId: typeof raw?.stripeCustomerId === 'string' ? raw.stripeCustomerId : undefined,
    stripeSubscriptionId:
      typeof raw?.stripeSubscriptionId === 'string' ? raw.stripeSubscriptionId : undefined,
    stripePriceId: typeof raw?.stripePriceId === 'string' ? raw.stripePriceId : undefined,
    stripeSubscriptionStatus:
      typeof raw?.stripeSubscriptionStatus === 'string' ? raw.stripeSubscriptionStatus : undefined,
    stripeCurrentPeriodEnd: raw?.stripeCurrentPeriodEnd
      ? Number(raw.stripeCurrentPeriodEnd)
      : undefined,
  }
}

export async function updateUserSettings(
  username: string,
  settings: Partial<ProUserSettings>
): Promise<ProUserSettings> {
  const u = username.toLowerCase().trim()

  const dbResult = hasDbConfig() ? await updateUserSettingsInDb(u, settings) : null

  if (dbResult) {
    invalidateEntitlementsCache(u)
    return dbResult
  }

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  const effectivePlanTier = settings.planTier
  const effectiveCustomerId = settings.stripeCustomerId

  const payload: Record<string, any> = {}
  if (settings.emailAlertsEnabled !== undefined) {
    payload.emailAlertsEnabled = String(settings.emailAlertsEnabled)
  }
  if (settings.alertEmailAddress !== undefined) {
    payload.alertEmailAddress = settings.alertEmailAddress
  }
  if (settings.dailyDigestEnabled !== undefined) {
    payload.dailyDigestEnabled = String(settings.dailyDigestEnabled)
  }
  if (settings.themePreference !== undefined) {
    payload.themePreference = settings.themePreference
  }
  if (settings.anonymizeReferrers !== undefined) {
    payload.anonymizeReferrers = String(settings.anonymizeReferrers)
  }
  if (settings.publishIntervalMinutes !== undefined) {
    payload.publishIntervalMinutes = String(Math.max(60, settings.publishIntervalMinutes))
  }
  if (effectivePlanTier !== undefined) {
    payload.planTier = effectivePlanTier
    if (effectivePlanTier === PRO_PLAN_TIERS.PRO) {
      await redis
        .sadd('gitascii:pro:customers', u)
        .catch((error) => console.warn('[Entitlements cache operation] Failed:', error))
    } else if (effectivePlanTier === PRO_PLAN_TIERS.FREE) {
      await redis
        .srem('gitascii:pro:customers', u)
        .catch((error) => console.warn('[Entitlements cache operation] Failed:', error))
    }
  }
  if (effectiveCustomerId !== undefined) {
    payload.stripeCustomerId = effectiveCustomerId
    await redis
      .set(`gitascii:stripe:customer:${effectiveCustomerId}`, u)
      .catch((error) => console.warn('[Entitlements cache operation] Failed:', error))
  }
  if (settings.stripeSubscriptionId !== undefined) {
    payload.stripeSubscriptionId = settings.stripeSubscriptionId
  }
  if (settings.stripePriceId !== undefined) {
    payload.stripePriceId = settings.stripePriceId
  }
  if (settings.stripeSubscriptionStatus !== undefined) {
    payload.stripeSubscriptionStatus = settings.stripeSubscriptionStatus
  }
  if (settings.stripeCurrentPeriodEnd !== undefined) {
    payload.stripeCurrentPeriodEnd = String(settings.stripeCurrentPeriodEnd)
  }

  if (Object.keys(payload).length > 0) {
    await redis.hset(key, payload).catch((err) => {
      console.warn(`[Entitlements] Failed to cache user settings in Redis for ${u}:`, err)
    })
  }

  invalidateEntitlementsCache(username)
  return getUserSettings(username)
}

export async function getUserByStripeCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null
  if (hasDbConfig()) {
    const dbUser = await getUserByStripeCustomerId(customerId)
    if (!dbUser) return null
    return dbUser.user.username.toLowerCase().trim()
  }

  const redis = getProRedisClient()
  try {
    const cached = await redis.get<string>(`gitascii:stripe:customer:${customerId}`)
    if (cached) return cached.toLowerCase().trim()
  } catch (error) {
    console.warn(`[Entitlements] Stripe customer cache lookup failed for ${customerId}:`, error)
  }

  return null
}

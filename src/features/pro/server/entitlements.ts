import { hasDbConfig } from '@/lib/db/client'
import {
  getUserByStripeCustomerId,
  getUserByUsername,
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
const ENTITLEMENTS_CACHE_TTL_MS = 5 * 60 * 1000

export function invalidateEntitlementsCache(username?: string): void {
  if (username) {
    entitlementsCache.delete(username.toLowerCase().trim())
  } else {
    entitlementsCache.clear()
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
    } catch {}
  }

  if (isEnvProUser(u)) {
    return computeEntitlements(PRO_PLAN_TIERS.PRO)
  }

  const cached = entitlementsCache.get(u)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.entitlements
  }

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  let raw: Record<string, unknown> | null = null
  let redisFailed = false
  try {
    raw = await redis.hgetall(key)
  } catch (err) {
    redisFailed = true
    console.warn(`[Entitlements] Redis read failed for ${u}:`, err)
  }

  let tier: ProPlanTier | null = null

  if (raw && typeof raw.planTier === 'string') {
    tier = raw.planTier as ProPlanTier
  }

  if (tier !== PRO_PLAN_TIERS.PRO && hasDbConfig()) {
    try {
      const dbUser = await getUserByUsername(u)
      if (dbUser) {
        const dbTier = dbUser.entitlement.plan_tier || PRO_PLAN_TIERS.FREE
        if (dbTier === PRO_PLAN_TIERS.PRO) {
          tier = PRO_PLAN_TIERS.PRO
          if (!redisFailed) {
            const cachePayload: Record<string, any> = {
              planTier: PRO_PLAN_TIERS.PRO,
            }
            if (dbUser.user.stripe_customer_id) {
              cachePayload.stripeCustomerId = dbUser.user.stripe_customer_id
            }
            if (dbUser.entitlement.stripe_subscription_id) {
              cachePayload.stripeSubscriptionId = dbUser.entitlement.stripe_subscription_id
            }
            if (dbUser.entitlement.stripe_subscription_status) {
              cachePayload.stripeSubscriptionStatus = dbUser.entitlement.stripe_subscription_status
            }
            void redis.hset(key, cachePayload).catch(() => {})
            void redis.sadd('gitascii:pro:customers', u).catch(() => {})
          }
        } else if (!tier) {
          tier = dbTier
        }
      }
    } catch (dbErr) {
      console.warn(`[Entitlements] DB lookup failed for ${u}:`, dbErr)
    }
  }

  if (!tier) {
    tier = (raw?.planTier as ProPlanTier) || PRO_PLAN_TIERS.FREE
  }

  const entitlements = computeEntitlements(tier)

  entitlementsCache.set(u, {
    entitlements,
    expiresAt: Date.now() + (tier !== PRO_PLAN_TIERS.FREE ? ENTITLEMENTS_CACHE_TTL_MS : 60 * 1000),
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

          void redis.hset(key, cachePayload).catch(() => {})
          if (dbSettings.planTier === PRO_PLAN_TIERS.PRO) {
            void redis.sadd('gitascii:pro:customers', u).catch(() => {})
          }
          return {
            ...dbSettings,
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

  let dbResult: ProUserSettings | null = null
  if (hasDbConfig()) {
    try {
      dbResult = await updateUserSettingsInDb(u, settings)
    } catch (dbErr) {
      console.error(`[Entitlements] Failed to persist settings to PostgreSQL for ${u}:`, dbErr)
    }
  }

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  const effectivePlanTier = dbResult ? dbResult.planTier : settings.planTier
  const effectiveCustomerId = dbResult?.stripeCustomerId || settings.stripeCustomerId

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
  if (effectivePlanTier !== undefined) {
    payload.planTier = effectivePlanTier
    if (effectivePlanTier === PRO_PLAN_TIERS.PRO) {
      await redis.sadd('gitascii:pro:customers', u).catch(() => {})
    } else if (effectivePlanTier === PRO_PLAN_TIERS.FREE) {
      await redis.srem('gitascii:pro:customers', u).catch(() => {})
    }
  }
  if (effectiveCustomerId !== undefined) {
    payload.stripeCustomerId = effectiveCustomerId
    await redis.set(`gitascii:stripe:customer:${effectiveCustomerId}`, u).catch(() => {})
  }
  if (settings.stripeSubscriptionId !== undefined) {
    payload.stripeSubscriptionId = dbResult?.stripeSubscriptionId ?? settings.stripeSubscriptionId
  }
  if (settings.stripePriceId !== undefined) {
    payload.stripePriceId = dbResult?.stripePriceId ?? settings.stripePriceId
  }
  if (settings.stripeSubscriptionStatus !== undefined) {
    payload.stripeSubscriptionStatus =
      dbResult?.stripeSubscriptionStatus ?? settings.stripeSubscriptionStatus
  }
  if (settings.stripeCurrentPeriodEnd !== undefined) {
    payload.stripeCurrentPeriodEnd = String(
      dbResult?.stripeCurrentPeriodEnd ?? settings.stripeCurrentPeriodEnd
    )
  }

  if (Object.keys(payload).length > 0) {
    await redis.hset(key, payload).catch((err) => {
      console.warn(`[Entitlements] Failed to cache user settings in Redis for ${u}:`, err)
    })
  }

  invalidateEntitlementsCache(username)
  return dbResult || getUserSettings(username)
}

export async function getUserByStripeCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null
  const redis = getProRedisClient()

  try {
    const cached = await redis.get<string>(`gitascii:stripe:customer:${customerId}`)
    if (cached) return cached.toLowerCase().trim()
  } catch {}

  if (hasDbConfig()) {
    try {
      const dbUser = await getUserByStripeCustomerId(customerId)
      if (dbUser) {
        const username = dbUser.user.username.toLowerCase().trim()
        await redis.set(`gitascii:stripe:customer:${customerId}`, username).catch(() => {})
        return username
      }
    } catch (err) {
      console.warn(`[Entitlements] Error querying DB by stripe customer ${customerId}:`, err)
    }
  }

  return null
}

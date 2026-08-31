import type { ProEntitlements, ProPlanTier, ProUserSettings } from '../types/subscription'
import { REDIS_KEYS } from './analyticsStore'
import { getProRedisClient } from './redisClient'

function isEnvProUser(username: string): boolean {
  const allowed = (process.env.PRO_USERNAMES || process.env.PRO_ADMIN_USERS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(username.toLowerCase().trim())
}

export async function getProEntitlements(username: string): Promise<ProEntitlements> {
  const u = username.toLowerCase().trim()

  if (isEnvProUser(u)) {
    return {
      tier: 'pro',
      maxProfiles: 10,
      analyticsRetentionDays: 90,
      widgetErrorAlertsEnabled: true,
      customDomainEnabled: true,
      instantSvgPurgeEnabled: true,
      prioritySupport: true,
      monthlyEmailQuota: 1000,
    }
  }

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  const raw = await redis.hgetall<any>(key).catch(() => null)
  const tier: ProPlanTier = (raw?.planTier as ProPlanTier) || 'free'
  const isPro = tier !== 'free'

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

export async function isProUser(username: string): Promise<boolean> {
  const entitlements = await getProEntitlements(username)
  return entitlements.tier !== 'free' && entitlements.widgetErrorAlertsEnabled
}

export async function getUserSettings(username: string): Promise<ProUserSettings> {
  const u = username.toLowerCase().trim()
  const isEnvPro = isEnvProUser(u)

  const redis = getProRedisClient()
  const key = REDIS_KEYS.userSettings(u)

  const raw = await redis.hgetall<any>(key)

  return {
    emailAlertsEnabled: raw?.emailAlertsEnabled === 'true' || raw?.emailAlertsEnabled === undefined,
    alertEmailAddress: raw?.alertEmailAddress || undefined,
    dailyDigestEnabled: raw?.dailyDigestEnabled === 'true',
    themePreference: (raw?.themePreference as any) || 'system',
    anonymizeReferrers: raw?.anonymizeReferrers !== 'false',
    planTier: isEnvPro ? 'pro' : (raw?.planTier as ProPlanTier) || 'free',
    stripeCustomerId: raw?.stripeCustomerId || undefined,
    stripeSubscriptionId: raw?.stripeSubscriptionId || undefined,
    stripePriceId: raw?.stripePriceId || undefined,
    stripeSubscriptionStatus: raw?.stripeSubscriptionStatus || undefined,
    stripeCurrentPeriodEnd: raw?.stripeCurrentPeriodEnd
      ? Number(raw.stripeCurrentPeriodEnd)
      : undefined,
  }
}

export async function updateUserSettings(
  username: string,
  settings: Partial<ProUserSettings>
): Promise<ProUserSettings> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const key = REDIS_KEYS.userSettings(u)

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
  if (settings.planTier !== undefined) {
    payload.planTier = settings.planTier
  }
  if (settings.stripeCustomerId !== undefined) {
    payload.stripeCustomerId = settings.stripeCustomerId
    await redis.set(`gitascii:stripe:customer:${settings.stripeCustomerId}`, u)
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
    await redis.hset(key, payload)
  }
  return getUserSettings(username)
}

export async function getUserByStripeCustomer(customerId: string): Promise<string | null> {
  if (!customerId) return null
  const redis = getProRedisClient()
  return await redis.get<string>(`gitascii:stripe:customer:${customerId}`)
}

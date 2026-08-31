import type { IngestErrorPayload, WidgetErrorRecord } from '../types/errors'
import { REDIS_KEYS } from './analyticsStore'
import { logSentEmail } from './emailLogStore'
import { getProRedisClient } from './redisClient'

const ERROR_ALERT_COOLDOWN_SECONDS = 60 * 60

export async function recordWidgetError(payload: IngestErrorPayload): Promise<void> {
  try {
    const redis = getProRedisClient()
    const username = payload.username.toLowerCase().trim()
    const slug = (payload.profileSlug || 'default').toLowerCase().trim()
    const widgetId = payload.widgetId.toLowerCase().trim()
    const widgetName = payload.widgetName || payload.widgetId
    const errorId = `err_${slug}_${widgetId}`
    const now = new Date().toISOString()
    const nowScore = Date.now()

    const itemKey = REDIS_KEYS.errorItem(username, errorId)
    const listKey = REDIS_KEYS.errorList(username)

    const existing = await redis.hgetall<Record<string, any>>(itemKey)

    if (existing && existing.id) {
      const occurrences = Number(existing.occurrences || 1) + 1
      await redis.hset(itemKey, {
        occurrences,
        lastSeenAt: now,
        message: payload.message,
        details: payload.details || existing.details || '',
        status: 'active',
      })
      await redis.zadd(listKey, { score: nowScore, member: errorId })
    } else {
      const newRecord: WidgetErrorRecord = {
        id: errorId,
        widgetId,
        widgetName,
        profileSlug: slug,
        errorType: payload.errorType,
        message: payload.message,
        details: payload.details || '',
        status: 'active',
        occurrences: 1,
        firstSeenAt: now,
        lastSeenAt: now,
        resolvedAt: null,
      }
      await redis.hset(itemKey, newRecord as unknown as Record<string, any>)
      await redis.zadd(listKey, { score: nowScore, member: errorId })
    }

    await redis.expire(itemKey, 90 * 86400)
    await redis.expire(listKey, 90 * 86400)

    const cooldownKey = REDIS_KEYS.errorAlertCooldown(username, widgetId)
    const isInCooldown = await redis.get(cooldownKey)

    if (!isInCooldown) {
      await redis.set(cooldownKey, '1', { ex: ERROR_ALERT_COOLDOWN_SECONDS })

      void sendWidgetErrorAlertEmail(username, slug, widgetName, payload.message)
    }
  } catch (err) {
    console.warn('[ErrorTrackerStore] Error recording widget error:', err)
  }
}

async function sendWidgetErrorAlertEmail(
  username: string,
  profileSlug: string,
  widgetName: string,
  errorMessage: string
): Promise<void> {
  try {
    const { getProEntitlements, getUserSettings } = await import('./entitlements')

    const entitlements = await getProEntitlements(username).catch(() => null)
    if (!entitlements || entitlements.tier === 'free' || !entitlements.widgetErrorAlertsEnabled) {
      return
    }

    const userSettings = await getUserSettings(username).catch(() => null)
    if (userSettings && !userSettings.emailAlertsEnabled) {
      return
    }

    const { getSession } = await import('@/lib/auth')

    let sessionEmail: string | undefined
    try {
      const session = await getSession()
      if (session && session.username.toLowerCase() === username.toLowerCase()) {
        sessionEmail = session.email
      }
    } catch {}

    const recipientEmail =
      userSettings?.alertEmailAddress || sessionEmail || `${username}@users.noreply.github.com`

    await logSentEmail({
      username,
      recipientEmail,
      templateName: 'WidgetErrorAlertEmail',
      subject: `🚨 [Alert] Widget "${widgetName}" failed in your profile README`,
      reason: `Widget failure: ${errorMessage}`,
      relatedWidget: widgetName,
      relatedProfile: profileSlug,
      status: 'sent',
    })
  } catch (err) {
    console.warn('[ErrorTrackerStore] Failed to send widget error email:', err)
  }
}

export async function getWidgetErrors(username: string): Promise<WidgetErrorRecord[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.errorList(u)

  const errorIds = await redis.zrevrange<string[]>(listKey, 0, 50)
  if (!errorIds || errorIds.length === 0) {
    return []
  }

  const records: WidgetErrorRecord[] = []
  for (const id of errorIds) {
    const itemKey = REDIS_KEYS.errorItem(u, id)
    const data = await redis.hgetall<any>(itemKey)
    if (data && data.id) {
      records.push({
        id: data.id,
        widgetId: data.widgetId,
        widgetName: data.widgetName || data.widgetId,
        profileSlug: data.profileSlug || 'default',
        errorType: data.errorType || 'UNKNOWN',
        message: data.message || 'Unknown error',
        details: data.details || undefined,
        status: (data.status as any) || 'active',
        occurrences: Number(data.occurrences || 1),
        firstSeenAt: data.firstSeenAt || new Date().toISOString(),
        lastSeenAt: data.lastSeenAt || new Date().toISOString(),
        resolvedAt: data.resolvedAt || null,
      })
    }
  }

  return records
}

export async function resolveWidgetError(username: string, errorId: string): Promise<boolean> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const itemKey = REDIS_KEYS.errorItem(u, errorId)

  const existing = await redis.hgetall<any>(itemKey)
  if (!existing) return false

  await redis.hset(itemKey, {
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
  })
  return true
}

export async function deleteWidgetErrors(username: string, errorIds: string[]): Promise<void> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.errorList(u)

  if (!errorIds || errorIds.length === 0) return

  for (const id of errorIds) {
    await redis.del(REDIS_KEYS.errorItem(u, id))
    await redis.zrem(listKey, id)
  }
}

export async function clearAllWidgetErrors(username: string): Promise<void> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.errorList(u)

  const errorIds = await redis.zrange<string[]>(listKey, 0, -1)
  if (errorIds && errorIds.length > 0) {
    for (const id of errorIds) {
      await redis.del(REDIS_KEYS.errorItem(u, id))
    }
  }
  await redis.del(listKey)
}

import { hasDbConfig } from '@/lib/db/client'
import {
  clearAllWidgetErrorsInDb,
  deleteWidgetErrorsInDb,
  getWidgetErrorsFromDb,
  recordWidgetErrorInDb,
  resolveWidgetErrorInDb,
} from '@/lib/db/repositories/healthRepository'

import type { IngestErrorPayload, WidgetErrorRecord } from '../types/errors'
import { REDIS_KEYS } from './analyticsStore'
import { getProEmailLogs, logSentEmail } from './emailLogStore'
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

    const existing = hasDbConfig()
      ? (await getWidgetErrorsFromDb(username, 50)).find((error) => error.id === errorId) || null
      : await redis.hgetall<Record<string, any>>(itemKey).catch(() => null)

    const recordToSave: WidgetErrorRecord = {
      id: errorId,
      widgetId,
      widgetName,
      profileSlug: slug,
      errorType: payload.errorType,
      message: payload.message,
      details: payload.details || existing?.details || '',
      status: 'active',
      occurrences: existing?.occurrences ? Number(existing.occurrences) + 1 : 1,
      firstSeenAt: existing?.firstSeenAt || now,
      lastSeenAt: now,
      resolvedAt: null,
    }

    await recordWidgetErrorInDb(username, recordToSave)

    if (existing && existing.id) {
      await redis
        .hset(itemKey, {
          occurrences: recordToSave.occurrences,
          lastSeenAt: now,
          message: payload.message,
          details: payload.details || existing.details || '',
          status: 'active',
        })
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
      await redis
        .zadd(listKey, { score: nowScore, member: errorId })
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
    } else {
      await redis
        .hset(itemKey, recordToSave as unknown as Record<string, any>)
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
      await redis
        .zadd(listKey, { score: nowScore, member: errorId })
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
    }

    await redis
      .expire(itemKey, 90 * 86400)
      .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
    await redis
      .expire(listKey, 90 * 86400)
      .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))

    const cooldownKey = REDIS_KEYS.errorAlertCooldown(username, widgetId)
    const isInCooldown = hasDbConfig()
      ? (await getProEmailLogs(username)).some(
          (log) =>
            log.templateName === 'WidgetErrorAlertEmail' &&
            log.relatedWidget === widgetName &&
            Date.now() - new Date(log.sentAt).getTime() < ERROR_ALERT_COOLDOWN_SECONDS * 1000
        )
      : Boolean(await redis.get(cooldownKey).catch(() => null))

    if (!isInCooldown) {
      await redis
        .set(cooldownKey, '1', { ex: ERROR_ALERT_COOLDOWN_SECONDS })
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))

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
    } catch (error) {
      console.warn('[ErrorTrackerStore] Session lookup failed while resolving alert email:', error)
    }

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

  if (hasDbConfig()) {
    const dbErrors = await getWidgetErrorsFromDb(u, 50)
    if (dbErrors.length > 0) {
      const p = redis.pipeline()
      for (const error of dbErrors) {
        p.hset(REDIS_KEYS.errorItem(u, error.id), error as unknown as Record<string, any>)
        p.zadd(listKey, { score: new Date(error.lastSeenAt).getTime(), member: error.id })
      }
      void p
        .exec()
        .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
    }
    return dbErrors
  }

  const errorIds = await redis.zrevrange<string[]>(listKey, 0, 50).catch(() => [])
  if (!errorIds || errorIds.length === 0) {
    try {
      const dbErrors = await getWidgetErrorsFromDb(u, 50)
      if (dbErrors.length > 0) {
        const p = redis.pipeline()
        for (const err of dbErrors) {
          p.hset(REDIS_KEYS.errorItem(u, err.id), err as unknown as Record<string, any>)
          p.zadd(listKey, { score: new Date(err.lastSeenAt).getTime(), member: err.id })
        }
        await p
          .exec()
          .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
        return dbErrors
      }
    } catch (dbErr) {
      console.warn('[ErrorTrackerStore] PostgreSQL getWidgetErrors fallback error:', dbErr)
    }
    return []
  }

  const p = redis.pipeline()
  for (const id of errorIds) {
    p.hgetall(REDIS_KEYS.errorItem(u, id))
  }
  const results = await p.exec<any[]>().catch(() => [])

  const records: WidgetErrorRecord[] = []
  for (const data of results) {
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

  const resolved = await resolveWidgetErrorInDb(u, errorId)
  if (hasDbConfig() && !resolved) return false

  const existing = await redis.hgetall<any>(itemKey).catch(() => null)
  if (!existing) return true

  await redis
    .hset(itemKey, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
    })
    .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
  return true
}

export async function deleteWidgetErrors(username: string, errorIds: string[]): Promise<void> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.errorList(u)

  if (!errorIds || errorIds.length === 0) return

  await deleteWidgetErrorsInDb(u, errorIds)

  const itemKeys = errorIds.map((id) => REDIS_KEYS.errorItem(u, id))
  await redis
    .del(...itemKeys)
    .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
  await redis
    .zrem(listKey, ...errorIds)
    .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
}

export async function clearAllWidgetErrors(username: string): Promise<void> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const listKey = REDIS_KEYS.errorList(u)

  await clearAllWidgetErrorsInDb(u)

  const errorIds = await redis.zrange<string[]>(listKey, 0, -1).catch(() => [])
  if (errorIds && errorIds.length > 0) {
    const itemKeys = errorIds.map((id) => REDIS_KEYS.errorItem(u, id))
    await redis
      .del(...itemKeys)
      .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
  }
  await redis
    .del(listKey)
    .catch((error) => console.warn('[ErrorTrackerStore cache operation] Failed:', error))
}

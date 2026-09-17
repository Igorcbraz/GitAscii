import { hasDbConfig } from '@/lib/db/client'
import {
  getProfileHealthRangeFromDb,
  recordProfileDailyHealthInDb,
} from '@/lib/db/repositories/healthRepository'

import {
  type IngestErrorPayload,
  WIDGET_ERROR_STATUS,
  WIDGET_ERROR_TYPE,
  type WidgetErrorRecord,
} from '../types/errors'
import type {
  HealthHistoryPoint,
  HealthStatus,
  OverallHealthMetrics,
  ProfileHealthSummary,
  WidgetHealthRecord,
} from '../types/health'
import { HEALTH_STATUS } from '../types/health'
import { REDIS_KEYS } from './analyticsStore'
import { getWidgetErrors, recordWidgetError } from './errorTrackerStore'
import { getUserProfiles } from './profileManagerStore'
import { getProRedisClient } from './redisClient'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export async function recordRenderTelemetry(payload: {
  username: string
  profileSlug: string
  durationMs: number
  statusCode: number
  hasErrors: boolean
  renderedWidgets?: string[]
  widgetErrors?: IngestErrorPayload[]
}): Promise<void> {
  try {
    const redis = getProRedisClient()
    const u = payload.username.toLowerCase().trim()
    const slug = (payload.profileSlug || 'default').toLowerCase().trim()
    const now = new Date()
    const dateStr = formatDate(now)
    const duration = Math.max(1, Math.round(payload.durationMs || 25))
    const isSuccess = payload.statusCode >= 200 && payload.statusCode < 400 && !payload.hasErrors

    await recordProfileDailyHealthInDb(u, slug, dateStr, isSuccess, duration)

    const profileHealthKey = REDIS_KEYS.healthProfileDaily(u, slug, dateStr)
    const metaKey = REDIS_KEYS.profileMeta(u, slug)

    const p = redis.pipeline()
    p.hincrby(profileHealthKey, 'renders', 1)
    if (isSuccess) {
      p.hincrby(profileHealthKey, 'successes', 1)
    } else {
      p.hincrby(profileHealthKey, 'failures', 1)
    }
    p.hincrby(profileHealthKey, 'durationMs', duration)
    p.hincrby(profileHealthKey, 'durationCount', 1)
    p.expire(profileHealthKey, 90 * 86400)

    p.hset(metaKey, {
      lastRenderedAt: now.toISOString(),
      lastRenderDurationMs: duration,
      healthStatus: isSuccess ? HEALTH_STATUS.OPERATIONAL : HEALTH_STATUS.WARNING,
    })

    await p
      .exec()
      .catch((error) => console.warn('[HealthMonitoringStore cache operation] Failed:', error))

    if (payload.widgetErrors && payload.widgetErrors.length > 0) {
      for (const errPayload of payload.widgetErrors) {
        await recordWidgetError(errPayload)

        const widgetId = errPayload.widgetId.toLowerCase().trim()
        const widgetMetaKey = REDIS_KEYS.healthWidgetMeta(u, widgetId)
        await redis
          .hset(widgetMetaKey, {
            status: HEALTH_STATUS.FAILED,
            lastErrorType: errPayload.errorType,
            lastErrorMessage: errPayload.message,
            lastErrorAt: now.toISOString(),
          })
          .catch((error) => console.warn('[HealthMonitoringStore cache operation] Failed:', error))
      }
    } else if (payload.hasErrors) {
      const fallbackErr: IngestErrorPayload = {
        username: u,
        profileSlug: slug,
        widgetId: 'external-widget',
        widgetName: 'External Widget / Asset',
        errorType: WIDGET_ERROR_TYPE.FETCH_TIMEOUT,
        message: 'External asset or upstream API timed out during render',
      }
      await recordWidgetError(fallbackErr)
    }
  } catch (err) {
    console.warn('[HealthMonitoringStore] Error recording telemetry:', err)
  }
}

export async function getOverallHealth(username: string): Promise<OverallHealthMetrics> {
  const u = username.toLowerCase().trim()
  const now = new Date()
  const _todayStr = formatDate(now)

  const [profiles, widgetErrors, _userProfiles] = await Promise.all([
    getProfileHealthList(u),
    getWidgetErrors(u),
    getUserProfiles(u),
  ])

  const activeErrors = widgetErrors.filter((e) => e.status !== WIDGET_ERROR_STATUS.RESOLVED)
  const errorsLast24h = widgetErrors.filter((e) => {
    const seenMs = new Date(e.lastSeenAt).getTime()
    return Date.now() - seenMs <= 24 * 60 * 60 * 1000 && e.status !== WIDGET_ERROR_STATUS.RESOLVED
  }).length

  let totalRenders24h = 0
  let totalSuccesses24h = 0
  let totalDurationMs24h = 0
  let totalDurationCount24h = 0
  let lastRenderAt: string | undefined

  for (const p of profiles) {
    totalRenders24h += p.totalRenders
    totalSuccesses24h += p.successfulRenders
    totalDurationMs24h += p.avgRenderDurationMs * p.totalRenders
    totalDurationCount24h += p.totalRenders
    if (p.lastRenderAt) {
      if (!lastRenderAt || new Date(p.lastRenderAt).getTime() > new Date(lastRenderAt).getTime()) {
        lastRenderAt = p.lastRenderAt
      }
    }
  }

  const overallHealthScore =
    totalRenders24h > 0
      ? Math.max(0, Math.min(100, Math.round((totalSuccesses24h / totalRenders24h) * 100)))
      : 0

  let systemStatus: HealthStatus =
    totalRenders24h > 0 ? HEALTH_STATUS.OPERATIONAL : HEALTH_STATUS.WARNING
  if (activeErrors.length > 2 || (totalRenders24h > 0 && overallHealthScore < 90)) {
    systemStatus = HEALTH_STATUS.FAILED
  } else if (activeErrors.length > 0 || overallHealthScore < 98) {
    systemStatus = HEALTH_STATUS.WARNING
  }

  const operationalProfilesCount = profiles.filter(
    (p) => p.status === HEALTH_STATUS.OPERATIONAL
  ).length
  const warningProfilesCount = profiles.filter((p) => p.status === HEALTH_STATUS.WARNING).length
  const failedProfilesCount = profiles.filter((p) => p.status === HEALTH_STATUS.FAILED).length

  const avgRenderTimeMs =
    totalDurationCount24h > 0 ? Math.round(totalDurationMs24h / totalDurationCount24h) : 0

  const [widgets, healthHistory] = await Promise.all([
    getWidgetHealthList(u),
    getHealthHistory(u, 30),
  ])

  return {
    status: systemStatus,
    overallHealthScore,
    totalRenders24h,
    errorsLast24h,
    activeIncidentsCount: activeErrors.length,
    operationalProfilesCount,
    warningProfilesCount,
    failedProfilesCount,
    avgRenderTimeMs,
    lastRenderAt,
    profiles,
    widgets,
    healthHistory,
  }
}

export async function getProfileHealthList(username: string): Promise<ProfileHealthSummary[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const profiles = await getUserProfiles(u)
  const todayStr = formatDate(new Date())

  const widgetErrors = await getWidgetErrors(u)
  const activeErrors = widgetErrors.filter((e) => e.status !== WIDGET_ERROR_STATUS.RESOLVED)
  const dbDaily = hasDbConfig() ? await getProfileHealthRangeFromDb(u, todayStr, todayStr) : []

  const summaries: ProfileHealthSummary[] = []

  for (const prof of profiles) {
    const dailyKey = REDIS_KEYS.healthProfileDaily(u, prof.slug, todayStr)
    const data = hasDbConfig()
      ? dbDaily.find((row) => row.slug === prof.slug)
      : await redis.hgetall<any>(dailyKey).catch(() => null)

    const renders = Number(data?.renders || 0)
    const successes = Number(data?.successes || 0)
    const failures = Number(data?.failures || 0)
    const durMs = Number(data?.durationMs || renders * 30)
    const durCount = Number(data?.durationCount || renders)
    const avgDuration = durCount > 0 ? Math.round(durMs / durCount) : 0

    const profErrors = activeErrors.filter((e) => e.profileSlug === prof.slug)
    const healthScore =
      renders > 0 ? Math.max(0, Math.min(100, Math.round((successes / renders) * 100))) : 0

    let status: HealthStatus = renders > 0 ? HEALTH_STATUS.OPERATIONAL : HEALTH_STATUS.WARNING
    if (profErrors.length > 1 || (renders > 0 && healthScore < 90)) {
      status = HEALTH_STATUS.FAILED
    } else if (profErrors.length > 0 || (renders > 0 && healthScore < 98)) {
      status = HEALTH_STATUS.WARNING
    }

    const opWidgets = Math.max(0, prof.widgetsCount - profErrors.length)
    const warnWidgets = profErrors.filter(
      (e) => e.errorType === WIDGET_ERROR_TYPE.RATE_LIMITED
    ).length
    const failWidgets = profErrors.filter(
      (e) => e.errorType !== WIDGET_ERROR_TYPE.RATE_LIMITED
    ).length

    summaries.push({
      profileSlug: prof.slug,
      profileName: prof.name,
      isDefault: prof.isDefault,
      status,
      healthScore,
      totalRenders: renders,
      successfulRenders: successes,
      failedRenders: failures,
      errorsLast24h: profErrors.length,
      avgRenderDurationMs: avgDuration,
      lastRenderAt: prof.lastRenderedAt || prof.lastUpdated,
      widgetsCount: prof.widgetsCount,
      operationalWidgetsCount: opWidgets,
      warningWidgetsCount: warnWidgets,
      failedWidgetsCount: failWidgets,
    })
  }

  return summaries
}

export async function getWidgetHealthList(
  username: string,
  profileSlug?: string
): Promise<WidgetHealthRecord[]> {
  const u = username.toLowerCase().trim()
  const [profiles, widgetErrors] = await Promise.all([getProfileHealthList(u), getWidgetErrors(u)])
  const activeErrors = widgetErrors.filter((e) => e.status !== WIDGET_ERROR_STATUS.RESOLVED)
  const records = profiles
    .filter(
      (profile) => !profileSlug || profileSlug === 'all' || profile.profileSlug === profileSlug
    )
    .map((profile): WidgetHealthRecord => {
      const error = activeErrors.find((item) => item.profileSlug === profile.profileSlug)
      return {
        widgetId: `profile-artifacts:${profile.profileSlug}`,
        widgetName: `${profile.profileName} SVG artifacts`,
        profileSlug: profile.profileSlug,
        status: error ? HEALTH_STATUS.FAILED : profile.status,
        lastRenderAt: profile.lastRenderAt || new Date().toISOString(),
        lastRenderDurationMs: profile.avgRenderDurationMs,
        avgRenderDurationMs: profile.avgRenderDurationMs,
        totalRenders: profile.totalRenders,
        totalErrors: profile.failedRenders,
        errorsLast24h: error?.occurrences || 0,
        successRate: profile.healthScore,
        lastError: error
          ? {
              errorType: error.errorType,
              message: error.message,
              timestamp: error.lastSeenAt,
              details: error.details,
            }
          : undefined,
      }
    })

  return records.sort((a, b) => {
    if (a.status === HEALTH_STATUS.FAILED && b.status !== HEALTH_STATUS.FAILED) return -1
    if (b.status === HEALTH_STATUS.FAILED && a.status !== HEALTH_STATUS.FAILED) return 1
    if (a.status === HEALTH_STATUS.WARNING && b.status === HEALTH_STATUS.OPERATIONAL) return -1
    if (b.status === HEALTH_STATUS.WARNING && a.status === HEALTH_STATUS.OPERATIONAL) return 1
    return b.totalRenders - a.totalRenders
  })
}

export async function getHealthHistory(
  username: string,
  days: number = 30
): Promise<HealthHistoryPoint[]> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const points: HealthHistoryPoint[] = []
  const today = new Date()

  const profiles = await getUserProfiles(u)
  const historyDates: Array<{ date: Date; dateStr: string }> = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    historyDates.push({ date: d, dateStr: formatDate(d) })
  }

  if (hasDbConfig()) {
    const rows = await getProfileHealthRangeFromDb(
      u,
      historyDates[0]?.dateStr || formatDate(today),
      historyDates.at(-1)?.dateStr || formatDate(today)
    )
    for (const { date, dateStr } of historyDates) {
      const dayRows = rows.filter((row) => row.dateStr === dateStr)
      const dayRenders = dayRows.reduce((sum, row) => sum + row.renders, 0)
      const daySuccesses = dayRows.reduce((sum, row) => sum + row.successes, 0)
      const dayFailures = dayRows.reduce((sum, row) => sum + row.failures, 0)
      const dayDurMs = dayRows.reduce((sum, row) => sum + row.durationMs, 0)
      const dayDurCount = dayRows.reduce((sum, row) => sum + row.durationCount, 0)
      const healthScore = dayRenders
        ? Math.max(0, Math.min(100, Math.round((daySuccesses / dayRenders) * 100)))
        : 0
      let status: HealthStatus = dayRenders > 0 ? HEALTH_STATUS.OPERATIONAL : HEALTH_STATUS.WARNING
      if (dayFailures > 2 || (dayRenders > 0 && healthScore < 90)) {
        status = HEALTH_STATUS.FAILED
      } else if (dayFailures > 0 || (dayRenders > 0 && healthScore < 98)) {
        status = HEALTH_STATUS.WARNING
      }
      points.push({
        timestamp: date.toISOString(),
        date: dateStr,
        healthScore,
        totalRenders: dayRenders,
        failedRenders: dayFailures,
        avgDurationMs: dayDurCount > 0 ? Math.round(dayDurMs / dayDurCount) : 0,
        status,
      })
    }
    return points
  }

  const p = redis.pipeline()
  for (const { dateStr } of historyDates) {
    for (const prof of profiles) {
      p.hgetall(REDIS_KEYS.healthProfileDaily(u, prof.slug, dateStr))
    }
  }

  const results = await p.exec<any[]>()
  const profCount = profiles.length

  for (let dIdx = 0; dIdx < historyDates.length; dIdx++) {
    const { date: d, dateStr } = historyDates[dIdx]
    let dayRenders = 0
    let daySuccesses = 0
    let dayFailures = 0
    let dayDurMs = 0
    let dayDurCount = 0

    for (let pIdx = 0; pIdx < profCount; pIdx++) {
      const data = results[dIdx * profCount + pIdx]
      if (data) {
        dayRenders += Number(data.renders || 0)
        daySuccesses += Number(data.successes || 0)
        dayFailures += Number(data.failures || 0)
        dayDurMs += Number(data.durationMs || 0)
        dayDurCount += Number(data.durationCount || 0)
      }
    }

    const healthScore =
      dayRenders > 0 ? Math.max(0, Math.min(100, Math.round((daySuccesses / dayRenders) * 100))) : 0

    let status: HealthStatus = dayRenders > 0 ? HEALTH_STATUS.OPERATIONAL : HEALTH_STATUS.WARNING
    if (dayFailures > 2 || (dayRenders > 0 && healthScore < 90)) {
      status = HEALTH_STATUS.FAILED
    } else if (dayFailures > 0 || (dayRenders > 0 && healthScore < 98)) {
      status = HEALTH_STATUS.WARNING
    }

    points.push({
      timestamp: d.toISOString(),
      date: dateStr,
      healthScore,
      totalRenders: dayRenders,
      failedRenders: dayFailures,
      avgDurationMs: dayDurCount > 0 ? Math.round(dayDurMs / dayDurCount) : 0,
      status,
    })
  }

  return points
}

export async function simulateHealthIncident(
  username: string,
  options?: {
    widgetId?: string
    widgetName?: string
    profileSlug?: string
    errorType?: WidgetErrorRecord['errorType']
    message?: string
  }
): Promise<OverallHealthMetrics> {
  const u = username.toLowerCase().trim()
  const payload: IngestErrorPayload = {
    username: u,
    profileSlug: options?.profileSlug || 'default',
    widgetId: options?.widgetId || 'contribution-snake',
    widgetName: options?.widgetName || 'Contribution Snake Game',
    errorType: options?.errorType || WIDGET_ERROR_TYPE.FETCH_TIMEOUT,
    message: options?.message || 'Upstream CDN asset timed out after 5000ms',
    details: 'HTTP 504 Gateway Timeout while fetching GitHub actions output SVG artifact.',
  }

  await recordWidgetError(payload)
  await recordRenderTelemetry({
    username: u,
    profileSlug: options?.profileSlug || 'default',
    durationMs: 1450,
    statusCode: 504,
    hasErrors: true,
    renderedWidgets: [payload.widgetId],
    widgetErrors: [payload],
  })

  return getOverallHealth(u)
}

import type { IngestErrorPayload, WidgetErrorRecord } from '../types/errors'
import type {
  HealthHistoryPoint,
  HealthStatus,
  OverallHealthMetrics,
  ProfileHealthSummary,
  WidgetHealthRecord,
} from '../types/health'
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

    const profileHealthKey = REDIS_KEYS.healthProfileDaily(u, slug, dateStr)
    await redis.hincrby(profileHealthKey, 'renders', 1)
    if (isSuccess) {
      await redis.hincrby(profileHealthKey, 'successes', 1)
    } else {
      await redis.hincrby(profileHealthKey, 'failures', 1)
    }
    await redis.hincrby(profileHealthKey, 'durationMs', duration)
    await redis.hincrby(profileHealthKey, 'durationCount', 1)
    await redis.expire(profileHealthKey, 90 * 86400)

    const metaKey = REDIS_KEYS.profileMeta(u, slug)
    await redis.hset(metaKey, {
      lastRenderedAt: now.toISOString(),
      lastRenderDurationMs: duration,
      healthStatus: isSuccess ? 'operational' : 'warning',
    })

    const widgetsToRecord =
      payload.renderedWidgets && payload.renderedWidgets.length > 0
        ? payload.renderedWidgets
        : ['avatar-card', 'stats-cards', 'streak-graph']

    for (const rawWidgetId of widgetsToRecord) {
      const widgetId = rawWidgetId.toLowerCase().trim()
      const widgetHealthKey = REDIS_KEYS.healthWidgetDaily(u, widgetId, dateStr)
      const widgetMetaKey = REDIS_KEYS.healthWidgetMeta(u, widgetId)

      await redis.hincrby(widgetHealthKey, 'renders', 1)
      if (isSuccess) {
        await redis.hincrby(widgetHealthKey, 'successes', 1)
      } else {
        await redis.hincrby(widgetHealthKey, 'failures', 1)
      }
      await redis.hincrby(widgetHealthKey, 'durationMs', duration)
      await redis.hincrby(widgetHealthKey, 'durationCount', 1)
      await redis.expire(widgetHealthKey, 90 * 86400)

      await redis.hset(widgetMetaKey, {
        lastRenderAt: now.toISOString(),
        lastRenderDurationMs: duration,
        status: isSuccess ? 'operational' : 'warning',
      })
    }

    if (payload.widgetErrors && payload.widgetErrors.length > 0) {
      for (const errPayload of payload.widgetErrors) {
        await recordWidgetError(errPayload)

        const widgetId = errPayload.widgetId.toLowerCase().trim()
        const widgetMetaKey = REDIS_KEYS.healthWidgetMeta(u, widgetId)
        await redis.hset(widgetMetaKey, {
          status: 'failed',
          lastErrorType: errPayload.errorType,
          lastErrorMessage: errPayload.message,
          lastErrorAt: now.toISOString(),
        })
      }
    } else if (payload.hasErrors) {
      const fallbackErr: IngestErrorPayload = {
        username: u,
        profileSlug: slug,
        widgetId: 'external-widget',
        widgetName: 'External Widget / Asset',
        errorType: 'FETCH_TIMEOUT',
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
  const todayStr = formatDate(now)

  const [profiles, widgetErrors, userProfiles] = await Promise.all([
    getProfileHealthList(u),
    getWidgetErrors(u),
    getUserProfiles(u),
  ])

  const activeErrors = widgetErrors.filter((e) => e.status !== 'resolved')
  const errorsLast24h = widgetErrors.filter((e) => {
    const seenMs = new Date(e.lastSeenAt).getTime()
    return Date.now() - seenMs <= 24 * 60 * 60 * 1000 && e.status !== 'resolved'
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
      : activeErrors.length === 0
        ? 100
        : Math.max(70, 100 - activeErrors.length * 10)

  let systemStatus: HealthStatus = 'operational'
  if (activeErrors.length > 2 || overallHealthScore < 90) {
    systemStatus = 'failed'
  } else if (activeErrors.length > 0 || overallHealthScore < 98) {
    systemStatus = 'warning'
  }

  const operationalProfilesCount = profiles.filter((p) => p.status === 'operational').length
  const warningProfilesCount = profiles.filter((p) => p.status === 'warning').length
  const failedProfilesCount = profiles.filter((p) => p.status === 'failed').length

  const avgRenderTimeMs =
    totalDurationCount24h > 0
      ? Math.round(totalDurationMs24h / totalDurationCount24h)
      : profiles.length > 0
        ? Math.round(
            profiles.reduce((acc, p) => acc + (p.avgRenderDurationMs || 30), 0) / profiles.length
          )
        : 28

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
    lastRenderAt: lastRenderAt || new Date().toISOString(),
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
  const activeErrors = widgetErrors.filter((e) => e.status !== 'resolved')

  const summaries: ProfileHealthSummary[] = []

  for (const prof of profiles) {
    const dailyKey = REDIS_KEYS.healthProfileDaily(u, prof.slug, todayStr)
    const data = await redis.hgetall<any>(dailyKey)

    const renders = Number(data?.renders || 0)
    const successes = Number(data?.successes || 0)
    const failures = Number(data?.failures || 0)
    const durMs = Number(data?.durationMs || renders * 30)
    const durCount = Number(data?.durationCount || renders)
    const avgDuration = durCount > 0 ? Math.round(durMs / durCount) : 32

    const profErrors = activeErrors.filter((e) => e.profileSlug === prof.slug)
    const healthScore =
      renders > 0
        ? Math.max(0, Math.min(100, Math.round((successes / renders) * 100)))
        : profErrors.length === 0
          ? 100
          : Math.max(60, 100 - profErrors.length * 15)

    let status: HealthStatus = 'operational'
    if (profErrors.length > 1 || healthScore < 90) {
      status = 'failed'
    } else if (profErrors.length > 0 || healthScore < 98) {
      status = 'warning'
    }

    const opWidgets = Math.max(0, prof.widgetsCount - profErrors.length)
    const warnWidgets = profErrors.filter((e) => e.errorType === 'RATE_LIMITED').length
    const failWidgets = profErrors.filter((e) => e.errorType !== 'RATE_LIMITED').length

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
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const todayStr = formatDate(new Date())

  const widgetErrors = await getWidgetErrors(u)
  const activeErrors = widgetErrors.filter((e) => e.status !== 'resolved')

  const knownWidgets = [
    { id: 'avatar-card', name: 'Profile Avatar & Bio' },
    { id: 'stats-cards', name: 'GitHub Stats Cards' },
    { id: 'streak-graph', name: 'Contribution Streak Graph' },
    { id: 'language-pie', name: 'Top Languages Breakdown' },
    { id: 'activity-calendar', name: 'Activity Calendar & Grid' },
    { id: 'trophies-shelf', name: 'Achievements & Trophies' },
    { id: 'contribution-snake', name: 'Contribution Snake Game' },
    { id: 'quotes-card', name: 'Inspirational Developer Quote' },
    { id: 'custom-badge', name: 'Custom Shields.io Badge' },
    { id: 'external-widget', name: 'External Dynamic Embed' },
  ]

  const records: WidgetHealthRecord[] = []

  for (const w of knownWidgets) {
    const metaKey = REDIS_KEYS.healthWidgetMeta(u, w.id)
    const dailyKey = REDIS_KEYS.healthWidgetDaily(u, w.id, todayStr)

    const [meta, daily] = await Promise.all([
      redis.hgetall<any>(metaKey),
      redis.hgetall<any>(dailyKey),
    ])

    const widgetErr = activeErrors.find((e) => e.widgetId === w.id)
    const renders = Number(daily?.renders || 0)
    const successes = Number(daily?.successes || (widgetErr ? 0 : renders))
    const failures = Number(daily?.failures || (widgetErr ? widgetErr.occurrences : 0))
    const durMs = Number(daily?.durationMs || renders * 25)
    const durCount = Number(daily?.durationCount || renders)
    const avgDuration = durCount > 0 ? Math.round(durMs / durCount) : 26

    const successRate =
      renders > 0
        ? Math.max(0, Math.min(100, Math.round((successes / renders) * 100)))
        : widgetErr
          ? 75
          : 100

    let status: HealthStatus = 'operational'
    if (widgetErr) {
      status = widgetErr.errorType === 'RATE_LIMITED' ? 'warning' : 'failed'
    } else if (meta?.status) {
      status = meta.status as HealthStatus
    }

    records.push({
      widgetId: w.id,
      widgetName: w.name,
      profileSlug: profileSlug || widgetErr?.profileSlug || 'default',
      status,
      lastRenderAt: meta?.lastRenderAt || new Date().toISOString(),
      lastRenderDurationMs: Number(meta?.lastRenderDurationMs || avgDuration),
      avgRenderDurationMs: avgDuration,
      totalRenders: renders,
      totalErrors: failures,
      errorsLast24h: widgetErr ? widgetErr.occurrences : 0,
      successRate,
      lastError: widgetErr
        ? {
            errorType: widgetErr.errorType,
            message: widgetErr.message,
            timestamp: widgetErr.lastSeenAt,
            details: widgetErr.details,
          }
        : undefined,
    })
  }

  return records.sort((a, b) => {
    if (a.status === 'failed' && b.status !== 'failed') return -1
    if (b.status === 'failed' && a.status !== 'failed') return 1
    if (a.status === 'warning' && b.status === 'operational') return -1
    if (b.status === 'warning' && a.status === 'operational') return 1
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

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)

    const profiles = await getUserProfiles(u)
    let dayRenders = 0
    let daySuccesses = 0
    let dayFailures = 0
    let dayDurMs = 0
    let dayDurCount = 0

    for (const p of profiles) {
      const dailyKey = REDIS_KEYS.healthProfileDaily(u, p.slug, dateStr)
      const data = await redis.hgetall<any>(dailyKey)
      if (data) {
        dayRenders += Number(data.renders || 0)
        daySuccesses += Number(data.successes || 0)
        dayFailures += Number(data.failures || 0)
        dayDurMs += Number(data.durationMs || 0)
        dayDurCount += Number(data.durationCount || 0)
      }
    }

    const healthScore =
      dayRenders > 0
        ? Math.max(0, Math.min(100, Math.round((daySuccesses / dayRenders) * 100)))
        : 100

    let status: HealthStatus = 'operational'
    if (dayFailures > 2 || healthScore < 90) status = 'failed'
    else if (dayFailures > 0 || healthScore < 98) status = 'warning'

    points.push({
      timestamp: d.toISOString(),
      date: dateStr,
      healthScore,
      totalRenders: dayRenders,
      failedRenders: dayFailures,
      avgDurationMs: dayDurCount > 0 ? Math.round(dayDurMs / dayDurCount) : 28,
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
    errorType: options?.errorType || 'FETCH_TIMEOUT',
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

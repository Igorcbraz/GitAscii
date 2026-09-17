import { hasDbConfig } from '@/lib/db/client'
import {
  flushAnalyticsBatchToDb,
  getDimensionCountsFromDb,
  getProfileCountsFromDb,
  getTimeSeriesFromDb,
  recordViewInDb,
} from '@/lib/db/repositories/analyticsRepository'

import type {
  AnalyticsSummary,
  DailyDataPoint,
  DimensionMetric,
  HourlyDataPoint,
  IngestViewPayload,
  ProfilePerformanceMetric,
  TelemetryStreamEvent,
  TimeRange,
  WeekdayHourPoint,
} from '../types/analytics'
import { generateAnonymizedVisitorId, parseTrafficType, sanitizeReferrer } from './privacy'
import { getProRedisClient } from './redisClient'

const RETENTION_TTL_SECONDS = 90 * 24 * 60 * 60

export const REDIS_KEYS = {
  userTotals: (u: string) => `gitascii:pro:${u.toLowerCase()}:totals`,
  userProfiles: (u: string) => `gitascii:pro:${u.toLowerCase()}:profiles`,
  userTrackedSlugs: (u: string) => `gitascii:pro:${u.toLowerCase()}:analytics_slugs`,
  profileMeta: (u: string, slug: string) =>
    `gitascii:pro:${u.toLowerCase()}:profile:${slug.toLowerCase()}`,

  dailyMetrics: (u: string, slug: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:daily:${date}`,
  dailyHll: (u: string, slug: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:hll:${date}`,
  hourlyMetrics: (u: string, slug: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:hourly:${date}`,
  weekdayMetrics: (u: string, slug: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:weekday`,

  dimension: (u: string, slug: string, dim: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:dim:${dim}:${date}`,

  activityStream: (u: string) => `gitascii:pro:${u.toLowerCase()}:activity`,
  errorList: (u: string) => `gitascii:pro:${u.toLowerCase()}:errors:list`,
  errorItem: (u: string, id: string) => `gitascii:pro:${u.toLowerCase()}:errors:${id}`,
  errorAlertCooldown: (u: string, widgetId: string) =>
    `gitascii:pro:${u.toLowerCase()}:cooldown:alert:${widgetId}`,

  emailList: (u: string) => `gitascii:pro:${u.toLowerCase()}:emails:list`,
  emailItem: (u: string, id: string) => `gitascii:pro:${u.toLowerCase()}:emails:${id}`,
  testDigestCooldown: (u: string) => `gitascii:pro:${u.toLowerCase()}:test_digest:cooldown`,
  userSettings: (u: string) => `gitascii:pro:${u.toLowerCase()}:settings`,

  profileConfig: (u: string, slug: string) =>
    `gitascii:pro:${u.toLowerCase()}:profile:${slug.toLowerCase()}:config`,
  profileVersions: (u: string, slug: string) =>
    `gitascii:pro:${u.toLowerCase()}:profile:${slug.toLowerCase()}:versions`,
  profileVersionItem: (u: string, slug: string, versionId: string) =>
    `gitascii:pro:${u.toLowerCase()}:profile:${slug.toLowerCase()}:version:${versionId}`,

  dynamicRulesConfig: (u: string) => `gitascii:pro:${u.toLowerCase()}:dynamic:config`,
  dynamicRulesList: (u: string) => `gitascii:pro:${u.toLowerCase()}:dynamic:rules`,
  dynamicRuleItem: (u: string, ruleId: string) =>
    `gitascii:pro:${u.toLowerCase()}:dynamic:rule:${ruleId}`,

  healthProfileDaily: (u: string, slug: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:${slug.toLowerCase()}:health:${date}`,
  healthWidgetDaily: (u: string, widgetId: string, date: string) =>
    `gitascii:pro:${u.toLowerCase()}:widget:${widgetId.toLowerCase()}:health:${date}`,
  healthWidgetMeta: (u: string, widgetId: string) =>
    `gitascii:pro:${u.toLowerCase()}:widget:${widgetId.toLowerCase()}:meta`,
  healthHistoryList: (u: string) => `gitascii:pro:${u.toLowerCase()}:health:history`,
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getRelativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getDaysInRange(timeRange: TimeRange): { start: Date; end: Date; count: number } {
  const end = new Date()
  let count = 30
  if (timeRange === '24h') count = 1
  else if (timeRange === '7d') count = 7
  else if (timeRange === '30d') count = 30
  else if (timeRange === '90d') count = 90
  else if (timeRange === 'all') count = 90

  const start = new Date(end)
  start.setDate(start.getDate() - (count - 1))
  return { start, end, count }
}

interface CachedAnalyticsSummary {
  summary: AnalyticsSummary
  expiresAt: number
}

const analyticsSummaryCache = new Map<string, CachedAnalyticsSummary>()
const ANALYTICS_CACHE_TTL_MS = 60 * 1000

export function invalidateAnalyticsCache(username?: string): void {
  if (username) {
    const prefix = `${username.toLowerCase().trim()}:`
    for (const key of analyticsSummaryCache.keys()) {
      if (key.startsWith(prefix)) {
        analyticsSummaryCache.delete(key)
      }
    }
  } else {
    analyticsSummaryCache.clear()
  }
}

function toDimensionMetrics(counts: Record<string, number>): DimensionMetric[] {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1
  return Object.entries(counts)
    .map(([name, value]) => ({
      name,
      key: name,
      count: value,
      percentage: Math.round((value / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

async function getPostgresAnalyticsSummary(
  username: string,
  selectedSlug: string | null,
  timeRange: TimeRange,
  compareEnabled: boolean
): Promise<AnalyticsSummary> {
  const { start, count } = getDaysInRange(timeRange)
  const currentDates = Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    date.setDate(date.getDate() + index)
    return formatDate(date)
  })
  const previousStart = new Date(start)
  previousStart.setDate(previousStart.getDate() - count)
  const previousDates = Array.from({ length: count }, (_, index) => {
    const date = new Date(previousStart)
    date.setDate(date.getDate() + index)
    return formatDate(date)
  })
  const slug = selectedSlug || undefined
  const [current, previous, sources, trafficTypes, statusCodes, hours, weekdayHours, profiles] =
    await Promise.all([
      getTimeSeriesFromDb(username, currentDates, slug),
      getTimeSeriesFromDb(username, previousDates, slug),
      getDimensionCountsFromDb(username, 'sources', currentDates, slug),
      getDimensionCountsFromDb(username, 'traffic_types', currentDates, slug),
      getDimensionCountsFromDb(username, 'status_codes', currentDates, slug),
      getDimensionCountsFromDb(username, 'hours', currentDates, slug),
      getDimensionCountsFromDb(username, 'weekday_hours', currentDates, slug),
      getProfileCountsFromDb(username, currentDates),
    ])

  const totalRequests = current.reduce((sum, point) => sum + point.views, 0)
  const previousRequests = previous.reduce((sum, point) => sum + point.views, 0)
  const calcGrowth = (value: number, prior: number) =>
    prior === 0 ? (value > 0 ? 100 : 0) : Math.round(((value - prior) / prior) * 100)
  const camoRequests = trafficTypes.camo || 0
  const camoRatio = totalRequests > 0 ? Math.round((camoRequests / totalRequests) * 100) : 0
  const hourlyDistribution: HourlyDataPoint[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: hours[String(hour)] || 0,
    camoViews: hours[String(hour)] || 0,
    directViews: 0,
  }))
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const maxHeatmap = Math.max(1, ...Object.values(weekdayHours))
  const heatmapGrid: WeekdayHourPoint[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const views = weekdayHours[`${day}:${hour}`] || 0
      heatmapGrid.push({
        day,
        dayName: dayNames[day],
        hour,
        views,
        intensity: Math.round((views / maxHeatmap) * 100),
      })
    }
  }
  const peakHourPoint = hourlyDistribution.reduce(
    (peak, point) => (point.views > peak.views ? { hour: point.hour, views: point.views } : peak),
    { hour: 0, views: 0 }
  )
  const dayTotals = dayNames.map((name, day) => ({
    day: name,
    views: heatmapGrid
      .filter((point) => point.day === day)
      .reduce((sum, point) => sum + point.views, 0),
  }))
  const peakDay = dayTotals.reduce((peak, point) => (point.views > peak.views ? point : peak), {
    day: dayNames[0],
    views: 0,
  })
  const timeSeries: DailyDataPoint[] = current.map((point, index) => ({
    date: point.date,
    views: point.views,
    uniques: 0,
    cacheHits: 0,
    camoViews: camoRequests > 0 ? point.views : 0,
    directViews: camoRequests > 0 ? 0 : point.views,
    status200: point.views,
    status304: 0,
    statusError: 0,
    avgLatencyMs: 0,
    previousPeriodViews: previous[index]?.views || 0,
    previousPeriodUniques: 0,
  }))
  const today = timeSeries.find((point) => point.date === formatDate(new Date()))?.views || 0

  return {
    totalViews: totalRequests,
    totalRequests,
    uniqueVisitors: 0,
    uniqueSources: 0,
    estimatedUniqueSources: 0,
    viewsToday: today,
    requestsToday: today,
    uniquesToday: 0,
    uniqueSourcesToday: 0,
    viewsPreviousPeriod: previousRequests,
    uniquesPreviousPeriod: 0,
    growthRateViews: calcGrowth(totalRequests, previousRequests),
    growthRateUniques: 0,
    cacheHitRatio: 0,
    cacheHitsPreviousPeriod: 0,
    growthRateCacheHits: 0,
    avgDailyViews: count > 0 ? Math.round(totalRequests / count) : 0,
    avgDailyRequests: count > 0 ? Math.round(totalRequests / count) : 0,
    avgLatencyMs: 0,
    latencyPreviousPeriod: 0,
    growthRateLatency: 0,
    requestsLast30m: 0,
    activeViewersLast30m: 0,
    camoRatio,
    directRatio: totalRequests > 0 ? 100 - camoRatio : 0,
    peakHour: peakHourPoint,
    peakDay,
    timeSeries,
    hourlyDistribution,
    heatmapGrid,
    topCountries: [],
    topContinents: [],
    topLanguages: [],
    topTimezones: [],
    topSources: toDimensionMetrics(sources),
    topDevices: [],
    topBrowsers: [],
    topOs: [],
    trafficTypes: toDimensionMetrics(trafficTypes),
    themes: [],
    statusCodes: toDimensionMetrics(statusCodes),
    topProfiles: profiles
      .filter((profile) => !selectedSlug || profile.slug === selectedSlug)
      .map((profile) => ({
        slug: profile.slug,
        name: profile.slug === 'default' ? 'Primary GitHub Profile' : profile.slug,
        views: profile.views,
        uniques: 0,
        cacheHitRatio: 0,
        avgLatencyMs: 0,
        percentage: totalRequests > 0 ? Math.round((profile.views / totalRequests) * 100) : 0,
        status: 'active' as const,
      })),
    recentActivity: [],
    range: timeRange,
    compareEnabled,
    updatedAt: new Date().toISOString(),
  }
}

export async function ingestProfileView(payload: IngestViewPayload): Promise<void> {
  try {
    const redis = getProRedisClient()
    const username = payload.username.toLowerCase().trim()
    const slug = (payload.profileSlug || 'default').toLowerCase().trim()
    const now = payload.timestamp ? new Date(payload.timestamp) : new Date()
    const dateStr = formatDate(now)
    const hour = now.getUTCHours()
    const dayOfWeek = now.getUTCDay()
    const statusCode = payload.statusCode || (payload.isCacheHit ? 304 : 200)

    const source = sanitizeReferrer(payload.referrer, payload.isCamoProxy)
    const trafficType = parseTrafficType(payload.userAgent, payload.isCamoProxy, payload.referrer)

    const dimensionsToRecord: [string, string][] = [
      ['sources', source],
      ['traffic_types', trafficType],
      ['status_codes', String(statusCode)],
      ['hours', String(hour)],
      ['weekday_hours', `${dayOfWeek}:${hour}`],
    ]

    if (hasDbConfig()) {
      await recordViewInDb(username, slug, dateStr, false, dimensionsToRecord)
      invalidateAnalyticsCache(username)
      return
    }

    const visitorId = generateAnonymizedVisitorId(payload.ip, payload.userAgent, dateStr)
    const latency = Math.max(1, Math.round(payload.renderTimeMs || 25))
    const eventPayload: TelemetryStreamEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now.toISOString(),
      relativeTime: 'Just now',
      profileSlug: slug,
      country: 'Unknown',
      countryName: 'Unavailable in GitHub-hosted v2',
      flagEmoji: '',
      trafficType,
      device: 'GitHub image proxy',
      browser: 'Unavailable',
      os: 'Unavailable',
      status: statusCode,
      isCacheHit: payload.isCacheHit,
      latencyMs: latency,
    }

    const hllKey = REDIS_KEYS.dailyHll(username, slug, dateStr)
    const dailyKey = REDIS_KEYS.dailyMetrics(username, slug, dateStr)
    const hourlyKey = REDIS_KEYS.hourlyMetrics(username, slug, dateStr)
    const weekdayKey = REDIS_KEYS.weekdayMetrics(username, slug)
    const userTotalsKey = REDIS_KEYS.userTotals(username)
    const profileMetaKey = REDIS_KEYS.profileMeta(username, slug)
    const activityKey = REDIS_KEYS.activityStream(username)

    const p = redis.pipeline()
    p.pfadd(hllKey, visitorId)
    p.expire(hllKey, RETENTION_TTL_SECONDS)

    p.hincrby(dailyKey, 'views', 1)
    if (payload.isCacheHit) {
      p.hincrby(dailyKey, 'cacheHits', 1)
      p.hincrby(dailyKey, 'status304', 1)
    } else {
      p.hincrby(dailyKey, 'status200', 1)
    }
    if (payload.isCamoProxy) {
      p.hincrby(dailyKey, 'camoViews', 1)
    } else {
      p.hincrby(dailyKey, 'directViews', 1)
    }
    p.hincrby(dailyKey, 'totalLatencyMs', latency)
    p.hincrby(dailyKey, 'latencyCount', 1)
    p.expire(dailyKey, RETENTION_TTL_SECONDS)

    p.hincrby(hourlyKey, String(hour), 1)
    if (payload.isCamoProxy) {
      p.hincrby(hourlyKey, `${hour}:camo`, 1)
    } else {
      p.hincrby(hourlyKey, `${hour}:direct`, 1)
    }
    p.expire(hourlyKey, RETENTION_TTL_SECONDS)

    p.hincrby(weekdayKey, `${dayOfWeek}:${hour}`, 1)
    p.expire(weekdayKey, RETENTION_TTL_SECONDS)

    for (const [dimName, dimValue] of dimensionsToRecord) {
      if (!dimValue) continue
      const dimKey = REDIS_KEYS.dimension(username, slug, dimName, dateStr)
      p.hincrby(dimKey, dimValue, 1)
      p.expire(dimKey, RETENTION_TTL_SECONDS)
    }

    p.hincrby(userTotalsKey, 'totalViews', 1)
    p.sadd(REDIS_KEYS.userTrackedSlugs(username), slug)
    p.hincrby(profileMetaKey, 'totalViews', 1)
    p.hset(profileMetaKey, {
      lastViewAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })

    p.zadd(activityKey, {
      score: now.getTime(),
      member: JSON.stringify(eventPayload),
    })
    p.expire(activityKey, RETENTION_TTL_SECONDS)

    await p.exec()

    void redis
      .zrange(activityKey, 0, -1)
      .then((totalEvents) => {
        if (Array.isArray(totalEvents) && totalEvents.length > 50) {
          const itemsToRemove = totalEvents.slice(0, totalEvents.length - 50)
          if (itemsToRemove.length > 0) {
            void redis.zrem(activityKey, ...itemsToRemove)
          }
        }
      })
      .catch((error) => {
        console.warn('[AnalyticsStore] Failed to trim the activity stream:', error)
      })

    invalidateAnalyticsCache(username)
  } catch (err) {
    console.warn('[AnalyticsStore] Error ingesting profile view:', err)
  }
}

export async function flushUserAnalyticsFromRedisToDb(
  username: string,
  targetDateStr?: string
): Promise<void> {
  try {
    const redis = getProRedisClient()
    const cleanUsername = username.toLowerCase().trim()
    const dateStr = targetDateStr || formatDate(new Date())

    const totalsData = await redis.hgetall<Record<string, unknown>>(
      REDIS_KEYS.userTotals(cleanUsername)
    )
    const totalViews = Number(totalsData?.totalViews || 0)

    const trackedSlugs = await redis
      .smembers(REDIS_KEYS.userTrackedSlugs(cleanUsername))
      .catch(() => [])
    const profileSlugs = await redis
      .smembers(REDIS_KEYS.userProfiles(cleanUsername))
      .catch(() => [])
    const slugs = Array.from(
      new Set([...(trackedSlugs || []), ...(profileSlugs || []), 'default'])
    ).filter(Boolean)
    const dailyItems: Array<{ slug: string; dateStr: string; views: number; uniques: number }> = []
    const profileViews: Array<{ slug: string; views: number }> = []

    if (Array.isArray(slugs)) {
      for (const s of slugs) {
        if (!s) continue
        const slug = s.toLowerCase().trim()
        const meta = await redis.hgetall<Record<string, unknown>>(
          REDIS_KEYS.profileMeta(cleanUsername, slug)
        )
        if (meta && meta.totalViews) {
          profileViews.push({ slug, views: Number(meta.totalViews) })
        }

        const daily = await redis.hgetall<Record<string, unknown>>(
          REDIS_KEYS.dailyMetrics(cleanUsername, slug, dateStr)
        )
        const hllKey = REDIS_KEYS.dailyHll(cleanUsername, slug, dateStr)
        const uniques = await redis.pfcount(hllKey).catch(() => 0)

        if (daily && daily.views) {
          dailyItems.push({
            slug,
            dateStr,
            views: Number(daily.views),
            uniques: Number(uniques || 0),
          })
        }
      }
    }

    const totalUniques = dailyItems.reduce((sum, item) => sum + item.uniques, 0)

    await flushAnalyticsBatchToDb(cleanUsername, {
      totalViews,
      totalUniques,
      profileViews,
      daily: dailyItems,
    })
  } catch (err) {
    console.warn(`[AnalyticsStore] Error flushing analytics for @${username} to PostgreSQL:`, err)
  }
}

export async function getAnalyticsSummary(
  username: string,
  profileSlug?: string,
  timeRange: TimeRange = '30d',
  compareEnabled = true
): Promise<AnalyticsSummary> {
  const u = username.toLowerCase().trim()
  const selectedSlug =
    profileSlug && profileSlug !== 'all' ? profileSlug.toLowerCase().trim() : null

  const cacheKey = `${u}:${selectedSlug || 'all'}:${timeRange}:${compareEnabled}`
  const cached = analyticsSummaryCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.summary
  }

  if (hasDbConfig()) {
    const summary = await getPostgresAnalyticsSummary(u, selectedSlug, timeRange, compareEnabled)
    analyticsSummaryCache.set(cacheKey, {
      summary,
      expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
    })
    return summary
  }

  const redis = getProRedisClient()

  let slugsToQuery: string[] = []
  if (selectedSlug) {
    slugsToQuery = [selectedSlug]
  } else {
    const trackedSlugs = await redis.smembers(REDIS_KEYS.userTrackedSlugs(u)).catch(() => [])
    const profileSlugs = await redis.smembers(REDIS_KEYS.userProfiles(u)).catch(() => [])
    const combinedSlugs = Array.from(
      new Set([...(trackedSlugs || []), ...(profileSlugs || []), 'default'])
    ).filter(Boolean)
    slugsToQuery = combinedSlugs.length > 0 ? combinedSlugs : ['default']
  }

  const { start, count } = getDaysInRange(timeRange)

  const currentDateList: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    currentDateList.push(formatDate(d))
  }

  const prevDateList: string[] = []
  const prevStart = new Date(start)
  prevStart.setDate(prevStart.getDate() - count)
  for (let i = 0; i < count; i++) {
    const d = new Date(prevStart)
    d.setDate(d.getDate() + i)
    prevDateList.push(formatDate(d))
  }

  const timeSeriesMap = new Map<
    string,
    {
      views: number
      uniques: number
      cacheHits: number
      camoViews: number
      directViews: number
      status200: number
      status304: number
      statusError: number
      totalLatencyMs: number
      latencyCount: number
    }
  >()

  for (const d of currentDateList) {
    timeSeriesMap.set(d, {
      views: 0,
      uniques: 0,
      cacheHits: 0,
      camoViews: 0,
      directViews: 0,
      status200: 0,
      status304: 0,
      statusError: 0,
      totalLatencyMs: 0,
      latencyCount: 0,
    })
  }

  let totalViews = 0
  let totalCacheHits = 0
  let totalCamoViews = 0
  let totalLatencyMs = 0
  let totalLatencyCount = 0
  let dbProfileCounts: Array<{ slug: string; views: number }> = []
  const hourlyDataPointsFromDb = new Map<number, number>()
  const weekdayDataFromDb = new Map<string, number>()

  const sourceCounts: Record<string, number> = {}
  const trafficTypeCounts: Record<string, number> = {}
  const _themeCounts: Record<string, number> = {}
  const statusCodeCounts: Record<string, number> = {}

  const currentPipeline = redis.pipeline()
  const queryMeta: Array<{ slug: string; dateStr: string }> = []
  const dimsList = ['sources', 'traffic_types', 'status_codes']

  for (const slug of slugsToQuery) {
    for (const dateStr of currentDateList) {
      queryMeta.push({ slug, dateStr })
      currentPipeline.hgetall(REDIS_KEYS.dailyMetrics(u, slug, dateStr))
      currentPipeline.pfcount(REDIS_KEYS.dailyHll(u, slug, dateStr))
      for (const dim of dimsList) {
        currentPipeline.hgetall(REDIS_KEYS.dimension(u, slug, dim, dateStr))
      }
    }
  }

  const currentPipelineResults = await currentPipeline.exec<any[]>()
  const itemsPerQuery = 2 + dimsList.length

  const mergeMap = (
    src: Record<string, string | number> | null,
    target: Record<string, number>
  ) => {
    if (!src) return
    for (const [k, v] of Object.entries(src)) {
      target[k] = (target[k] || 0) + Number(v)
    }
  }

  for (let idx = 0; idx < queryMeta.length; idx++) {
    const { dateStr } = queryMeta[idx]
    const baseIndex = idx * itemsPerQuery
    const dailyData = currentPipelineResults[baseIndex] as Record<string, string | number> | null
    const uniquesCount = Number(currentPipelineResults[baseIndex + 1] || 0)

    const entry = timeSeriesMap.get(dateStr)!
    const views = Number(dailyData?.views || 0)
    const cacheHits = Number(dailyData?.cacheHits || 0)
    const camoViews = Number(dailyData?.camoViews || 0)
    const directViews = Number(dailyData?.directViews || views - camoViews)
    const s200 = Number(dailyData?.status200 || views - cacheHits)
    const s304 = Number(dailyData?.status304 || cacheHits)
    const sErr = Number(dailyData?.statusError || 0)
    const latMs = Number(dailyData?.totalLatencyMs || views * 35)
    const latCount = Number(dailyData?.latencyCount || views)

    const effectiveUniques = uniquesCount

    entry.views += views
    entry.uniques += effectiveUniques
    entry.cacheHits += cacheHits
    entry.camoViews += camoViews
    entry.directViews += directViews
    entry.status200 += s200
    entry.status304 += s304
    entry.statusError += sErr
    entry.totalLatencyMs += latMs
    entry.latencyCount += latCount

    totalViews += views
    totalCacheHits += cacheHits
    totalCamoViews += camoViews
    totalLatencyMs += latMs
    totalLatencyCount += latCount

    mergeMap(currentPipelineResults[baseIndex + 2], sourceCounts)
    mergeMap(currentPipelineResults[baseIndex + 3], trafficTypeCounts)
    mergeMap(currentPipelineResults[baseIndex + 4], statusCodeCounts)
  }

  let prevViews = 0
  let prevCacheHits = 0
  let prevLatencyMs = 0
  let prevLatencyCount = 0
  const prevHllKeys: string[] = []
  const prevTimeSeriesMap = new Map<number, { views: number; uniques: number }>()

  const prevPipeline = redis.pipeline()
  const prevMeta: Array<{ dayIndex: number; dateStr: string; slug: string }> = []
  for (let i = 0; i < prevDateList.length; i++) {
    const prevDateStr = prevDateList[i]
    for (const slug of slugsToQuery) {
      prevHllKeys.push(REDIS_KEYS.dailyHll(u, slug, prevDateStr))
      prevMeta.push({ dayIndex: i, dateStr: prevDateStr, slug })
      prevPipeline.hgetall(REDIS_KEYS.dailyMetrics(u, slug, prevDateStr))
    }
  }

  const prevResults = await prevPipeline.exec<any[]>()
  const prevDailyViews = new Map<number, number>()

  for (let idx = 0; idx < prevMeta.length; idx++) {
    const { dayIndex } = prevMeta[idx]
    const data = prevResults[idx] as Record<string, string | number> | null
    const views = Number(data?.views || 0)
    const cacheHits = Number(data?.cacheHits || 0)
    const latMs = Number(data?.totalLatencyMs || views * 35)
    const latCount = Number(data?.latencyCount || views)

    prevDailyViews.set(dayIndex, (prevDailyViews.get(dayIndex) || 0) + views)
    prevViews += views
    prevCacheHits += cacheHits
    prevLatencyMs += latMs
    prevLatencyCount += latCount
  }

  for (let i = 0; i < prevDateList.length; i++) {
    const dayViews = prevDailyViews.get(i) || 0
    prevTimeSeriesMap.set(i, { views: dayViews, uniques: 0 })
  }

  let prevUniques = 0
  try {
    if (prevHllKeys.length > 0) {
      prevUniques = await redis.pfcount(...prevHllKeys)
    }
  } catch {
    prevUniques = 0
  }
  if (prevUniques === 0 && prevViews > 0) {
    prevUniques = 0
  }

  const currentHllKeys: string[] = []
  for (const slug of slugsToQuery) {
    for (const d of currentDateList) {
      currentHllKeys.push(REDIS_KEYS.dailyHll(u, slug, d))
    }
  }
  let totalUniques = 0
  try {
    if (currentHllKeys.length > 0) {
      totalUniques = await redis.pfcount(...currentHllKeys)
    }
  } catch {
    totalUniques = 0
  }
  if (totalUniques === 0 && totalViews > 0) {
    totalUniques = 0
  }

  if (totalViews === 0) {
    try {
      const [
        dbTimeSeries,
        dbPreviousTimeSeries,
        dbSources,
        dbTrafficTypes,
        dbStatusCodes,
        dbHours,
        dbWeekdayHours,
        profiles,
      ] = await Promise.all([
        getTimeSeriesFromDb(u, currentDateList, selectedSlug || undefined),
        getTimeSeriesFromDb(u, prevDateList, selectedSlug || undefined),
        getDimensionCountsFromDb(u, 'sources', currentDateList, selectedSlug || undefined),
        getDimensionCountsFromDb(u, 'traffic_types', currentDateList, selectedSlug || undefined),
        getDimensionCountsFromDb(u, 'status_codes', currentDateList, selectedSlug || undefined),
        getDimensionCountsFromDb(u, 'hours', currentDateList, selectedSlug || undefined),
        getDimensionCountsFromDb(u, 'weekday_hours', currentDateList, selectedSlug || undefined),
        getProfileCountsFromDb(u, currentDateList),
      ])
      dbProfileCounts = profiles
      mergeMap(dbSources, sourceCounts)
      mergeMap(dbTrafficTypes, trafficTypeCounts)
      mergeMap(dbStatusCodes, statusCodeCounts)
      if (dbTimeSeries.length > 0) {
        let dbTotalViews = 0
        for (const pt of dbTimeSeries) {
          if (pt.views > 0) {
            dbTotalViews += pt.views
            const entry = timeSeriesMap.get(pt.date)
            if (entry) {
              entry.views = pt.views
              entry.uniques = 0
              entry.camoViews = dbTrafficTypes.camo ? pt.views : 0
              entry.directViews = dbTrafficTypes.camo ? 0 : pt.views
              entry.status200 = pt.views
            }
          }
        }
        if (dbTotalViews > 0) {
          totalViews = dbTotalViews
          totalUniques = 0
        }
      }
      prevViews = dbPreviousTimeSeries.reduce((sum, point) => sum + point.views, 0)
      for (let index = 0; index < dbPreviousTimeSeries.length; index++) {
        prevTimeSeriesMap.set(index, {
          views: dbPreviousTimeSeries[index].views,
          uniques: 0,
        })
      }
      totalCamoViews = dbTrafficTypes.camo || 0
      for (const [rawHour, views] of Object.entries(dbHours)) {
        const parsedHour = Number(rawHour)
        if (parsedHour >= 0 && parsedHour < 24) {
          hourlyDataPointsFromDb.set(parsedHour, views)
        }
      }
      for (const [key, views] of Object.entries(dbWeekdayHours)) {
        weekdayDataFromDb.set(key, views)
      }
    } catch (error) {
      console.warn('[AnalyticsStore] Failed to load analytics dimensions from PostgreSQL:', error)
    }
  }

  const timeSeries: DailyDataPoint[] = currentDateList.map((d, index) => {
    const entry = timeSeriesMap.get(d)!
    const prevPoint = prevTimeSeriesMap.get(index)
    const avgLat =
      entry.latencyCount > 0 ? Math.round(entry.totalLatencyMs / entry.latencyCount) : 0

    return {
      date: d,
      views: entry.views,
      uniques: entry.uniques,
      cacheHits: entry.cacheHits,
      camoViews: entry.camoViews,
      directViews: entry.directViews,
      status200: entry.status200,
      status304: entry.status304,
      statusError: entry.statusError,
      avgLatencyMs: avgLat,
      previousPeriodViews: prevPoint?.views || 0,
      previousPeriodUniques: prevPoint?.uniques || 0,
    }
  })

  const todayStr = formatDate(new Date())
  const hourlyDataPoints: HourlyDataPoint[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    views: hourlyDataPointsFromDb.get(i) || 0,
    camoViews: hourlyDataPointsFromDb.get(i) || 0,
    directViews: 0,
  }))

  const miscPipeline = redis.pipeline()
  for (const slug of slugsToQuery) {
    miscPipeline.hgetall(REDIS_KEYS.hourlyMetrics(u, slug, todayStr))
    miscPipeline.hgetall(REDIS_KEYS.weekdayMetrics(u, slug))
  }
  const miscResults = await miscPipeline.exec<any[]>()

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const heatmapGrid: WeekdayHourPoint[] = []
  const weekdayTotals: Record<number, number> = {}
  let maxHeatmapViews = 1
  const weekdayRawMap = new Map<string, number>()
  for (const [key, views] of weekdayDataFromDb) weekdayRawMap.set(key, views)

  for (let sIdx = 0; sIdx < slugsToQuery.length; sIdx++) {
    const hourlyData = miscResults[sIdx * 2] as Record<string, string | number> | null
    const weekdayData = miscResults[sIdx * 2 + 1] as Record<string, string | number> | null

    if (hourlyData) {
      for (let h = 0; h < 24; h++) {
        const v = Number(hourlyData[String(h)] || 0)
        const camo = Number(hourlyData[`${h}:camo`] || 0)
        const direct = Number(hourlyData[`${h}:direct`] || v - camo)
        hourlyDataPoints[h].views += v
        hourlyDataPoints[h].camoViews += camo
        hourlyDataPoints[h].directViews += direct
      }
    }

    if (weekdayData) {
      for (const [k, v] of Object.entries(weekdayData)) {
        const countVal = Number(v)
        const currentVal = (weekdayRawMap.get(k) || 0) + countVal
        weekdayRawMap.set(k, currentVal)
        if (currentVal > maxHeatmapViews) maxHeatmapViews = currentVal
      }
    }
  }

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const views = weekdayRawMap.get(`${d}:${h}`) || 0
      weekdayTotals[d] = (weekdayTotals[d] || 0) + views
      heatmapGrid.push({
        day: d,
        dayName: dayNames[d],
        hour: h,
        views,
        intensity: Math.round((views / maxHeatmapViews) * 100),
      })
    }
  }

  let peakHour = { hour: 14, views: 0 }
  for (const h of hourlyDataPoints) {
    if (h.views > peakHour.views) {
      peakHour = { hour: h.hour, views: h.views }
    }
  }

  let peakDay = { day: 'Wednesday', views: 0 }
  for (let d = 0; d < 7; d++) {
    const views = weekdayTotals[d] || 0
    if (views > peakDay.views) {
      peakDay = { day: dayNames[d], views }
    }
  }

  function formatGenericDim(counts: Record<string, number>): DimensionMetric[] {
    const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        key: name,
        count,
        percentage: Math.round((count / sum) * 100),
      }))
      .sort((a, b) => b.count - a.count)
  }

  const topSources = formatGenericDim(sourceCounts)
  const trafficTypes = formatGenericDim(trafficTypeCounts)
  const statusCodes = formatGenericDim(statusCodeCounts)

  const trackedSlugsForTop = await redis.smembers(REDIS_KEYS.userTrackedSlugs(u)).catch(() => [])
  const profileSlugsForTop = await redis.smembers(REDIS_KEYS.userProfiles(u)).catch(() => [])
  const profileList = Array.from(
    new Set([...(trackedSlugsForTop || []), ...(profileSlugsForTop || []), 'default'])
  ).filter(Boolean)
  const topProfiles: ProfilePerformanceMetric[] = []

  const profilesPipeline = redis.pipeline()
  for (const slug of profileList) {
    profilesPipeline.hgetall(REDIS_KEYS.profileMeta(u, slug))
    for (const d of currentDateList) {
      profilesPipeline.hgetall(REDIS_KEYS.dailyMetrics(u, slug, d))
    }
  }
  const profilesResults = await profilesPipeline.exec<any[]>()
  const itemsPerProfile = 1 + currentDateList.length

  for (let pIdx = 0; pIdx < profileList.length; pIdx++) {
    const slug = profileList[pIdx]
    const basePIdx = pIdx * itemsPerProfile
    const meta = profilesResults[basePIdx] as Record<string, any> | null
    let slugViews = 0
    let slugCacheHits = 0
    let slugLatencyMs = 0
    let slugLatencyCount = 0

    for (let dIdx = 0; dIdx < currentDateList.length; dIdx++) {
      const dData = profilesResults[basePIdx + 1 + dIdx] as Record<string, any> | null
      const v = Number(dData?.views || 0)
      slugViews += v
      slugCacheHits += Number(dData?.cacheHits || 0)
      slugLatencyMs += Number(dData?.totalLatencyMs || v * 35)
      slugLatencyCount += Number(dData?.latencyCount || v)
    }

    const hitRatio = slugViews > 0 ? Math.round((slugCacheHits / slugViews) * 100) : 0
    const avgLat = slugLatencyCount > 0 ? Math.round(slugLatencyMs / slugLatencyCount) : 0

    topProfiles.push({
      slug,
      name: meta?.name || (slug === 'default' ? 'Primary GitHub Profile' : slug),
      views: slugViews,
      uniques: 0,
      cacheHitRatio: hitRatio,
      avgLatencyMs: avgLat,
      percentage: totalViews > 0 ? Math.round((slugViews / totalViews) * 100) : 0,
      lastViewAt: meta?.lastViewAt,
      status: (meta?.status as 'active' | 'draft' | 'archived') || 'active',
    })
  }
  if (dbProfileCounts.length > 0) {
    topProfiles.length = 0
    for (const profile of dbProfileCounts) {
      topProfiles.push({
        slug: profile.slug,
        name: profile.slug === 'default' ? 'Primary GitHub Profile' : profile.slug,
        views: profile.views,
        uniques: 0,
        cacheHitRatio: 0,
        avgLatencyMs: 0,
        percentage: totalViews > 0 ? Math.round((profile.views / totalViews) * 100) : 0,
        status: 'active',
      })
    }
  }
  topProfiles.sort((a, b) => b.views - a.views)

  const activityRaw = await redis.zrevrange<string[]>(REDIS_KEYS.activityStream(u), 0, 49)
  const recentActivity: TelemetryStreamEvent[] = []
  let activeLast30m = 0
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000

  if (Array.isArray(activityRaw)) {
    for (const item of activityRaw) {
      try {
        const ev: TelemetryStreamEvent = typeof item === 'string' ? JSON.parse(item) : item
        if (ev && ev.timestamp) {
          ev.relativeTime = getRelativeTime(ev.timestamp)
          if (new Date(ev.timestamp).getTime() >= thirtyMinutesAgo) {
            activeLast30m++
          }
          if (selectedSlug && ev.profileSlug !== selectedSlug) {
            continue
          }
          recentActivity.push(ev)
        }
      } catch (error) {
        console.warn('[AnalyticsStore] Ignoring malformed activity entry:', error)
      }
    }
  }

  const todayPoint = timeSeries.find((p) => p.date === todayStr)
  const viewsToday = todayPoint?.views || 0
  const uniquesToday = todayPoint?.uniques || 0

  const calcGrowth = (curr: number, prev: number): number => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const growthRateViews = calcGrowth(totalViews, prevViews)
  const growthRateUniques = calcGrowth(totalUniques, prevUniques)

  const cacheHitRatio = totalViews > 0 ? Math.round((totalCacheHits / totalViews) * 100) : 0
  const prevCacheHitRatio = prevViews > 0 ? Math.round((prevCacheHits / prevViews) * 100) : 0
  const growthRateCacheHits = prevCacheHitRatio > 0 ? cacheHitRatio - prevCacheHitRatio : 0

  const avgDailyViews = count > 0 ? Math.round(totalViews / count) : 0
  const avgLatencyMs = totalLatencyCount > 0 ? Math.round(totalLatencyMs / totalLatencyCount) : 0
  const prevAvgLatency = prevLatencyCount > 0 ? Math.round(prevLatencyMs / prevLatencyCount) : 32
  const growthRateLatency = calcGrowth(avgLatencyMs, prevAvgLatency)

  const camoRatio = totalViews > 0 ? Math.round((totalCamoViews / totalViews) * 100) : 0
  const directRatio = totalViews > 0 ? Math.max(0, 100 - camoRatio) : 0

  const summaryResult: AnalyticsSummary = {
    totalViews,
    totalRequests: totalViews,
    uniqueVisitors: totalUniques,
    uniqueSources: totalUniques,
    estimatedUniqueSources: totalUniques,
    viewsToday,
    requestsToday: viewsToday,
    uniquesToday,
    uniqueSourcesToday: uniquesToday,
    viewsPreviousPeriod: prevViews,
    uniquesPreviousPeriod: prevUniques,
    growthRateViews,
    growthRateUniques,
    cacheHitRatio,
    cacheHitsPreviousPeriod: prevCacheHits,
    growthRateCacheHits,
    avgDailyViews,
    avgDailyRequests: avgDailyViews,
    avgLatencyMs,
    latencyPreviousPeriod: prevAvgLatency,
    growthRateLatency,
    requestsLast30m: activeLast30m,
    activeViewersLast30m: activeLast30m,
    camoRatio,
    directRatio,
    peakHour,
    peakDay,
    timeSeries,
    hourlyDistribution: hourlyDataPoints,
    heatmapGrid,
    // Badge requests are normally made by GitHub Camo. They cannot truthfully reveal the
    // viewer's geography, device, browser, OS, language, or timezone.
    topCountries: [],
    topContinents: [],
    topLanguages: [],
    topTimezones: [],
    topSources,
    topDevices: [],
    topBrowsers: [],
    topOs: [],
    trafficTypes,
    themes: [],
    statusCodes,
    topProfiles,
    recentActivity,
    range: timeRange,
    compareEnabled,
    updatedAt: new Date().toISOString(),
  }

  analyticsSummaryCache.set(cacheKey, {
    summary: summaryResult,
    expiresAt: Date.now() + ANALYTICS_CACHE_TTL_MS,
  })

  return summaryResult
}

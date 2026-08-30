import type {
  AnalyticsSummary,
  ContinentMetric,
  CountryMetric,
  DailyDataPoint,
  DimensionMetric,
  HourlyDataPoint,
  IngestViewPayload,
  ProfilePerformanceMetric,
  TelemetryStreamEvent,
  TimeRange,
  WeekdayHourPoint,
} from '../types/analytics'
import {
  getCountryContinent,
  getCountryFlagEmoji,
  getCountryName,
  getLanguageName,
} from './geoData'
import {
  generateAnonymizedVisitorId,
  parseBrowser,
  parseDeviceType,
  parseLanguage,
  parseOperatingSystem,
  parseTrafficType,
  sanitizeCity,
  sanitizeCountryCode,
  sanitizeReferrer,
  sanitizeRegion,
  sanitizeTimezone,
} from './privacy'
import { getProRedisClient } from './redisClient'

const RETENTION_TTL_SECONDS = 90 * 24 * 60 * 60

export const REDIS_KEYS = {
  userTotals: (u: string) => `gitascii:pro:${u.toLowerCase()}:totals`,
  userProfiles: (u: string) => `gitascii:pro:${u.toLowerCase()}:profiles`,
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

    const visitorId = generateAnonymizedVisitorId(payload.ip, payload.userAgent, dateStr)
    const country = sanitizeCountryCode(payload.country)
    const countryName = getCountryName(country)
    const continent = getCountryContinent(country)
    const flagEmoji = getCountryFlagEmoji(country)
    const region = sanitizeRegion(payload.region)
    const city = sanitizeCity(payload.city)
    const timezone = sanitizeTimezone(payload.timezone)
    const language = parseLanguage(payload.language)
    const source = sanitizeReferrer(payload.referrer, payload.isCamoProxy)
    const device = parseDeviceType(payload.userAgent, payload.isCamoProxy)
    const browser = parseBrowser(payload.userAgent, payload.isCamoProxy)
    const os = parseOperatingSystem(payload.userAgent, payload.isCamoProxy)
    const trafficType = parseTrafficType(payload.userAgent, payload.isCamoProxy, payload.referrer)
    const latency = Math.max(1, Math.round(payload.renderTimeMs || 25))

    const hllKey = REDIS_KEYS.dailyHll(username, slug, dateStr)
    await redis.pfadd(hllKey, visitorId)
    await redis.expire(hllKey, RETENTION_TTL_SECONDS)

    const dailyKey = REDIS_KEYS.dailyMetrics(username, slug, dateStr)
    await redis.hincrby(dailyKey, 'views', 1)
    if (payload.isCacheHit) {
      await redis.hincrby(dailyKey, 'cacheHits', 1)
      await redis.hincrby(dailyKey, 'status304', 1)
    } else {
      await redis.hincrby(dailyKey, 'status200', 1)
    }
    if (payload.isCamoProxy) {
      await redis.hincrby(dailyKey, 'camoViews', 1)
    } else {
      await redis.hincrby(dailyKey, 'directViews', 1)
    }
    await redis.hincrby(dailyKey, 'totalLatencyMs', latency)
    await redis.hincrby(dailyKey, 'latencyCount', 1)
    await redis.expire(dailyKey, RETENTION_TTL_SECONDS)

    const hourlyKey = REDIS_KEYS.hourlyMetrics(username, slug, dateStr)
    await redis.hincrby(hourlyKey, String(hour), 1)
    if (payload.isCamoProxy) {
      await redis.hincrby(hourlyKey, `${hour}:camo`, 1)
    } else {
      await redis.hincrby(hourlyKey, `${hour}:direct`, 1)
    }
    await redis.expire(hourlyKey, RETENTION_TTL_SECONDS)

    const weekdayKey = REDIS_KEYS.weekdayMetrics(username, slug)
    await redis.hincrby(weekdayKey, `${dayOfWeek}:${hour}`, 1)
    await redis.expire(weekdayKey, RETENTION_TTL_SECONDS)

    const dimensionsToRecord: [string, string][] = [
      ['countries', country],
      ['continents', continent.name],
      ['regions', region !== 'Unknown' ? `${country}-${region}` : country],
      ['languages', language],
      ['timezones', timezone],
      ['sources', source],
      ['devices', device],
      ['browsers', browser],
      ['os', os],
      ['traffic_types', trafficType],
      ['status_codes', String(statusCode)],
    ]

    for (const [dimName, dimValue] of dimensionsToRecord) {
      if (!dimValue) continue
      const dimKey = REDIS_KEYS.dimension(username, slug, dimName, dateStr)
      await redis.hincrby(dimKey, dimValue, 1)
      await redis.expire(dimKey, RETENTION_TTL_SECONDS)
    }

    const userTotalsKey = REDIS_KEYS.userTotals(username)
    await redis.hincrby(userTotalsKey, 'totalViews', 1)

    const profilesSetKey = REDIS_KEYS.userProfiles(username)
    await redis.sadd(profilesSetKey, slug)

    const profileMetaKey = REDIS_KEYS.profileMeta(username, slug)
    await redis.hincrby(profileMetaKey, 'totalViews', 1)
    await redis.hset(profileMetaKey, {
      lastViewAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })

    const activityKey = REDIS_KEYS.activityStream(username)
    const eventPayload: TelemetryStreamEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now.toISOString(),
      relativeTime: 'Just now',
      profileSlug: slug,
      country,
      countryName,
      flagEmoji,
      city: city !== 'Unknown' ? city : undefined,
      trafficType,
      device,
      browser,
      os,
      status: statusCode,
      isCacheHit: payload.isCacheHit,
      latencyMs: latency,
    }

    await redis.zadd(activityKey, {
      score: now.getTime(),
      member: JSON.stringify(eventPayload),
    })
    await redis.expire(activityKey, RETENTION_TTL_SECONDS)

    const totalEvents = await redis.zrange(activityKey, 0, -1)
    if (Array.isArray(totalEvents) && totalEvents.length > 50) {
      const itemsToRemove = totalEvents.slice(0, totalEvents.length - 50)
      if (itemsToRemove.length > 0) {
        await redis.zrem(activityKey, ...itemsToRemove)
      }
    }
  } catch (err) {
    console.warn('[AnalyticsStore] Error ingesting profile view:', err)
  }
}

export async function getAnalyticsSummary(
  username: string,
  profileSlug?: string,
  timeRange: TimeRange = '30d',
  compareEnabled = true
): Promise<AnalyticsSummary> {
  const redis = getProRedisClient()
  const u = username.toLowerCase().trim()
  const selectedSlug =
    profileSlug && profileSlug !== 'all' ? profileSlug.toLowerCase().trim() : null

  let slugsToQuery: string[] = []
  if (selectedSlug) {
    slugsToQuery = [selectedSlug]
  } else {
    const allSlugs = await redis.smembers(REDIS_KEYS.userProfiles(u))
    slugsToQuery = allSlugs && allSlugs.length > 0 ? allSlugs : ['default']
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

  const countryCounts: Record<string, number> = {}
  const continentCounts: Record<string, number> = {}
  const languageCounts: Record<string, number> = {}
  const timezoneCounts: Record<string, number> = {}
  const sourceCounts: Record<string, number> = {}
  const deviceCounts: Record<string, number> = {}
  const browserCounts: Record<string, number> = {}
  const osCounts: Record<string, number> = {}
  const trafficTypeCounts: Record<string, number> = {}
  const themeCounts: Record<string, number> = {}
  const statusCodeCounts: Record<string, number> = {}

  for (const slug of slugsToQuery) {
    for (const dateStr of currentDateList) {
      const dailyKey = REDIS_KEYS.dailyMetrics(u, slug, dateStr)
      const hllKey = REDIS_KEYS.dailyHll(u, slug, dateStr)

      const [dailyData, uniquesCount] = await Promise.all([
        redis.hgetall<Record<string, string | number>>(dailyKey),
        redis.pfcount(hllKey).catch(() => 0),
      ])

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

      const effectiveUniques = uniquesCount || (views > 0 ? Math.ceil(views * 0.75) : 0)

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

      const [cDim, contDim, lDim, tzDim, sDim, dDim, bDim, oDim, ttDim, scDim] = await Promise.all([
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'countries', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'continents', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'languages', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'timezones', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'sources', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'devices', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'browsers', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'os', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'traffic_types', dateStr)
        ),
        redis.hgetall<Record<string, string | number>>(
          REDIS_KEYS.dimension(u, slug, 'status_codes', dateStr)
        ),
      ])

      const mergeMap = (
        src: Record<string, string | number> | null,
        target: Record<string, number>
      ) => {
        if (!src) return
        for (const [k, v] of Object.entries(src)) {
          target[k] = (target[k] || 0) + Number(v)
        }
      }

      mergeMap(cDim, countryCounts)
      mergeMap(contDim, continentCounts)
      mergeMap(lDim, languageCounts)
      mergeMap(tzDim, timezoneCounts)
      mergeMap(sDim, sourceCounts)
      mergeMap(dDim, deviceCounts)
      mergeMap(bDim, browserCounts)
      mergeMap(oDim, osCounts)
      mergeMap(ttDim, trafficTypeCounts)
      mergeMap(scDim, statusCodeCounts)
    }
  }

  let prevViews = 0
  let prevCacheHits = 0
  let prevLatencyMs = 0
  let prevLatencyCount = 0
  const prevHllKeys: string[] = []
  const prevTimeSeriesMap = new Map<number, { views: number; uniques: number }>()

  for (let i = 0; i < prevDateList.length; i++) {
    const prevDateStr = prevDateList[i]
    let dayViews = 0
    for (const slug of slugsToQuery) {
      prevHllKeys.push(REDIS_KEYS.dailyHll(u, slug, prevDateStr))
      const dailyKey = REDIS_KEYS.dailyMetrics(u, slug, prevDateStr)
      const data = await redis.hgetall<Record<string, string | number>>(dailyKey)
      const views = Number(data?.views || 0)
      const cacheHits = Number(data?.cacheHits || 0)
      const latMs = Number(data?.totalLatencyMs || views * 35)
      const latCount = Number(data?.latencyCount || views)

      dayViews += views
      prevViews += views
      prevCacheHits += cacheHits
      prevLatencyMs += latMs
      prevLatencyCount += latCount
    }
    prevTimeSeriesMap.set(i, { views: dayViews, uniques: Math.ceil(dayViews * 0.75) })
  }

  let prevUniques = 0
  try {
    if (prevHllKeys.length > 0) {
      prevUniques = await redis.pfcount(...prevHllKeys)
    }
  } catch {
    prevUniques = Math.ceil(prevViews * 0.75)
  }
  if (prevUniques === 0 && prevViews > 0) {
    prevUniques = Math.ceil(prevViews * 0.75)
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
    totalUniques = Math.ceil(totalViews * 0.75)
  }
  if (totalUniques === 0 && totalViews > 0) {
    totalUniques = Math.ceil(totalViews * 0.75)
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
    views: 0,
    camoViews: 0,
    directViews: 0,
  }))

  for (const slug of slugsToQuery) {
    const hourlyData = await redis.hgetall<Record<string, string | number>>(
      REDIS_KEYS.hourlyMetrics(u, slug, todayStr)
    )
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
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const heatmapGrid: WeekdayHourPoint[] = []
  const weekdayTotals: Record<number, number> = {}

  let maxHeatmapViews = 1
  const weekdayRawMap = new Map<string, number>()

  for (const slug of slugsToQuery) {
    const weekdayData = await redis.hgetall<Record<string, string | number>>(
      REDIS_KEYS.weekdayMetrics(u, slug)
    )
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

  const topCountries: CountryMetric[] = Object.entries(countryCounts)
    .map(([code, count]) => {
      const sum = totalViews || 1
      const continentInfo = getCountryContinent(code)
      return {
        code,
        name: getCountryName(code),
        key: code,
        continent: continentInfo.name,
        continentCode: continentInfo.code,
        flagEmoji: getCountryFlagEmoji(code),
        count,
        percentage: Math.round((count / sum) * 100),
        uniques: Math.ceil(count * 0.75),
      }
    })
    .sort((a, b) => b.count - a.count)

  const topContinents: ContinentMetric[] = Object.entries(continentCounts)
    .map(([name, count]) => {
      const sum = totalViews || 1
      return {
        name,
        key: name,
        code: name.slice(0, 2).toUpperCase(),
        count,
        percentage: Math.round((count / sum) * 100),
      }
    })
    .sort((a, b) => b.count - a.count)

  const topLanguages: DimensionMetric[] = Object.entries(languageCounts)
    .map(([code, count]) => {
      const sum = totalViews || 1
      return {
        name: getLanguageName(code),
        key: code,
        count,
        percentage: Math.round((count / sum) * 100),
      }
    })
    .sort((a, b) => b.count - a.count)

  const topSources = formatGenericDim(sourceCounts)
  const topDevices = formatGenericDim(deviceCounts)
  const topBrowsers = formatGenericDim(browserCounts)
  const topOs = formatGenericDim(osCounts)
  const trafficTypes = formatGenericDim(trafficTypeCounts)
  const statusCodes = formatGenericDim(statusCodeCounts)
  const topTimezones = formatGenericDim(timezoneCounts)

  const allUserSlugs = await redis.smembers(REDIS_KEYS.userProfiles(u))
  const profileList = allUserSlugs && allUserSlugs.length > 0 ? allUserSlugs : ['default']
  const topProfiles: ProfilePerformanceMetric[] = []

  for (const slug of profileList) {
    const meta = await redis.hgetall<any>(REDIS_KEYS.profileMeta(u, slug))
    let slugViews = 0
    let slugCacheHits = 0
    let slugLatencyMs = 0
    let slugLatencyCount = 0

    for (const d of currentDateList) {
      const dData = await redis.hgetall<any>(REDIS_KEYS.dailyMetrics(u, slug, d))
      const v = Number(dData?.views || 0)
      slugViews += v
      slugCacheHits += Number(dData?.cacheHits || 0)
      slugLatencyMs += Number(dData?.totalLatencyMs || v * 35)
      slugLatencyCount += Number(dData?.latencyCount || v)
    }

    const hitRatio = slugViews > 0 ? Math.round((slugCacheHits / slugViews) * 100) : 0
    const avgLat = slugLatencyCount > 0 ? Math.round(slugLatencyMs / slugLatencyCount) : 28

    topProfiles.push({
      slug,
      name: meta?.name || (slug === 'default' ? 'Primary GitHub Profile' : slug),
      views: slugViews,
      uniques: Math.ceil(slugViews * 0.75),
      cacheHitRatio: hitRatio,
      avgLatencyMs: avgLat,
      percentage: totalViews > 0 ? Math.round((slugViews / totalViews) * 100) : 0,
      lastViewAt: meta?.lastViewAt,
      status: (meta?.status as 'active' | 'draft' | 'archived') || 'active',
    })
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
      } catch {}
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
  const avgLatencyMs = totalLatencyCount > 0 ? Math.round(totalLatencyMs / totalLatencyCount) : 28
  const prevAvgLatency = prevLatencyCount > 0 ? Math.round(prevLatencyMs / prevLatencyCount) : 32
  const growthRateLatency = calcGrowth(avgLatencyMs, prevAvgLatency)

  const camoRatio = totalViews > 0 ? Math.round((totalCamoViews / totalViews) * 100) : 0
  const directRatio = totalViews > 0 ? Math.max(0, 100 - camoRatio) : 0

  const effectiveTopCountries =
    topCountries.length > 0
      ? topCountries
      : [
          {
            name: 'United States',
            code: 'US',
            key: 'US',
            continent: 'North America',
            continentCode: 'NA',
            flagEmoji: '🇺🇸',
            count: 0,
            percentage: 0,
            uniques: 0,
          },
          {
            name: 'Brazil',
            code: 'BR',
            key: 'BR',
            continent: 'South America',
            continentCode: 'SA',
            flagEmoji: '🇧🇷',
            count: 0,
            percentage: 0,
            uniques: 0,
          },
          {
            name: 'Germany',
            code: 'DE',
            key: 'DE',
            continent: 'Europe',
            continentCode: 'EU',
            flagEmoji: '🇩🇪',
            count: 0,
            percentage: 0,
            uniques: 0,
          },
        ]

  const effectiveTopSources =
    topSources.length > 0
      ? topSources
      : [
          { name: 'GitHub README (Camo Proxy)', key: 'GitHub Camo', count: 0, percentage: 0 },
          { name: 'Direct / Portfolio Embed', key: 'Direct', count: 0, percentage: 0 },
          { name: 'Direct / No Referrer', key: 'No Referrer', count: 0, percentage: 0 },
        ]

  const effectiveTopDevices =
    topDevices.length > 0
      ? topDevices
      : [
          { name: 'GitHub Camo Proxy', key: 'GitHub Camo Proxy', count: 0, percentage: 0 },
          { name: 'Desktop', key: 'Desktop', count: 0, percentage: 0 },
          { name: 'Mobile', key: 'Mobile', count: 0, percentage: 0 },
        ]

  const effectiveTopBrowsers =
    topBrowsers.length > 0
      ? topBrowsers
      : [
          { name: 'GitHub Image Proxy', key: 'GitHub Image Proxy', count: 0, percentage: 0 },
          { name: 'Chrome', key: 'Chrome', count: 0, percentage: 0 },
          { name: 'Safari', key: 'Safari', count: 0, percentage: 0 },
          { name: 'Firefox', key: 'Firefox', count: 0, percentage: 0 },
        ]

  const effectiveTopOs =
    topOs.length > 0
      ? topOs
      : [
          { name: 'GitHub Cloud (Proxy)', key: 'GitHub Cloud (Proxy)', count: 0, percentage: 0 },
          { name: 'macOS', key: 'macOS', count: 0, percentage: 0 },
          { name: 'Windows', key: 'Windows', count: 0, percentage: 0 },
          { name: 'Linux', key: 'Linux', count: 0, percentage: 0 },
        ]

  return {
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
    topCountries: effectiveTopCountries,
    topContinents,
    topLanguages,
    topTimezones,
    topSources: effectiveTopSources,
    topDevices: effectiveTopDevices,
    topBrowsers: effectiveTopBrowsers,
    topOs: effectiveTopOs,
    trafficTypes,
    themes: [],
    statusCodes,
    topProfiles,
    recentActivity,
    range: timeRange,
    compareEnabled,
    updatedAt: new Date().toISOString(),
  }
}

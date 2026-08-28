export type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all'

export type DimensionType =
  | 'countries'
  | 'continents'
  | 'regions'
  | 'languages'
  | 'timezones'
  | 'sources'
  | 'devices'
  | 'browsers'
  | 'os'
  | 'traffic_types'
  | 'themes'
  | 'status_codes'

export interface DailyDataPoint {
  date: string
  views: number
  uniques: number
  cacheHits: number
  camoViews: number
  directViews: number
  status200: number
  status304: number
  statusError: number
  avgLatencyMs: number
  previousPeriodViews?: number
  previousPeriodUniques?: number
}

export interface HourlyDataPoint {
  hour: number
  views: number
  camoViews: number
  directViews: number
}

export interface WeekdayHourPoint {
  day: number
  dayName: string
  hour: number
  views: number
  intensity: number
}

export interface DimensionMetric {
  name: string
  key: string
  count: number
  percentage: number
  subKey?: string
  extra?: Record<string, any>
}

export interface CountryMetric extends DimensionMetric {
  code: string
  continent: string
  continentCode: string
  flagEmoji: string
  uniques?: number
}

export interface ContinentMetric extends DimensionMetric {
  code: string
}

export interface TelemetryStreamEvent {
  id: string
  timestamp: string
  relativeTime: string
  profileSlug: string
  country: string
  countryName: string
  flagEmoji: string
  city?: string
  trafficType: 'camo' | 'direct' | 'app' | 'bot'
  device: string
  browser: string
  os: string
  status: number
  isCacheHit: boolean
  latencyMs: number
  theme: 'dark' | 'light'
}

export interface ProfilePerformanceMetric {
  slug: string
  name: string
  views: number
  uniques: number
  cacheHitRatio: number
  avgLatencyMs: number
  percentage: number
  lastViewAt?: string
  status: 'active' | 'draft' | 'archived'
}

export interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  viewsToday: number
  uniquesToday: number
  viewsPreviousPeriod: number
  uniquesPreviousPeriod: number
  growthRateViews: number
  growthRateUniques: number
  cacheHitRatio: number
  cacheHitsPreviousPeriod: number
  growthRateCacheHits: number
  avgDailyViews: number
  avgLatencyMs: number
  latencyPreviousPeriod: number
  growthRateLatency: number
  activeViewersLast30m: number
  camoRatio: number
  directRatio: number

  peakHour: { hour: number; views: number }
  peakDay: { day: string; views: number }

  timeSeries: DailyDataPoint[]
  hourlyDistribution: HourlyDataPoint[]
  heatmapGrid: WeekdayHourPoint[]

  topCountries: CountryMetric[]
  topContinents: ContinentMetric[]
  topLanguages: DimensionMetric[]
  topTimezones: DimensionMetric[]
  topSources: DimensionMetric[]
  topDevices: DimensionMetric[]
  topBrowsers: DimensionMetric[]
  topOs: DimensionMetric[]
  trafficTypes: DimensionMetric[]
  themes: DimensionMetric[]
  statusCodes: DimensionMetric[]

  topProfiles: ProfilePerformanceMetric[]
  recentActivity: TelemetryStreamEvent[]

  range: TimeRange
  compareEnabled: boolean
  updatedAt: string
}

export interface IngestViewPayload {
  username: string
  profileSlug: string
  theme: 'dark' | 'light'
  renderTimeMs: number
  isCamoProxy: boolean
  isCacheHit: boolean
  userAgent?: string | null
  referrer?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  timezone?: string | null
  continent?: string | null
  language?: string | null
  ip?: string | null
  statusCode?: number
  timestamp?: string
}

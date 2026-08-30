export const OVERVIEW_REFRESH_INTERVAL = 30_000

export const OVERVIEW_KPI_METRICS = [
  { key: 'totalRequests', label: 'Total Requests', changeKey: 'requestsGrowth' },
  { key: 'uniqueSources', label: 'Unique Sources', changeKey: 'sourcesGrowth' },
  { key: 'cacheHitRatio', label: 'Cache Validation (304)', changeKey: null },
  { key: 'avgLatencyMs', label: 'Avg Latency', changeKey: null },
  { key: 'widgetHealth', label: 'Widget Health', changeKey: null },
] as const

export const QUICK_INSIGHTS_CONFIG = {
  topTheme: { label: 'Top Theme', fallback: 'Default Dark' },
  peakHour: { label: 'Peak Hour (UTC)', fallback: '14:00 - 15:00' },
  topCountry: { label: 'Top Location', fallback: 'United States' },
  topReferrer: { label: 'Top Referrer', fallback: 'github.com' },
} as const

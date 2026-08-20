/**
 * Profile Readme telemetry & metrics ingestion layer.
 * Designed for high throughput and non-blocking asynchronous dispatch.
 */

export interface ProfileViewMetric {
  username: string
  profileSlug: string
  theme: 'dark' | 'light'
  renderTimeMs: number
  isCamoProxy: boolean
  isCacheHit: boolean
  userAgent?: string | null
  referrer?: string | null
  country?: string | null
  ip?: string | null
  timestamp: string
}

export function parseViewerMetadata(request: Request): {
  isCamoProxy: boolean
  userAgent: string | null
  referrer: string | null
  country: string | null
  ip: string | null
} {
  const headers = request.headers
  const userAgent = headers.get('user-agent') || ''
  const uaLower = userAgent.toLowerCase()
  const isCamoProxy =
    uaLower.includes('github-camo') ||
    /(?:^|[^a-z0-9.-])camo\.githubusercontent\.com(?:[^a-z0-9.-]|$)/i.test(uaLower)

  const referrer = headers.get('referer') || null
  const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || null
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || null

  return {
    isCamoProxy,
    userAgent: userAgent || null,
    referrer,
    country,
    ip,
  }
}

/**
 * Records a profile SVG view metric without blocking the response.
 * Pluggable backend (in-memory buffer, Redis, ClickHouse, Upstash, or PostgreSQL).
 */
export async function recordProfileView(_metric: ProfileViewMetric): Promise<void> {
  try {
    // In production, dispatch to Redis/Kafka/DB or background analytics worker.
    if (process.env.NODE_ENV === 'development') {
      // Quiet log in dev for debugging metrics
      // console.debug('[ProfileMetrics] View recorded:', metric.username, metric.profileSlug, `${metric.renderTimeMs}ms`)
    }
  } catch (error) {
    // Telemetry errors must NEVER break user SVG delivery
    console.warn('[ProfileMetrics] Failed to record profile view:', error)
  }
}

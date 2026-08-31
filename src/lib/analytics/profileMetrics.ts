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
  region?: string | null
  city?: string | null
  timezone?: string | null
  continent?: string | null
  language?: string | null
  ip?: string | null
  statusCode?: number
  timestamp: string
}

export function parseViewerMetadata(request: Request): {
  isCamoProxy: boolean
  userAgent: string | null
  referrer: string | null
  country: string | null
  region: string | null
  city: string | null
  timezone: string | null
  continent: string | null
  language: string | null
  ip: string | null
} {
  const headers = request.headers
  const userAgent = headers.get('user-agent') || ''
  const uaLower = userAgent.toLowerCase()
  const uaTokens = uaLower.split(/[\s();,]+/)
  const isCamoProxy =
    uaLower.includes('github-camo') ||
    uaLower.includes('camo-proxy') ||
    uaTokens.some((t) => t === 'camo.githubusercontent.com')

  const referrer = headers.get('referer') || null
  const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry') || null
  const region = headers.get('x-vercel-ip-country-region') || headers.get('cf-region') || null
  const city = headers.get('x-vercel-ip-city') || null
  const timezone = headers.get('x-vercel-ip-timezone') || headers.get('cf-timezone') || null
  const continent = headers.get('x-vercel-ip-continent') || headers.get('cf-ipcontinent') || null
  const language = headers.get('accept-language') || null
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || null

  return {
    isCamoProxy,
    userAgent: userAgent || null,
    referrer,
    country,
    region,
    city,
    timezone,
    continent,
    language,
    ip,
  }
}

export async function recordProfileView(metric: ProfileViewMetric): Promise<void> {
  try {
    const { ingestProfileView } = await import('@/features/pro/server/analyticsStore')
    await ingestProfileView(metric)
  } catch (error) {
    console.warn('[ProfileMetrics] Failed to record profile view:', error)
  }
}

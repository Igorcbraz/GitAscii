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

  return {
    isCamoProxy,
    userAgent: userAgent || null,
    referrer,
  }
}

export async function recordProfileView(metric: ProfileViewMetric): Promise<void> {
  try {
    const { isProUser } = await import('@/features/pro/server/entitlements')
    if (!(await isProUser(metric.username))) return

    const { ingestProfileView } = await import('@/features/pro/server/analyticsStore')
    await ingestProfileView(metric)
  } catch (error) {
    console.warn('[ProfileMetrics] Failed to record profile view:', error)
  }
}

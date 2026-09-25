import { NextResponse } from 'next/server'

import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
import { isBadgeStyle } from '@/lib/analytics/telemetryBadge'
import { isValidGitHubUsername } from '@/utils/githubUsername'

export const dynamic = 'force-dynamic'

const DEFAULT_RENDER_TIME_MS = 1
const CACHE_MAX_AGE = 0
const CACHE_S_MAXAGE = 300
const CACHE_STALE_WHILE_REVALIDATE = 600

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()

  if (!cleanUsername || !isValidGitHubUsername(cleanUsername)) {
    return new NextResponse('Invalid username', { status: 400 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const rawSlug = searchParams.get('slug') || searchParams.get('profile') || 'default'
    const profileSlug = rawSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default'

    const viewerMeta = parseViewerMetadata(request)
    const metricPayload = {
      username: cleanUsername,
      profileSlug,
      theme: 'dark' as const,
      renderTimeMs: DEFAULT_RENDER_TIME_MS,
      isCamoProxy: viewerMeta.isCamoProxy,
      isCacheHit: false,
      userAgent: viewerMeta.userAgent,
      referrer: viewerMeta.referrer,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    }
    recordProfileView(metricPayload).catch((error) => {
      console.error('Failed to record profile view metric:', error)
    })
  } catch (error) {
    console.error('Failed to process viewer metadata:', error)
  }

  const requestedStyle = new URL(request.url).searchParams.get('style')
  const style = isBadgeStyle(requestedStyle) ? requestedStyle : 'classic'
  const width = style === 'compact' ? 160 : 800
  const svg =
    style === 'transparent'
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1" aria-label="GitAscii analytics pixel"></svg>'
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="24" viewBox="0 0 ${width} 24" fill="none" role="img" aria-label="Made with GitAscii">
  ${style === 'outline' ? '<style>.badge-text{fill:#e5e5e5}.badge-brand{fill:#c5ff4a}@media(prefers-color-scheme:light){.badge-text{fill:#313131}.badge-brand{fill:#597321}}</style>' : ''}
  ${style === 'classic' || style === 'compact' ? `<rect width="${width}" height="24" rx="4" fill="#0a0a0c"/>` : ''}
  ${style === 'outline' ? `<rect x="0.5" y="0.5" width="${width - 1}" height="23" rx="4" stroke="#c5ff4a" stroke-opacity="0.65"/>` : ''}
  <text x="${width / 2}" y="16" text-anchor="middle" class="badge-text" fill="${style === 'outline' ? '#e5e5e5' : '#71717a'}" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="500" letter-spacing="0.05em">made with <tspan class="badge-brand" fill="#c5ff4a" font-weight="700">GitAscii</tspan></text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      'CDN-Cache-Control': `public, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

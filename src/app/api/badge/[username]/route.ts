import { NextResponse } from 'next/server'

import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
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

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="24" viewBox="0 0 800 24" fill="none" role="img" aria-label="Made with GitAscii">
  <defs>
    <style>
      .badge-bg { fill: #0a0a0c; }
      .badge-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 500; fill: #71717a; letter-spacing: 0.05em; }
      .badge-brand { fill: #c5ff4a; font-weight: 700; }
    </style>
  </defs>
  <rect width="800" height="24" rx="4" class="badge-bg"/>
  <text x="400" y="16" text-anchor="middle" class="badge-text">
    made with <tspan class="badge-brand">GitAscii</tspan>
  </text>
</svg>`.trim()

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      'CDN-Cache-Control': `public, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

import { NextResponse } from 'next/server'

import { parseViewerMetadata, recordProfileView } from '@/lib/analytics/profileMetrics'
import { isValidGitHubUsername } from '@/utils/githubUsername'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const cleanUsername = (username || '').toLowerCase().trim()

  if (!cleanUsername || !isValidGitHubUsername(cleanUsername)) {
    return new NextResponse('Invalid username', { status: 400 })
  }

  try {
    const viewerMeta = parseViewerMetadata(request)
    const metricPayload = {
      username: cleanUsername,
      profileSlug: 'default',
      theme: 'dark' as const,
      renderTimeMs: 1,
      isCamoProxy: viewerMeta.isCamoProxy,
      isCacheHit: false,
      userAgent: viewerMeta.userAgent,
      referrer: viewerMeta.referrer,
      country: viewerMeta.country,
      region: viewerMeta.region,
      city: viewerMeta.city,
      timezone: viewerMeta.timezone,
      continent: viewerMeta.continent,
      language: viewerMeta.language,
      ip: viewerMeta.ip,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    }
    recordProfileView(metricPayload).catch(() => {})
  } catch {}

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
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

import { NextResponse } from 'next/server'

import { getOverallHealth } from '@/features/pro/server/healthMonitoringStore'
import { isValidGitHubUsername } from '@/utils/githubUsername'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const cleanUsername = (username || '').replace(/[^a-zA-Z0-9_-]/g, '')

  if (!cleanUsername || !isValidGitHubUsername(cleanUsername)) {
    return new NextResponse('Invalid username', { status: 400 })
  }

  let statusText = 'Operational'
  let statusColor = '#10b981' // emerald-500
  let healthScore = 100

  try {
    const health = await getOverallHealth(cleanUsername)
    healthScore = health.overallHealthScore ?? 100
    if (health.status === 'warning') {
      statusText = 'Degraded'
      statusColor = '#f59e0b'
    } else if (health.status === 'failed') {
      statusText = 'Incident'
      statusColor = '#f43f5e'
    }
  } catch {}

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="28" viewBox="0 0 220 28" fill="none" role="img" aria-label="GitAscii Health: ${statusText} (${healthScore}%)">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f0f11"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="220" height="28" rx="6" fill="url(#bg)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <circle cx="14" cy="14" r="4" fill="${statusColor}">
    <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="26" y="18" fill="#a1a1aa" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" letter-spacing="0.5">GitAscii Health</text>
  <rect x="120" y="5" width="94" height="18" rx="4" fill="${statusColor}" fill-opacity="0.15" stroke="${statusColor}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="167" y="17.5" fill="${statusColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" text-anchor="middle">${statusText} ${healthScore}%</text>
</svg>`.trim()

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

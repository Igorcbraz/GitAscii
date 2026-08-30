import { NextResponse } from 'next/server'

import { getAnalyticsSummary } from '@/features/pro/server/analyticsStore'
import { getWidgetErrors } from '@/features/pro/server/errorTrackerStore'
import { getUserProfiles } from '@/features/pro/server/profileManagerStore'
import type { TimeRange } from '@/features/pro/types'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rangeParam = (searchParams.get('range') || '30d') as TimeRange
  const profileSlug = searchParams.get('profile') || 'default'

  try {
    const [analytics, profiles, errors] = await Promise.all([
      getAnalyticsSummary(session.username, profileSlug, rangeParam),
      getUserProfiles(session.username),
      getWidgetErrors(session.username),
    ])

    const report = {
      generatedAt: new Date().toISOString(),
      period: rangeParam,
      username: session.username,
      profile: profileSlug,
      metrics: {
        totalViews: analytics.totalViews,
        uniqueVisitors: analytics.uniqueVisitors,
        cacheHitRatio: `${analytics.cacheHitRatio}%`,
        camoRatio: `${analytics.camoRatio}%`,
        directRatio: `${analytics.directRatio}%`,
        avgDailyViews: analytics.avgDailyViews,
        growthRateViews: `${analytics.growthRateViews}%`,
        growthRateUniques: `${analytics.growthRateUniques}%`,
        avgLatencyMs: analytics.avgLatencyMs,
        activeViewersLast30m: analytics.activeViewersLast30m,
        peakDay: analytics.peakDay,
        peakHour: analytics.peakHour,
      },
      camoDelivery: [
        {
          name: 'GitHub Camo Proxy (README)',
          key: 'camo',
          count: Math.round((analytics.totalViews * analytics.camoRatio) / 100),
          percentage: analytics.camoRatio,
        },
        {
          name: 'Direct HTTP Embeds',
          key: 'direct',
          count: Math.round((analytics.totalViews * analytics.directRatio) / 100),
          percentage: analytics.directRatio,
        },
      ],
      statusCodes: analytics.statusCodes.slice(0, 5),
      topSources: analytics.topSources.slice(0, 5),
      topDevices: analytics.topDevices.slice(0, 5),
      topBrowsers: analytics.topBrowsers.slice(0, 5),
      topOs: analytics.topOs.slice(0, 5),
      profilesSummary: profiles.map((p) => ({
        slug: p.slug,
        name: p.name,
        views: p.totalViews,
        widgetsCount: p.widgetsCount,
        status: p.status,
      })),
      errorsSummary: {
        total: errors.length,
        active: errors.filter((e) => e.status !== 'resolved').length,
        resolved: errors.filter((e) => e.status === 'resolved').length,
      },
      hourlyDistribution: analytics.hourlyDistribution,
      timeSeries: analytics.timeSeries,
    }

    return NextResponse.json(report)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to generate report'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

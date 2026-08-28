import { NextResponse } from 'next/server'

import { getAnalyticsSummary } from '@/features/pro/server/analyticsStore'
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
  const profileSlug = searchParams.get('profile') || 'all'
  const compareParam = searchParams.get('compare') !== 'false'
  const exportFormat = searchParams.get('export')

  const validRanges: TimeRange[] = ['24h', '7d', '30d', '90d', 'all']
  const range = validRanges.includes(rangeParam) ? rangeParam : '30d'

  try {
    const summary = await getAnalyticsSummary(session.username, profileSlug, range, compareParam)

    if (exportFormat === 'csv') {
      const rows = [
        [
          'Date',
          'Views',
          'Uniques',
          'Cache Hits',
          'Camo Proxy Views',
          'Direct Views',
          'Status 200',
          'Status 304',
          'Avg Latency (ms)',
        ].join(','),
        ...summary.timeSeries.map((d) =>
          [
            d.date,
            d.views,
            d.uniques,
            d.cacheHits,
            d.camoViews,
            d.directViews,
            d.status200,
            d.status304,
            d.avgLatencyMs,
          ].join(',')
        ),
      ].join('\n')

      return new NextResponse(rows, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="gitascii-analytics-${session.username}-${range}.csv"`,
        },
      })
    }

    return NextResponse.json(summary)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch analytics'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

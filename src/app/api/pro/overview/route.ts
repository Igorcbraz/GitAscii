import { NextResponse } from 'next/server'

import { getAnalyticsSummary } from '@/features/pro/server/analyticsStore'
import { getProEmailLogs } from '@/features/pro/server/emailLogStore'
import { getWidgetErrors } from '@/features/pro/server/errorTrackerStore'
import { getUserProfiles } from '@/features/pro/server/profileManagerStore'
import type { ActivityEvent, ProOverviewData } from '@/features/pro/types'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const username = session.username

  try {
    const [analytics, profiles, errors, emails] = await Promise.all([
      getAnalyticsSummary(username, 'default', '30d'),
      getUserProfiles(username),
      getWidgetErrors(username),
      getProEmailLogs(username),
    ])

    const activeErrors = errors.filter((e) => e.status !== 'resolved')

    const activity: ActivityEvent[] = []

    for (const err of errors.slice(0, 3)) {
      activity.push({
        id: `act_${err.id}`,
        type: err.status === 'resolved' ? 'error_resolved' : 'error_detected',
        title:
          err.status === 'resolved'
            ? `Resolved error in ${err.widgetName}`
            : `Error detected in ${err.widgetName}`,
        description: err.message,
        timestamp: err.lastSeenAt,
      })
    }

    for (const eml of emails.slice(0, 3)) {
      activity.push({
        id: `act_${eml.id}`,
        type: 'email_sent',
        title: `Notification sent: ${eml.templateName}`,
        description: eml.subject,
        timestamp: eml.sentAt,
      })
    }

    for (const prof of profiles.slice(0, 2)) {
      activity.push({
        id: `act_prof_${prof.slug}`,
        type: 'profile_updated',
        title: `Profile "${prof.name}" active`,
        description: `Tracking stats for ${prof.slug}`,
        timestamp: prof.lastUpdated,
      })
    }

    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const overviewData: ProOverviewData = {
      totalViews: analytics.totalViews,
      uniqueVisitors: analytics.uniqueVisitors,
      activeProfilesCount: profiles.length,
      activeErrorsCount: activeErrors.length,
      emailsSentCount: emails.length,
      viewsTrendPercent: analytics.growthRateViews,
      uniquesTrendPercent: analytics.growthRateUniques,
      recentViewsChart: analytics.timeSeries,
      topProfiles: profiles.slice(0, 5),
      recentErrors: errors.slice(0, 5),
      recentEmails: emails.slice(0, 5),
      recentActivity: activity.slice(0, 8),
      cacheHitRatio: analytics.cacheHitRatio,
      avgLatencyMs: analytics.avgLatencyMs,
      activeViewersLast30m: analytics.activeViewersLast30m,
      avgDailyViews: analytics.avgDailyViews,
      peakDay: analytics.peakDay,
      peakHour: analytics.peakHour,
      topCountry: analytics.topCountries?.[0]
        ? {
            code: analytics.topCountries[0].code,
            name: analytics.topCountries[0].name,
            views: analytics.topCountries[0].count,
          }
        : undefined,
      topSource: analytics.topSources?.[0]?.name,
    }

    return NextResponse.json(overviewData)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch overview data'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

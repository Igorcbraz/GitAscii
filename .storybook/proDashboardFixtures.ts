import { analyticsFixture } from '../src/features/pro/components/analytics/analyticsFixture'
import type {
  ProEmailLogRecord,
  ProOverviewData,
  ProProfileRecord,
  WidgetErrorRecord,
} from '../src/features/pro/types'
import type { OverallHealthMetrics } from '../src/features/pro/types/health'
import { mockStoryFetch } from './mockFetch'

const now = '2026-09-29T12:00:00.000Z'

const profile = {
  id: 'profile-1',
  slug: 'default',
  name: 'Main profile',
  status: 'active',
  isDefault: true,
  widgetsCount: 5,
  totalViews: 42850,
  versionCount: 4,
  healthStatus: 'operational',
  lastUpdated: now,
  createdAt: now,
  publicUrl: 'https://gitascii.com/octocat',
  rawSvgUrl: 'https://gitascii.com/api/octocat',
} satisfies ProProfileRecord

const errorRecord = {
  id: 'error-1',
  widgetId: 'stats',
  widgetName: 'GitHub Stats',
  profileSlug: 'default',
  errorType: 'RATE_LIMITED',
  message: 'GitHub temporarily limited requests.',
  status: 'active',
  occurrences: 3,
  firstSeenAt: now,
  lastSeenAt: now,
} satisfies WidgetErrorRecord

const emailRecord = {
  id: 'email-1',
  recipientEmail: 'octocat@example.com',
  templateName: 'DailyDigestEmail',
  subject: 'Your daily GitAscii summary',
  reason: 'Daily profile telemetry',
  relatedProfile: 'default',
  sentAt: now,
  status: 'delivered',
} satisfies ProEmailLogRecord

const day = {
  date: '2026-09-29',
  views: 1284,
  uniques: 463,
  cacheHits: 802,
  camoViews: 487,
  directViews: 797,
  status200: 797,
  status304: 802,
  statusError: 0,
  avgLatencyMs: 24,
}

const overview = {
  totalViews: 42850,
  uniqueVisitors: 12400,
  activeProfilesCount: 1,
  activeErrorsCount: 1,
  emailsSentCount: 1,
  viewsTrendPercent: 12.8,
  uniquesTrendPercent: 10.7,
  recentViewsChart: [day],
  topProfiles: [profile],
  recentErrors: [errorRecord],
  recentEmails: [emailRecord],
  recentActivity: [
    {
      id: 'activity-1',
      type: 'view_spike',
      title: 'Profile traffic increased',
      description: 'More views than the previous period.',
      timestamp: now,
    },
  ],
  cacheHitRatio: 68,
  avgLatencyMs: 24,
  activeViewersLast30m: 8,
} satisfies ProOverviewData

const health = {
  status: 'warning',
  overallHealthScore: 96,
  totalRenders24h: 1284,
  errorsLast24h: 3,
  activeIncidentsCount: 1,
  operationalProfilesCount: 1,
  warningProfilesCount: 0,
  failedProfilesCount: 0,
  avgRenderTimeMs: 24,
  lastRenderAt: now,
  profiles: [],
  widgets: [],
  healthHistory: [],
  emailAlertsConfig: { enabled: true, recipientEmail: 'octocat@example.com' },
} satisfies OverallHealthMetrics

const report = {
  generatedAt: now,
  period: '30d',
  username: 'octocat',
  profile: 'all',
  metrics: {
    totalViews: 42850,
    uniqueVisitors: 12400,
    cacheHitRatio: '68%',
    camoRatio: '38%',
    directRatio: '62%',
    avgDailyViews: 1428,
    growthRateViews: '12.8%',
    growthRateUniques: '10.7%',
    avgLatencyMs: 24,
  },
  topSources: [{ name: 'GitHub', key: 'github', count: 25800, percentage: 60 }],
  topCountries: [{ name: 'United States', key: 'US', code: 'US', count: 1850, percentage: 42 }],
  profilesSummary: [
    { slug: 'default', name: 'Main profile', views: 42850, widgetsCount: 5, status: 'active' },
  ],
  errorsSummary: { total: 1, active: 1, resolved: 0 },
  timeSeries: [day],
}

export type DashboardFixtureState = 'populated' | 'empty' | 'error'

export function mockProDashboardApi(state: DashboardFixtureState = 'populated') {
  const empty = state === 'empty'
  return mockStoryFetch((url) => {
    const pathname = new URL(url, window.location.origin).pathname
    if (pathname === '/api/auth/session')
      return { body: { session: { username: 'octocat', isPro: true, tier: 'pro' } } }
    if (pathname === '/api/pro/social-proof')
      return { body: { count: 124, usernames: ['octocat'] } }
    if (pathname.startsWith('/api/pro/') && state === 'error')
      return { body: { error: 'Service unavailable' }, status: 503 }
    if (pathname === '/api/pro/overview')
      return {
        body: empty
          ? {
              ...overview,
              totalViews: 0,
              uniqueVisitors: 0,
              activeProfilesCount: 0,
              activeErrorsCount: 0,
              emailsSentCount: 0,
              recentViewsChart: [],
              topProfiles: [],
              recentErrors: [],
              recentEmails: [],
              recentActivity: [],
            }
          : overview,
      }
    if (pathname === '/api/pro/analytics/badge')
      return { body: { installed: !empty, canWrite: true, style: 'classic' } }
    if (pathname === '/api/pro/analytics')
      return {
        body: empty
          ? {
              ...analyticsFixture,
              totalViews: 0,
              uniqueVisitors: 0,
              viewsToday: 0,
              topCountries: [],
              topProfiles: [],
            }
          : analyticsFixture,
      }
    if (pathname === '/api/pro/profiles') return { body: { profiles: empty ? [] : [profile] } }
    if (pathname === '/api/pro/publish-settings')
      return { body: { tier: 'pro', intervalMinutes: 1440 } }
    if (pathname === '/api/pro/health')
      return {
        body: empty
          ? {
              ...health,
              status: 'operational',
              overallHealthScore: 100,
              totalRenders24h: 0,
              errorsLast24h: 0,
              activeIncidentsCount: 0,
            }
          : health,
      }
    if (pathname === '/api/pro/errors') return { body: { errors: empty ? [] : [errorRecord] } }
    if (pathname === '/api/pro/emails')
      return {
        body: {
          emails: empty ? [] : [emailRecord],
          canSendTest: true,
          recipientEmail: 'octocat@example.com',
          isFallback: false,
        },
      }
    if (pathname === '/api/pro/reports')
      return {
        body: empty
          ? {
              ...report,
              metrics: { ...report.metrics, totalViews: 0, uniqueVisitors: 0, avgDailyViews: 0 },
              topSources: [],
              topCountries: [],
              profilesSummary: [],
              timeSeries: [],
            }
          : report,
      }
    if (pathname.startsWith('/api/config/'))
      return {
        body: {
          version: 2,
          githubId: 1,
          username: 'octocat',
          profileSlug: 'default',
          profileName: 'Main profile',
          templateId: 'terminal',
          widgets: [],
          globalStyles: {},
          metadata: { createdAt: now, updatedAt: now, schemaVersion: 2 },
        },
      }
    return undefined
  })
}

import type { DailyDataPoint } from './analytics'
import type { ProEmailLogRecord } from './emails'
import type { WidgetErrorRecord } from './errors'
import type { ProProfileRecord } from './profiles'

export interface ActivityEvent {
  id: string
  type:
    | 'view_spike'
    | 'error_detected'
    | 'error_resolved'
    | 'email_sent'
    | 'profile_created'
    | 'profile_updated'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ProOverviewData {
  totalViews: number
  uniqueVisitors: number
  activeProfilesCount: number
  activeErrorsCount: number
  emailsSentCount: number
  viewsTrendPercent: number
  uniquesTrendPercent: number
  recentViewsChart: DailyDataPoint[]
  topProfiles: ProProfileRecord[]
  recentErrors: WidgetErrorRecord[]
  recentEmails: ProEmailLogRecord[]
  recentActivity: ActivityEvent[]
  cacheHitRatio?: number
  avgLatencyMs?: number
  activeViewersLast30m?: number
  avgDailyViews?: number
  peakDay?: { day: string; views: number }
  peakHour?: { hour: number; views: number }
  topCountry?: { code: string; name: string; views: number }
  topSource?: string
}

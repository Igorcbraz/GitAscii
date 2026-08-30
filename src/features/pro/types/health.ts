export type HealthStatus = 'operational' | 'warning' | 'failed'

export interface WidgetHealthRecord {
  widgetId: string
  widgetName: string
  profileSlug: string
  status: HealthStatus
  lastRenderAt: string
  lastRenderDurationMs: number
  avgRenderDurationMs: number
  totalRenders: number
  totalErrors: number
  errorsLast24h: number
  successRate: number // percentage (0 - 100)
  lastError?: {
    errorType: string
    message: string
    timestamp: string
    details?: string
  }
}

export interface ProfileHealthSummary {
  profileSlug: string
  profileName: string
  isDefault: boolean
  status: HealthStatus
  healthScore: number // percentage (0 - 100)
  totalRenders: number
  successfulRenders: number
  failedRenders: number
  errorsLast24h: number
  avgRenderDurationMs: number
  lastRenderAt?: string
  widgetsCount: number
  operationalWidgetsCount: number
  warningWidgetsCount: number
  failedWidgetsCount: number
}

export interface HealthHistoryPoint {
  timestamp: string
  date: string
  healthScore: number
  totalRenders: number
  failedRenders: number
  avgDurationMs: number
  status: HealthStatus
}

export interface OverallHealthMetrics {
  status: HealthStatus
  overallHealthScore: number // percentage (0 - 100)
  totalRenders24h: number
  errorsLast24h: number
  activeIncidentsCount: number
  operationalProfilesCount: number
  warningProfilesCount: number
  failedProfilesCount: number
  avgRenderTimeMs: number
  lastRenderAt?: string
  profiles: ProfileHealthSummary[]
  widgets: WidgetHealthRecord[]
  healthHistory: HealthHistoryPoint[]
  emailAlertsConfig?: {
    enabled: boolean
    recipientEmail?: string
    lastNotifiedAt?: string | null
  }
}

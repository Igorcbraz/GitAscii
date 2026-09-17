export const WIDGET_ERROR_STATUS = {
  ACTIVE: 'active',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
} as const

export const WIDGET_ERROR_TYPE = {
  FETCH_TIMEOUT: 'FETCH_TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  PARSING_ERROR: 'PARSING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN: 'UNKNOWN',
} as const

export type WidgetErrorStatus = (typeof WIDGET_ERROR_STATUS)[keyof typeof WIDGET_ERROR_STATUS]

export interface WidgetErrorRecord {
  id: string
  widgetId: string
  widgetName: string
  profileSlug: string
  errorType: (typeof WIDGET_ERROR_TYPE)[keyof typeof WIDGET_ERROR_TYPE]
  message: string
  details?: string
  status: WidgetErrorStatus
  occurrences: number
  firstSeenAt: string
  lastSeenAt: string
  resolvedAt?: string | null
  lastNotifiedAt?: string | null
}

export interface IngestErrorPayload {
  username: string
  profileSlug: string
  widgetId: string
  widgetName?: string
  errorType: WidgetErrorRecord['errorType']
  message: string
  details?: string
}

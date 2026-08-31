export type WidgetErrorStatus = 'active' | 'investigating' | 'resolved'

export interface WidgetErrorRecord {
  id: string
  widgetId: string
  widgetName: string
  profileSlug: string
  errorType:
    | 'FETCH_TIMEOUT'
    | 'RATE_LIMITED'
    | 'PARSING_ERROR'
    | 'NETWORK_ERROR'
    | 'UNAUTHORIZED'
    | 'UNKNOWN'
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

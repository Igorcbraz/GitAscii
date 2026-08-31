export type ProfileStatus = 'active' | 'draft' | 'archived'

export interface ProProfileRecord {
  id: string
  slug: string
  name: string
  description?: string
  status: ProfileStatus
  isDefault: boolean
  widgetsCount: number
  totalViews: number
  versionCount?: number
  healthStatus?: 'operational' | 'warning' | 'failed'
  renderSuccessRate?: number
  lastRenderDurationMs?: number
  lastRenderedAt?: string
  lastUpdated: string
  createdAt: string
  publicUrl: string
  rawSvgUrl: string
}

export interface ProfileVersionRecord {
  id: string
  profileSlug: string
  versionNumber: number
  label?: string
  description?: string
  config: any
  widgetsCount: number
  createdAt: string
  createdBy?: string
}

export type DynamicRuleConditionType =
  'time_of_day' | 'day_of_week' | 'visitor_theme' | 'geo_country' | 'device_type' | 'referrer'

export type DynamicRuleType =
  'work_hours' | 'weekend' | 'date_range' | 'event' | 'temporary' | 'custom'

export interface DynamicRuleRecord {
  id: string
  name: string
  targetProfileSlug: string
  priority: number // Higher number = evaluated first (e.g. 100, 50, 10)
  enabled: boolean
  type: DynamicRuleType
  daysOfWeek?: number[] // 0 (Sun) to 6 (Sat)
  startTime?: string // 'HH:mm' e.g. '09:00'
  endTime?: string // 'HH:mm' e.g. '18:00'
  timezone?: string // e.g. 'America/Sao_Paulo', 'UTC', 'auto'
  startDate?: string // ISO string or YYYY-MM-DD
  endDate?: string // ISO string or YYYY-MM-DD
  eventName?: string // e.g. 'Holiday', 'Vacation', 'Conference'
  expiresAt?: string // ISO string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface DynamicRulesConfig {
  enabled: boolean
  fallbackProfileSlug: string
  defaultTimezone: string
  rules: DynamicRuleRecord[]
}

export interface DynamicEvaluatedRuleStep {
  ruleId: string
  ruleName: string
  priority: number
  targetProfileSlug: string
  matched: boolean
  reason: string
}

export interface DynamicEvaluationResult {
  selectedProfileSlug: string
  matchedRule: DynamicRuleRecord | null
  isFallback: boolean
  evaluationReason: string
  evaluationTimestamp: string
  simulatedTimezone: string
  evaluatedRules: DynamicEvaluatedRuleStep[]
}

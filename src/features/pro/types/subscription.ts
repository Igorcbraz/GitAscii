export type ProPlanTier = 'free' | 'pro' | 'team' | 'enterprise'

export interface ProEntitlements {
  tier: ProPlanTier
  maxProfiles: number
  analyticsRetentionDays: number
  widgetErrorAlertsEnabled: boolean
  customDomainEnabled: boolean
  instantSvgPurgeEnabled: boolean
  prioritySupport: boolean
  monthlyEmailQuota: number
}

export interface ProUserSettings {
  emailAlertsEnabled: boolean
  alertEmailAddress?: string
  dailyDigestEnabled: boolean
  themePreference: 'system' | 'dark' | 'light'
  anonymizeReferrers: boolean
  planTier?: ProPlanTier
}

export const PRO_PLAN_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
  ENTERPRISE: 'enterprise',
} as const

export type ProPlanTier = (typeof PRO_PLAN_TIERS)[keyof typeof PRO_PLAN_TIERS]

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

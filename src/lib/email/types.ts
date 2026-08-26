import type { AppLocale } from '@/i18n/locales'

export type EmailEventType =
  | 'welcome'
  | 'first_export'
  | 'reengagement'
  | 'app_disconnected'
  | 'star_thank_you'
  | 'request_star'

export interface BaseEmailRecipient {
  email: string
  username: string
  name?: string
  locale?: AppLocale
}

export interface WelcomeEmailPayload extends BaseEmailRecipient {
  editorUrl?: string
}

export interface FirstExportEmailPayload extends BaseEmailRecipient {
  profileSlug?: string
  widgetCount?: number
  previewUrl?: string
  githubProfileUrl?: string
  editorUrl?: string
}

export interface ReengagementEmailPayload extends BaseEmailRecipient {
  inactiveDays?: number
  editorUrl?: string
  exploreUrl?: string
}

export interface AppDisconnectedEmailPayload extends BaseEmailRecipient {
  installUrl?: string
  repoName?: string
}

export interface StarThankYouEmailPayload extends BaseEmailRecipient {
  repoUrl?: string
  badgeSnippet?: string
}

export interface RequestStarEmailPayload extends BaseEmailRecipient {
  repoUrl?: string
  activeDays?: number
  editorUrl?: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  reason?: string
}

export interface UnsubscribeTokenPayload {
  email: string
  username: string
  issuedAt: number
}

export interface EmailPreferences {
  email: string
  username: string
  marketingOptOut: boolean
  productUpdatesOptOut: boolean
  updatedAt: number
}

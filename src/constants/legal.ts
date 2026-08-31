export const LEGAL_LAST_UPDATED = '2026-08-30'

export const PRIVACY_DATA_PRACTICES: string[] = [
  'We do not store passwords — authentication is performed securely via GitHub OAuth.',
  'GitHub login is used to identify your account, authorise README commits on your behalf, and manage Pro entitlements.',
  'Payment transactions are processed securely by Stripe Inc. We never receive or store your credit card numbers.',
  'Your email address is used solely for transactional receipts, Pro entitlement delivery, and opt-in alerts.',
  'We do not sell, rent, or trade any personal data to third parties.',
]

export interface CookieInventoryItem {
  name: string
  provider: string
  purpose: string
  consentRequired: string
}

export const COOKIE_INVENTORY: CookieInventoryItem[] = [
  {
    name: 'gitascii_analytics_consent',
    provider: 'GitAscii',
    purpose: 'Stores your accept/decline choice',
    consentRequired: 'No (essential)',
  },
  {
    name: 'gitascii_visited',
    provider: 'GitAscii',
    purpose: 'First-visit flag for session tracking',
    consentRequired: 'Yes (analytics)',
  },
  {
    name: '_ga, _ga_*',
    provider: 'Google Analytics',
    purpose: 'User/session identification',
    consentRequired: 'Yes (analytics)',
  },
  {
    name: '_clck, _clsk, MUID',
    provider: 'Microsoft Clarity',
    purpose: 'Session replay identification',
    consentRequired: 'Yes (analytics)',
  },
  {
    name: 'sentry-*',
    provider: 'Sentry',
    purpose: 'Error-session correlation',
    consentRequired: 'No (technical)',
  },
]

export const TERMS_ACCEPTABLE_USE_RULES: string[] = [
  'Generate content that is illegal, defamatory, harassing, or violates the rights of others.',
  'Attempt to reverse-engineer, scrape, or overload our API endpoints or third-party services we depend on.',
  'Circumvent any rate limits or access controls.',
  'Impersonate another person or entity, including other GitHub users.',
  'Introduce malware, viruses, or harmful code through any input field.',
  'Use the Service for automated bulk generation that disrupts availability for other users.',
]

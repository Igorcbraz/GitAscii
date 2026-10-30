export const ASSISTANT_ACTION = {
  WIDGETS: 'widgets',
  TEMPLATES: 'templates',
  PROPERTIES: 'properties',
  STYLES: 'styles',
  PREVIEW: 'preview',
  EXPORT: 'export',
  TOUR: 'tour',
  UNDO: 'undo',
  PRICING: 'pricing',
  COMPARE: 'compare',
  FAQ: 'faq',
  PROFILES: 'profiles',
  ANALYTICS: 'analytics',
  HEALTH: 'health',
} as const

export const ASSISTANT_TIP = {
  BIO: 'bio',
  REPOSITORIES: 'repositories',
  TECH: 'tech',
  SOCIAL: 'social',
  ASCII: 'ascii',
  LIBRARY: 'library',
  WELCOME: 'welcome',
  EMPTY: 'empty',
  ADDED: 'added',
  SELECTED: 'selected',
  MULTI: 'multi',
  LOCKED: 'locked',
  STYLES: 'styles',
  TEMPLATES: 'templates',
  TEMPLATE_APPLIED: 'templateApplied',
  REMOVED: 'removed',
  PREVIEW: 'preview',
  PREVIEWING: 'previewing',
  CROWDED: 'crowded',
  EXPORT: 'export',
  PUBLISHED: 'published',
  PUBLISH_ERROR: 'publishError',
  COPIED: 'copied',
  UNDO: 'undo',
  PRO_WELCOME: 'proWelcome',
  PRO_ANALYTICS: 'proAnalytics',
  PRO_PROFILES: 'proProfiles',
  PRO_HEALTH: 'proHealth',
  PRO_PRICE: 'proPrice',
  PRO_FAQ: 'proFaq',
  MEMBER: 'member',
  ANALYTICS: 'analytics',
  PROFILES: 'profiles',
  HEALTH: 'health',
} as const

export const ASSISTANT_CONFIG = {
  tipDelayMs: 1600,
  outcomeDelayMs: 500,
  tipDurationMs: 14_000,
  cooldownMs: 45_000,
  sessionTipLimit: 5,
  crowdedWidgetCount: 10,
  proVisibilityThreshold: 0.5,
  anchorSize: 64,
  seenStoragePrefix: 'strobi-seen-',
} as const

export const ASSISTANT_SELECTORS = {
  blocking: '[data-strobi-blocking], [role="dialog"]',
  editorContext: '[data-strobi-context]',
  proContext: '[data-strobi-pro]',
  editable: 'input, textarea, select, [contenteditable="true"]',
  properties: '#tour-properties-sidebar',
  propertyControl: 'input, select, button, textarea',
  actorId: 'strobi-persistent-actor',
} as const

export const EDITOR_VIEW = { GITASCII: 'gitascii', GITHUB: 'github' } as const

export const PRO_ASSISTANT_ROUTES = {
  analytics: '/pro/analytics',
  reports: '/pro/reports',
  profiles: '/pro/profiles',
  health: '/pro/health',
  errors: '/pro/errors',
} as const

export const ASSISTANT_LANGUAGE = { ENGLISH: 'en', PORTUGUESE: 'pt' } as const

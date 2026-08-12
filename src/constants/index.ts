export const APP_URL = 'https://git-ascii.vercel.app'
export const APP_DOMAIN = 'git-ascii.vercel.app'

export const WIDGET_IDS = {
  HEADER: 'header',
  ASCII_TEXT: 'ascii-text',
  ASCII_ART: 'ascii-art',
  TERMINAL_INFO: 'terminal-info',
  AVATAR: 'avatar',
  TECH_STACK: 'tech-stack',
  BIO: 'bio',
  CUSTOM_IMAGE: 'custom-image',
  STATS: 'stats',
  LANGUAGES: 'languages',
  REPOSITORIES: 'repositories',
  SOCIAL_MEDIA: 'social-media',
  GITHUB_README_STATS: 'github-readme-stats',
  STREAK_STATS: 'streak-stats',
  PROFILE_TROPHY: 'profile-trophy',
  ACTIVITY_GRAPH: 'activity-graph',
  CONTRIBUTION_SNAKE: 'contribution-snake',
  METRICS_CARD: 'metrics-card',
  VIEWS_COUNTER: 'views-counter',
  README_QUOTES: 'readme-quotes',
  AWESOME_BADGE: 'awesome-badge',
  GITFEST_LINEUP: 'gitfest-lineup',
  GHSTATS: 'ghstats',
  DIVIDER: 'divider',
  FOOTER: 'footer',
  GODPROFILE_TERMINAL: 'godprofile-terminal',
  GODPROFILE_MARQUEE: 'godprofile-marquee',
  GODPROFILE_NEURAL: 'godprofile-neural',
  GODPROFILE_TROPHIES: 'godprofile-trophies',
  GODPROFILE_WAKATIME: 'godprofile-wakatime',
  GODPROFILE_GLOBE: 'godprofile-globe',
  ASCII_PORTRAIT: 'asciiprofile-portrait',
  ASCII_INFO: 'asciiprofile-info',
  ASCII_HEATMAP: 'asciiprofile-heatmap',
} as const

export type WidgetId = (typeof WIDGET_IDS)[keyof typeof WIDGET_IDS]

export const WIDGET_CATEGORIES = {
  ESSENTIAL: 'essential',
  INTERACTIVE: 'interactive',
  STATS: 'stats',
  EXTERNAL: 'external',
  MISC: 'misc',
  GODPROFILE: 'godprofile',
  ASCIIPROFILE: 'asciiprofile',
} as const

export type WidgetCategory = (typeof WIDGET_CATEGORIES)[keyof typeof WIDGET_CATEGORIES]

import packageJson from '../../package.json'

export const APP_URL = 'https://gitascii.com'
export const APP_DOMAIN = 'gitascii.com'
export const APP_VERSION = packageJson.version

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
  CONTROLPLANE_SYSTEM_LOOP: 'controlplane-system-loop',
  CONTROLPLANE_COMMAND_DECK: 'controlplane-command-deck',
  CONTROLPLANE_SIGNAL_GRID: 'controlplane-signal-grid',
  CONTROLPLANE_METRO: 'controlplane-metro',
  CONTROLPLANE_BENTO: 'controlplane-bento',
  CONTROLPLANE_EDITORIAL: 'controlplane-editorial',
  CONTROLPLANE_BLUEPRINT: 'controlplane-blueprint',
  CONTROLPLANE_CONSTELLATION: 'controlplane-constellation',
  CONTROLPLANE_MONOLITH: 'controlplane-monolith',
  CONTROLPLANE_INTERLACE: 'controlplane-interlace',
  CONTROLPLANE_CIPHER: 'controlplane-cipher',
  CONTROLPLANE_SPECIMEN: 'controlplane-specimen',
  CONTROLPLANE_PATCHBAY: 'controlplane-patchbay',
  CONTROLPLANE_CARTOGRAPH: 'controlplane-cartograph',
  CONTROLPLANE_FOUNDRY: 'controlplane-foundry',
  CODEWEB_HERO_ORBIT: 'codeweb-hero-orbit',
  CODEWEB_RETRO_GRID: 'codeweb-retro-grid',
  CODEWEB_SHOWCASE_CARDS: 'codeweb-showcase-cards',
  CODEWEB_SOCIAL_BADGE: 'codeweb-social-badge',
  CODEWEB_MINIMAL_BADGE: 'codeweb-minimal-badge',
  POKEMON_CARD: 'pokemon-card',
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
  CONTROLPLANE: 'controlplane',
  CODEWEB_DEV: 'codeweb-dev',
} as const

export type WidgetCategory = (typeof WIDGET_CATEGORIES)[keyof typeof WIDGET_CATEGORIES]

export * from './comparisons'
export * from './editor'
export * from './explore'
export * from './landing'
export * from './languages'
export * from './legal'
export * from './links'
export * from './widgets'

import { APP_URL, EXTERNAL_LINKS } from './links'
import { WIDGET_IDS } from './widgetIds'

export const RECOMMENDED_PROFILE_WIDGETS: string[] = [
  WIDGET_IDS.HEADER,
  WIDGET_IDS.ASCII_ART,
  WIDGET_IDS.BIO,
  WIDGET_IDS.STATS,
  WIDGET_IDS.LANGUAGES,
  WIDGET_IDS.REPOSITORIES,
  WIDGET_IDS.FOOTER,
]

export const DEFAULT_POKEMON_CARD_IMAGE = 'https://assets.tcgdex.net/en/base/base1/4/high.webp'
export const DEFAULT_GITFUT_BASE_URL = 'https://gitfut.com'
export const DEFAULT_GITFUT_FALLBACK_IMAGE = 'https://gitfut.com/user.png'

export interface CountryFlagDef {
  readonly code: string
  readonly name: string
}

export const ALL_COUNTRY_FLAGS: readonly CountryFlagDef[] = [
  { code: '', name: 'Auto (GitHub)' },
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'US', name: 'USA' },
  { code: 'CA', name: 'Canadá' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'CL', name: 'Chile' },
  { code: 'UY', name: 'Uruguai' },
  { code: 'PE', name: 'Peru' },
  { code: 'PY', name: 'Paraguai' },
  { code: 'EC', name: 'Equador' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'BO', name: 'Bolívia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
  { code: 'FR', name: 'França' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'IT', name: 'Itália' },
  { code: 'NL', name: 'Holanda' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'HR', name: 'Croácia' },
  { code: 'SE', name: 'Suécia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'PL', name: 'Polônia' },
  { code: 'UA', name: 'Ucrânia' },
  { code: 'CH', name: 'Suíça' },
  { code: 'AT', name: 'Áustria' },
  { code: 'TR', name: 'Turquia' },
  { code: 'GR', name: 'Grécia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'DZ', name: 'Argélia' },
  { code: 'MA', name: 'Marrocos' },
  { code: 'SN', name: 'Senegal' },
  { code: 'NG', name: 'Nigéria' },
  { code: 'GH', name: 'Gana' },
  { code: 'EG', name: 'Egito' },
  { code: 'ZA', name: 'África do Sul' },
  { code: 'CM', name: 'Camarões' },
  { code: 'CI', name: 'Costa do Marfim' },
  { code: 'JP', name: 'Japão' },
  { code: 'KR', name: 'Coreia do Sul' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'Índia' },
  { code: 'SA', name: 'Arábia Saudita' },
  { code: 'AU', name: 'Austrália' },
] as const

export const TRUSTED_CDN_HOSTNAMES: readonly string[] = [
  'gitfut.com',
  'assets.tcgdex.net',
  'images.pokemontcg.io',
  'avatars.githubusercontent.com',
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net',
] as const

export function isTrustedCdnHostname(hostname: string): boolean {
  return TRUSTED_CDN_HOSTNAMES.includes(hostname)
}

export const WIDGET_ALIASES: Readonly<Record<string, readonly string[]>> = {
  streak: [WIDGET_IDS.STREAK_STATS, WIDGET_IDS.ASCII_HEATMAP, WIDGET_IDS.GODPROFILE_TROPHIES],
  languages: [WIDGET_IDS.LANGUAGES, WIDGET_IDS.TECH_STACK],
  stack: [WIDGET_IDS.TECH_STACK, WIDGET_IDS.CODEWEB_RETRO_GRID, WIDGET_IDS.GODPROFILE_NEURAL],
  ascii: [
    WIDGET_IDS.ASCII_ART,
    WIDGET_IDS.ASCII_TEXT,
    WIDGET_IDS.ASCII_PORTRAIT,
    WIDGET_IDS.ASCII_INFO,
  ],
  stats: [
    WIDGET_IDS.STATS,
    WIDGET_IDS.GITHUB_README_STATS,
    WIDGET_IDS.METRICS_CARD,
    WIDGET_IDS.TERMINAL_INFO,
  ],
  trophies: [WIDGET_IDS.GODPROFILE_TROPHIES, WIDGET_IDS.PROFILE_TROPHY],
  snake: [WIDGET_IDS.CONTRIBUTION_SNAKE],
  views: [WIDGET_IDS.VIEWS_COUNTER],
  quotes: [WIDGET_IDS.README_QUOTES],
  quote: [WIDGET_IDS.README_QUOTES],
  terminal: [WIDGET_IDS.TERMINAL_INFO, 'terminal-card', WIDGET_IDS.GODPROFILE_TERMINAL],
  avatar: [WIDGET_IDS.AVATAR, WIDGET_IDS.ASCII_PORTRAIT],
  gitfut: [WIDGET_IDS.GITFUT_CARD],
  pokemon: [WIDGET_IDS.POKEMON_CARD],
  gitfest: [WIDGET_IDS.GITFEST_LINEUP],
  premiumascii: [
    WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD,
    WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE,
    WIDGET_IDS.PREMIUM_ASCII_INSIGHTS,
    WIDGET_IDS.PREMIUM_ASCII_DNA,
    WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY,
  ],
  premium: [
    WIDGET_IDS.PREMIUM_ASCII_PROFILE_CARD,
    WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE,
    WIDGET_IDS.PREMIUM_ASCII_INSIGHTS,
    WIDGET_IDS.PREMIUM_ASCII_DNA,
    WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY,
  ],
  devscore: [WIDGET_IDS.PREMIUM_ASCII_DEV_SCORE],
  insights: [WIDGET_IDS.PREMIUM_ASCII_INSIGHTS],
  dna: [WIDGET_IDS.PREMIUM_ASCII_DNA],
  developerdna: [WIDGET_IDS.PREMIUM_ASCII_DNA],
  velocity: [WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY],
  codingvelocity: [WIDGET_IDS.PREMIUM_ASCII_CODING_VELOCITY],
  winxp: [
    WIDGET_IDS.WINXP_WINDOW,
    WIDGET_IDS.WINXP_MINESWEEPER,
    WIDGET_IDS.WINXP_MEDIA_PLAYER,
    WIDGET_IDS.WINXP_PAINT,
    WIDGET_IDS.WINXP_TASKBAR,
    WIDGET_IDS.WINXP_ERROR_DIALOG,
    WIDGET_IDS.WINXP_SYSTEM_PROPERTIES,
  ],
  windowsxp: [
    WIDGET_IDS.WINXP_WINDOW,
    WIDGET_IDS.WINXP_MINESWEEPER,
    WIDGET_IDS.WINXP_MEDIA_PLAYER,
    WIDGET_IDS.WINXP_PAINT,
    WIDGET_IDS.WINXP_TASKBAR,
    WIDGET_IDS.WINXP_ERROR_DIALOG,
    WIDGET_IDS.WINXP_SYSTEM_PROPERTIES,
  ],
  minesweeper: [WIDGET_IDS.WINXP_MINESWEEPER],
  paint: [WIDGET_IDS.WINXP_PAINT],
  mediaplayer: [WIDGET_IDS.WINXP_MEDIA_PLAYER],
  taskbar: [WIDGET_IDS.WINXP_TASKBAR],
  sysprop: [WIDGET_IDS.WINXP_SYSTEM_PROPERTIES],
} as const

export interface WidgetDocParam {
  name: string
  type: string
  default: string
  description: string
}

export interface WidgetDocFaq {
  question: string
  answer: string
}

export interface WidgetDocData {
  id: string
  name: string
  title: string
  description: string
  type: string
  codeSnippet: string
  githubSourceUrl: string
  params: WidgetDocParam[]
  bestPractices: string[]
  faqs: WidgetDocFaq[]
}

export const WIDGET_DOCS_MAP: Record<string, WidgetDocData> = {
  stats: {
    id: 'stats',
    name: 'GitHub Live Stats Card',
    title: 'GitHub Profile Live Stats Card SVG Generator',
    description:
      'Render dynamic SVG stats cards for your GitHub profile README. Automatically displays total commits, stars earned, pull requests merged, issues closed, and total contributions.',
    type: 'Dynamic SVG Card',
    codeSnippet: `<!-- GitHub Live Stats Card -->
![GitHub Stats](${APP_URL}/api/YOUR_USERNAME?theme=terminal)`,
    githubSourceUrl: `${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/src/app/api/svg/route.ts`,
    params: [
      {
        name: 'theme',
        type: 'string',
        default: 'terminal',
        description: 'Preset theme style (terminal, minimal, dracula, nord, etc.)',
      },
      {
        name: 'show_icons',
        type: 'boolean',
        default: 'true',
        description: 'Display vector icons next to stat labels',
      },
      {
        name: 'hide_border',
        type: 'boolean',
        default: 'false',
        description: 'Remove outer SVG boundary lines',
      },
    ],
    bestPractices: [
      'Use theme presets matching your GitHub profile aesthetic.',
      'Combine with HTML <picture> tags for automatic light/dark mode switching.',
    ],
    faqs: [
      {
        question: 'How frequently does the stats card refresh?',
        answer:
          'The SVG endpoint computes real-time statistics whenever your GitHub profile page is loaded by a user.',
      },
    ],
  },
  streak: {
    id: 'streak',
    name: 'Contribution Streak Counter',
    title: 'GitHub Contribution Streak Counter SVG Widget',
    description:
      'Display your active daily GitHub contribution streak, total contributions over the past year, and your all-time longest streak.',
    type: 'Streak Counter Widget',
    codeSnippet: `<!-- GitHub Streak Counter -->
![GitHub Streak](${APP_URL}/api/YOUR_USERNAME?widget=streak)`,
    githubSourceUrl: `${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/src/engine/renderers/streakRenderer.ts`,
    params: [
      { name: 'theme', type: 'string', default: 'terminal', description: 'Visual color theme' },
      {
        name: 'hide_days',
        type: 'boolean',
        default: 'false',
        description: 'Hide specific day markers',
      },
    ],
    bestPractices: ['Keep your daily contribution streak active by committing code regularly.'],
    faqs: [
      {
        question: 'Are private contributions counted?',
        answer:
          'If private contributions are enabled in your public GitHub settings, GitAscii counts them towards your streak.',
      },
    ],
  },
  languages: {
    id: 'languages',
    name: 'Top Languages Breakdown',
    title: 'GitHub Top Languages Breakdown SVG Graph',
    description:
      'Generate a visual breakdown of your most used programming languages across public repositories with precise percentage bars.',
    type: 'Language Graph Widget',
    codeSnippet: `<!-- Top Languages Graph -->
![Top Languages](${APP_URL}/api/YOUR_USERNAME?widget=languages)`,
    githubSourceUrl: `${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/src/engine/renderers/languagesRenderer.ts`,
    params: [
      {
        name: 'langs_count',
        type: 'number',
        default: '6',
        description: 'Maximum number of languages to display',
      },
      { name: 'layout', type: 'string', default: 'compact', description: 'Display layout style' },
    ],
    bestPractices: [
      'Exclude auto-generated or vendored language files via .gitattributes if necessary.',
    ],
    faqs: [
      {
        question: 'How are language percentages calculated?',
        answer:
          'GitAscii calculates byte sizes returned by the GitHub GraphQL API across your public repositories.',
      },
    ],
  },
  ascii: {
    id: 'ascii',
    name: 'Image-to-ASCII Art Banner',
    title: 'GitHub Profile ASCII Art Banner Generator',
    description:
      'Convert user avatars, logos, or custom artwork into character-based text art banners with configurable density and color accents.',
    type: 'ASCII Art Converter',
    codeSnippet: `<!-- ASCII Banner -->
![ASCII Banner](${APP_URL}/api/YOUR_USERNAME?widget=ascii)`,
    githubSourceUrl: `${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/src/engine/asciiEngine.ts`,
    params: [
      {
        name: 'charset',
        type: 'string',
        default: 'standard',
        description: 'ASCII character mapping set',
      },
      {
        name: 'density',
        type: 'number',
        default: '80',
        description: 'Character density resolution grid',
      },
    ],
    bestPractices: ['Use high-contrast square avatars for best ASCII conversion results.'],
    faqs: [
      {
        question: 'Can I upload custom images?',
        answer:
          'Yes! In the GitAscii visual editor, you can upload custom PNG/JPG images to generate ASCII text grids.',
      },
    ],
  },
  stack: {
    id: 'stack',
    name: 'Tech Stack Badges',
    title: 'Custom Tech Stack Badges Generator for GitHub README',
    description:
      'Create tech stack badges with official brand logos, custom background fills, and clean SVG rendering.',
    type: 'Tech Badges Generator',
    codeSnippet: `<!-- Tech Stack Badges -->
![Tech Badges](${APP_URL}/api/YOUR_USERNAME?widget=stack)`,
    githubSourceUrl: `${EXTERNAL_LINKS.GITHUB_REPO}/blob/main/src/engine/renderers/stackRenderer.ts`,
    params: [
      {
        name: 'style',
        type: 'string',
        default: 'for-the-badge',
        description: 'Badge style preset',
      },
    ],
    bestPractices: ['Group badges logically by Category (Frontend, Backend, DevOps, Databases).'],
    faqs: [
      {
        question: 'Are official technology logos supported?',
        answer:
          'Yes, GitAscii integrates vector brand logos for over 500+ popular frameworks and tools.',
      },
    ],
  },
}

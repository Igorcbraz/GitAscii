export interface ExternalLinksDef {
  readonly DOCS: string
  readonly GITHUB_REPO: string
  readonly GITHUB_FORK: string
  readonly GITHUB_ISSUES: string
  readonly GITHUB_LICENSE: string
  readonly GITHUB_TERMS: string
  readonly GITHUB_PRIVACY: string
  readonly GITHUB_RAW_BASE: string
  readonly DEFAULT_GITHUB_AVATAR: string
  readonly DEFAULT_GHOST_AVATAR: string
  readonly DEFAULT_APP_OG_IMAGE: string
  readonly DEFAULT_APP_OG_IMAGE_PT: string
  readonly GOOGLE_FONTS_CSS: string
  readonly GOOGLE_PRIVACY: string
  readonly MICROSOFT_PRIVACY: string
  readonly SENTRY_PRIVACY: string
  readonly VERCEL_PRIVACY: string
  readonly JSON_FEED_SPEC: string
  readonly SCHEMA_ORG: string
  readonly LUCIDE_ICONS: string
  readonly GIPHY: string
  readonly SHIELDS_IO: string
  readonly AWESOME_GITHUB_PROFILE_README: string
  readonly COMMUNITY_REPOS: {
    readonly ASCII_PROFILE_KIT: string
    readonly GOD_PROFILE: string
    readonly PROFILE_CONTROL_PLANE: string
    readonly CODEWEB_DEV: string
    readonly SURVEILLANCE_CONSOLE: string
    readonly GITFUT: string
    readonly PEDRO_FONSECA: string
  }
  readonly CODEWEB_DEFAULT_GIFS: {
    readonly LEFT: string
    readonly CARD1: string
    readonly CARD2: string
  }
}

export const APP_URL = 'https://gitascii.com'

export const EXTERNAL_LINKS: ExternalLinksDef = {
  DOCS: 'https://docs.gitascii.com',
  GITHUB_REPO: 'https://github.com/Igorcbraz/GitAscii',
  GITHUB_FORK: 'https://github.com/Igorcbraz/GitAscii/fork',
  GITHUB_ISSUES: 'https://github.com/Igorcbraz/GitAscii/issues',
  GITHUB_LICENSE: 'https://github.com/Igorcbraz/GitAscii/blob/main/LICENSE',
  GITHUB_TERMS: 'https://docs.github.com/en/site-policy/github-terms/github-terms-of-service',
  GITHUB_PRIVACY:
    'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  GITHUB_RAW_BASE: 'https://raw.githubusercontent.com',
  DEFAULT_GITHUB_AVATAR: 'https://github.com/github.png',
  DEFAULT_GHOST_AVATAR: 'https://github.com/ghost.png',
  DEFAULT_APP_OG_IMAGE: 'https://git-ascii.vercel.app/og-image.png',
  DEFAULT_APP_OG_IMAGE_PT: 'https://git-ascii.vercel.app/og-image-pt-br.png',
  GOOGLE_FONTS_CSS:
    'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=PT+Serif:ital,wght@0,300;1,300&display=swap',
  GOOGLE_PRIVACY: 'https://policies.google.com/privacy',
  MICROSOFT_PRIVACY: 'https://privacy.microsoft.com',
  SENTRY_PRIVACY: 'https://sentry.io/privacy/',
  VERCEL_PRIVACY: 'https://vercel.com/legal/privacy-policy',
  JSON_FEED_SPEC: 'https://jsonfeed.org/version/1.1',
  SCHEMA_ORG: 'https://schema.org',
  LUCIDE_ICONS: 'https://lucide.dev/icons',
  GIPHY: 'https://giphy.com/',
  SHIELDS_IO: 'https://shields.io',
  AWESOME_GITHUB_PROFILE_README: 'https://github.com/abhisheknaiidu/awesome-github-profile-readme',
  COMMUNITY_REPOS: {
    ASCII_PROFILE_KIT: 'https://github.com/mithun50/ascii-profile-kit',
    GOD_PROFILE: 'https://github.com/Luc0-0/GodProfile',
    PROFILE_CONTROL_PLANE: 'https://github.com/majiayu000/profile-control-plane',
    CODEWEB_DEV: 'https://github.com/codeweb-dev/codeweb-dev',
    SURVEILLANCE_CONSOLE: 'https://github.com/rugbedbugg/rugbedbugg',
    GITFUT: 'https://gitfut.com',
    PEDRO_FONSECA: 'https://github.com/PedroFnseca',
  },
  CODEWEB_DEFAULT_GIFS: {
    LEFT: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmVyNmVtYnVubXg1Mmw1MTZ5Y29hdXN0dzJlOTFtNzVmNWwycmgxbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fVsVfxVwz40I24GT7X/giphy.gif',
    CARD1:
      'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW95cTRnOXM1dTc1YTFwNjRkcGNkN2RqYjdhdTB3NTc3NDFiNjFxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h58dtf5vTpjulO4M5o/giphy.gif',
    CARD2:
      'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExemdhbXMwdWNkaDA5eTM4Y3ZjYnYzNTR5YnB0M21jdzlrd2gyczQxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VGh13y4IVFZzCACfTX/giphy.gif',
  },
} as const

export interface ResourceGuide {
  slug: string
  title: string
  publisher: string
  publisherBadge: string
  externalUrl: string
  summary: string
  readTime: string
  tags: string[]
}

export const GUIDES_RESOURCES_LIST: readonly ResourceGuide[] = [
  {
    slug: 'github-official-profile-readme-guide',
    title: 'Official GitHub Guide: Managing Your Profile README',
    publisher: 'GitHub Documentation',
    publisherBadge: 'GITHUB DOCS',
    externalUrl:
      'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme',
    summary:
      'Official step-by-step instructions from GitHub on initializing your special repository (username/username), configuring visibility, and publishing your developer README.',
    readTime: '4 min read',
    tags: ['Official', 'Setup', 'GitHub Docs'],
  },
  {
    slug: 'medium-awesome-github-profile-readme',
    title: 'How to Create an Outstanding GitHub Profile README (Medium Guide)',
    publisher: 'Medium Engineering',
    publisherBadge: 'MEDIUM',
    externalUrl: 'https://medium.com/topic/software-engineering',
    summary:
      'Comprehensive tutorial breaking down effective developer profile structures, technical badges, contribution streak displays, and project showcases.',
    readTime: '6 min read',
    tags: ['Medium', 'Portfolio', 'Design'],
  },
  {
    slug: 'shields-io-badge-guide',
    title: 'Mastering Shields.io Badges & Custom SVG Layouts',
    publisher: 'Shields.io Docs',
    publisherBadge: 'SHIELDS.IO',
    externalUrl: 'https://shields.io',
    summary:
      'Guide to embedding custom technology badges, social media links, build status indicators, and SVG styling parameters in your profile.',
    readTime: '5 min read',
    tags: ['Badges', 'SVG', 'Documentation'],
  },
  {
    slug: 'github-dark-light-mode-switching',
    title: 'Dark & Light Mode Automatic Theme Switching in GitHub Markdown',
    publisher: 'GitHub Markup Guide',
    publisherBadge: 'GITHUB DOCS',
    externalUrl:
      'https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax',
    summary:
      'Learn how to use HTML <picture> and media queries (prefers-color-scheme) to render adaptive SVGs on GitHub dark and light themes.',
    readTime: '4 min read',
    tags: ['Themes', 'HTML', 'Markdown'],
  },
  {
    slug: 'freecodecamp-ascii-art-banners',
    title: 'Building ASCII Art Banners for Developer Portfolios',
    publisher: 'FreeCodeCamp',
    publisherBadge: 'FREECODECAMP',
    externalUrl: 'https://www.freecodecamp.org/news/tag/markdown/',
    summary:
      'Tutorial on converting avatars, logos, and custom graphics into character density text grids that render cleanly across all Markdown renderers.',
    readTime: '7 min read',
    tags: ['ASCII Art', 'FreeCodeCamp', 'Tutorial'],
  },
]

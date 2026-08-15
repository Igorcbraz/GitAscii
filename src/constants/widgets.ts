import { APP_URL, EXTERNAL_LINKS } from './links'

export const RECOMMENDED_PROFILE_WIDGETS: string[] = [
  'header',
  'ascii-art',
  'bio',
  'stats',
  'languages',
  'repositories',
  'footer',
]

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

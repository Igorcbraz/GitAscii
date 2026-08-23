import { EXTERNAL_LINKS } from '@/constants'

export interface WidgetItem {
  id: string
  name: string
  type: string
  description: string
  codeSnippet: string
  features: string[]
  githubSourceUrl: string
}

export const widgetsList: WidgetItem[] = [
  {
    id: 'stats',
    name: 'GitHub Live Stats Card',
    type: 'SVG Widget',
    description:
      'Calculates total commits, stars earned, PRs merged, issues closed, and repository count directly from GitHub API in real time.',
    codeSnippet: '![Stats](${APP_URL}/api/YOUR_USERNAME)',
    features: [
      'Real-time GraphQL calculation',
      'Automatic caching (4h TTL)',
      '13+ dark/light theme presets',
    ],
    githubSourceUrl: 'https://github.com/Igorcbraz/GitAscii/blob/main/src/app/api/svg/route.ts',
  },
  {
    id: 'streak',
    name: 'Contribution Streak Counter',
    type: 'SVG Widget',
    description:
      'Displays active daily contribution streak, longest streak, and total contributions over the past year with vector streak flame icons.',
    codeSnippet: '![Streak](${APP_URL}/api/YOUR_USERNAME?widget=streak)',
    features: [
      'Counts public & private commits',
      'Dynamic flame icons',
      'High DPI scalable vector output',
    ],
    githubSourceUrl:
      'https://github.com/Igorcbraz/GitAscii/blob/main/src/engine/renderers/streakRenderer.ts',
  },
  {
    id: 'languages',
    name: 'Top Languages Breakdown',
    type: 'SVG Widget',
    description:
      'Visual breakdown of your most used programming languages across public repositories with color-coded percentage progress bars.',
    codeSnippet: '![Languages](${APP_URL}/api/YOUR_USERNAME?widget=languages)',
    features: [
      'GraphQL repo language bytes',
      'Color-coded ecosystem bars',
      'Filterable repo counts',
    ],
    githubSourceUrl:
      'https://github.com/Igorcbraz/GitAscii/blob/main/src/engine/renderers/languagesRenderer.ts',
  },
  {
    id: 'ascii',
    name: 'Image-to-ASCII Art Banner',
    type: 'ASCII Engine',
    description:
      'Converts user avatar or custom uploaded artwork into character-based text grids with configurable character sets and color density.',
    codeSnippet: '![ASCII](${APP_URL}/api/YOUR_USERNAME?widget=ascii)',
    features: [
      'Custom character density mapping',
      'High-contrast edge detection',
      'Dynamic lime accent colors',
    ],
    githubSourceUrl: 'https://github.com/Igorcbraz/GitAscii/blob/main/src/engine/asciiEngine.ts',
  },
  {
    id: 'stack',
    name: 'Tech Stack Badges',
    type: 'Shields Badge',
    description:
      'Customizable technology badges with official brand logos, background fills, custom labels, and clean SVG rendering.',
    codeSnippet: '![Stack](${APP_URL}/api/YOUR_USERNAME?widget=stack)',
    features: [
      '500+ technology brand logos',
      'Shields.io schema compatibility',
      'Responsive horizontal flex layout',
    ],
    githubSourceUrl:
      'https://github.com/Igorcbraz/GitAscii/blob/main/src/engine/renderers/stackRenderer.ts',
  },
  {
    id: 'pedro-profile-card',
    name: 'Profile Terminal Card',
    type: 'Terminal Card',
    description:
      'All-in-one terminal presentation card with developer identity, GitHub metrics, top repositories, language breakdown and terminal prompt.',
    codeSnippet: '![Profile](${APP_URL}/api/YOUR_USERNAME?widgets=pedro-profile-card)',
    features: [
      'Roles, Location, Website & Uptime metadata',
      'Top Repositories & ASCII Language bars',
      'Terminal prompt & GitHub stats summary',
    ],
    githubSourceUrl: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
  },
  {
    id: 'pedro-dev-score',
    name: 'Scorecard',
    type: 'Scorecard',
    description:
      'Synthetic 0-100 score engine calculating Activity, Open Source, Consistency, Impact, Community and Master Developer Score.',
    codeSnippet: '![Score](${APP_URL}/api/YOUR_USERNAME?widgets=pedro-dev-score)',
    features: [
      'Deterministic 0-100 rating algorithm',
      'ASCII progress bars and tier grade',
      'Master Developer Score summary',
    ],
    githubSourceUrl: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
  },
  {
    id: 'pedro-insights-dossier',
    name: 'Insights & Habits',
    type: 'Insights Card',
    description:
      'Behavioral diagnostics and temporal productivity distribution (Morning, Afternoon, Evening, Night).',
    codeSnippet: '![Insights](${APP_URL}/api/YOUR_USERNAME?widgets=pedro-insights-dossier)',
    features: [
      'Night owl vs early bird diagnostics',
      'Temporal distribution analysis',
      'Peak activity day & active month tracking',
    ],
    githubSourceUrl: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
  },
  {
    id: 'pedro-developer-dna',
    name: 'DNA',
    type: 'DNA Radar',
    description:
      'Behavioral developer traits breakdown (Builder, Maintainer, Open Source, Community, Explorer) and primary archetype classification.',
    codeSnippet: '![DNA](${APP_URL}/api/YOUR_USERNAME?widgets=pedro-developer-dna)',
    features: [
      'Archetype classification (> THE BUILDER)',
      'Behavioral percentages and block bars',
      'Multi-dimensional developer profile radar',
    ],
    githubSourceUrl: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
  },
  {
    id: 'pedro-coding-velocity',
    name: 'Coding Velocity',
    type: 'Velocity Card',
    description:
      'Monthly coding throughput metrics (Commits/mo, PRs/mo, Issues/mo) and daily average activity.',
    codeSnippet: '![Coding Velocity](${APP_URL}/api/YOUR_USERNAME?widgets=pedro-coding-velocity)',
    features: [
      'Monthly throughput telemetry',
      'Average daily commit calculations',
      'Solid block ASCII velocity bars',
    ],
    githubSourceUrl: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
  },
]

export const attributions = [
  {
    name: 'ASCII Premium Kit (Pedro Fonseca)',
    description:
      'Retro ASCII terminal developer profile cards, all-in-one GitHub stats cards, synthetic scores and terminal animations.',
    url: EXTERNAL_LINKS.COMMUNITY_REPOS.PEDRO_FONSECA,
    license: 'MIT License',
  },
  {
    name: 'Shields.io',
    description:
      'Concise, consistent vector badges and logo schema standards for GitHub profile READMEs.',
    url: 'https://github.com/badges/shields',
    license: 'CC0-1.0 / MIT',
  },
  {
    name: 'github-readme-stats',
    description:
      'Dynamically generated GitHub stats cards and language breakdown SVG specifications.',
    url: 'https://github.com/anuraghazra/github-readme-stats',
    license: 'MIT License',
  },
  {
    name: 'github-readme-streak-stats',
    description: 'Contribution streak tracking algorithms and vector streak counter designs.',
    url: 'https://github.com/DenverCoder1/github-readme-streak-stats',
    license: 'MIT License',
  },
  {
    name: 'Simple Icons',
    description:
      'SVG brand vector icons for popular software development tools, frameworks, and languages.',
    url: 'https://github.com/simple-icons/simple-icons',
    license: 'CC0-1.0',
  },
  {
    name: 'Surveillance Console (rugbedbugg)',
    description:
      'Retro 198X animated surveillance console telemetry panels, CRT scanlines, and CCTV feeds.',
    url: 'https://github.com/rugbedbugg/rugbedbugg',
    license: 'MIT License',
  },
]

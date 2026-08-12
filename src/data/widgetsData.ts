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
]

export const attributions = [
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
]

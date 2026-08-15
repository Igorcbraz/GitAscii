export interface CompetitorData {
  slug: string
  name: string
  title: string
  description: string
  summary: string
  prosGitAscii: string[]
  comparisonPoints: { feature: string; gitascii: string; competitor: string }[]
  faqs: { question: string; answer: string }[]
}

export const COMPETITORS_MAP: Record<string, CompetitorData> = {
  'readme-so': {
    slug: 'readme-so',
    name: 'Readme.so',
    title: 'GitAscii vs Readme.so — Feature & Performance Comparison',
    description:
      'In-depth comparison between GitAscii and Readme.so. Discover why GitAscii offers live SVG rendering, custom ASCII art engine, and dynamic profile stats.',
    summary:
      'While Readme.so is a popular section-based markdown builder, GitAscii provides live SVG rendering, dynamic stats widgets, an image-to-ASCII converter, and dark/light mode automatic theme adaptation.',
    prosGitAscii: [
      'Live SVG Widget Endpoints served on Vercel Edge Serverless functions.',
      'Built-in Image-to-ASCII Art Converter Engine.',
      'Support for multiple named profiles per GitHub username.',
      'Automatic dark and light theme switching via HTML <picture> elements.',
    ],
    comparisonPoints: [
      {
        feature: 'Live Dynamic SVGs',
        gitascii: 'Yes (Auto-refreshing)',
        competitor: 'No (Static Markdown)',
      },
      { feature: 'ASCII Art Engine', gitascii: 'Yes (6+ Charsets)', competitor: 'No' },
      { feature: 'Visual Editor', gitascii: 'Drag & Drop Canvas', competitor: 'Section List' },
      {
        feature: 'Multi-Profile Support',
        gitascii: 'Unlimited Named Profiles',
        competitor: 'Single Layout',
      },
    ],
    faqs: [
      {
        question: 'Why choose GitAscii over Readme.so?',
        answer:
          'GitAscii goes beyond static markdown text by rendering live SVG stats, contribution streaks, and custom ASCII art banners that update automatically on GitHub.',
      },
    ],
  },
  gprm: {
    slug: 'gprm',
    name: 'GPRM (GitHub Profile README Maker)',
    title: 'GitAscii vs GPRM — Detailed Comparison & Alternatives',
    description:
      'Compare GitAscii with GPRM (GitHub Profile README Maker). Modern visual editor vs form inputs, 13+ handcrafted theme presets, and live SVG stats.',
    summary:
      'GPRM offers basic form inputs for creating READMEs. GitAscii elevates the experience with an interactive drag-and-drop visual canvas, instant auto-generation, 13+ theme presets, and full typography controls.',
    prosGitAscii: [
      'Interactive visual canvas with real-time drag-and-drop positioning.',
      '13+ theme presets (Terminal, Minimal, Cyberpunk, Dracula, Nord, Tokyo Night, etc.).',
      'Smart profile auto-generation based on public GitHub repository data.',
    ],
    comparisonPoints: [
      { feature: 'Interface', gitascii: 'Visual Drag & Drop Canvas', competitor: 'Form Fields' },
      {
        feature: 'Themes & Aesthetics',
        gitascii: '13+ Handcrafted Themes',
        competitor: 'Basic Styles',
      },
      { feature: 'ASCII Art Converter', gitascii: 'Yes', competitor: 'No' },
    ],
    faqs: [
      {
        question: 'Can I migrate my GPRM profile to GitAscii?',
        answer:
          'Yes! Simply enter your GitHub username into GitAscii and our smart generator will auto-create an optimized profile layout.',
      },
    ],
  },
  'github-profile-readme-generator': {
    slug: 'github-profile-readme-generator',
    name: 'Generic Profile Generators',
    title: 'GitAscii vs Generic GitHub Profile Generators',
    description:
      'Compare GitAscii against static, generic GitHub profile generators. Learn why dynamic SVGs and ASCII art create higher-converting developer profiles.',
    summary:
      'Generic generators rely on static badges and uninspired forms. GitAscii offers real-time live SVG rendering, ASCII art, multi-profile layouts, and SEO/GEO structured metadata.',
    prosGitAscii: [
      'Live stats that automatically update as you commit code on GitHub.',
      'High-DPI vector rendering on dark and light themes.',
    ],
    comparisonPoints: [
      {
        feature: 'Live Data Updates',
        gitascii: 'Real-time via URL',
        competitor: 'Static Hardcoded',
      },
      { feature: 'Design Aesthetic', gitascii: 'Premium Modern UI', competitor: 'Basic Defaults' },
    ],
    faqs: [
      {
        question: 'What makes GitAscii different from basic generators?',
        answer:
          'GitAscii combines live SVG stats widgets, an ASCII art engine, theme templates, and multi-profile support in one free open-source platform.',
      },
    ],
  },
}

export interface ComparisonHubItem {
  slug: string
  titleKey: string
  defaultTitle: string
  summaryKey: string
  defaultSummary: string
}

export const COMPARISON_HUB_ITEMS: ComparisonHubItem[] = [
  {
    slug: 'readme-so',
    titleKey: 'vs.readme_so_title',
    defaultTitle: 'GitAscii vs Readme.so',
    summaryKey: 'vs.readme_so_summary',
    defaultSummary:
      'Compare GitAscii with Readme.so. Learn why GitAscii offers live SVG rendering, custom ASCII art engine, and multi-profile support.',
  },
  {
    slug: 'gprm',
    titleKey: 'vs.gprm_title',
    defaultTitle: 'GitAscii vs GPRM',
    summaryKey: 'vs.gprm_summary',
    defaultSummary:
      'Compare GitAscii with GitHub Profile README Maker (GPRM). Discover GitAscii visual drag-and-drop editor and 13+ modern themes.',
  },
  {
    slug: 'github-profile-readme-generator',
    titleKey: 'vs.generic_title',
    defaultTitle: 'GitAscii vs Generic Generators',
    summaryKey: 'vs.generic_summary',
    defaultSummary:
      'Compare GitAscii against static GitHub README generators. Live statistics, dark/light theme switching, and real-time SVG previews.',
  },
]

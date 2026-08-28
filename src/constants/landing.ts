import type { LucideIcon } from 'lucide-react'
import { BookOpen, Cpu, Layout, Paintbrush, Sparkles, Terminal, Users, Zap } from 'lucide-react'

export interface TemplateShowcaseItem {
  name: string
  gradient: string
  accent: string
  tags: string[]
  preview: string
}

export const TEMPLATES_SHOWCASE_LIST: readonly TemplateShowcaseItem[] = [
  {
    name: 'Terminal',
    gradient: 'from-[#000000] to-[#1a1a2e]',
    accent: '#c5ff4a',
    tags: ['Classic', 'CLI'],
    preview: 'root@host:~$ ./run\n[OK] System Ready\n> Executing ASCII...',
  },
  {
    name: 'Minimal',
    gradient: 'from-[#ffffff] to-[#f5f5f5]',
    accent: '#000000',
    tags: ['Clean', 'Light'],
    preview: '      .       \n    .   .     \n  .       .   ',
  },
  {
    name: 'GitHub Dark',
    gradient: 'from-[#0d1117] to-[#161b22]',
    accent: '#58a6ff',
    tags: ['Native', 'Dark'],
    preview: 'const profile = {\n  commits: 492,\n  stars: 128\n};',
  },
  {
    name: 'Dracula',
    gradient: 'from-[#282a36] to-[#44475a]',
    accent: '#bd93f9',
    tags: ['Theme', 'Vibrant'],
    preview: 'function magic() {\n  return "sparkles";\n}',
  },
  {
    name: 'Nord',
    gradient: 'from-[#2e3440] to-[#3b4252]',
    accent: '#88c0d0',
    tags: ['Cold', 'Elegant'],
    preview: '# ~ / nordic / cold\n\n[===        ] 30%',
  },
  {
    name: 'Tokyo Night',
    gradient: 'from-[#1a1b26] to-[#24283b]',
    accent: '#7aa2f7',
    tags: ['Neon', 'Modern'],
    preview: 'import neon from "night";\n\nneon.glow();',
  },
  {
    name: 'Gruvbox',
    gradient: 'from-[#282828] to-[#3c3836]',
    accent: '#fabd2f',
    tags: ['Warm', 'Retro'],
    preview: '>> Retro mode\n>> Warm colors\n>> Active',
  },
  {
    name: 'Cyberpunk',
    gradient: 'from-[#0a0a0f] to-[#1a0a2e]',
    accent: '#ff00ff',
    tags: ['Sci-Fi', 'Glow'],
    preview: 'WAKE UP SAMURAI\nWE HAVE A CITY\nTO BURN',
  },
  {
    name: 'Matrix',
    gradient: 'from-[#000000] to-[#001100]',
    accent: '#00ff00',
    tags: ['Hacker', 'Green'],
    preview: '01010101 00000000\n11111111 10101010\n00000000 11111111',
  },
  {
    name: 'Japanese',
    gradient: 'from-[#1a1a1a] to-[#2d2d2d]',
    accent: '#e74c3c',
    tags: ['Minimal', 'Zen'],
    preview: '「 こんにちは 」\n\n  ZEN MODE   ',
  },
  {
    name: 'Bento',
    gradient: 'from-[#0f0f0f] to-[#1a1a1a]',
    accent: '#ffffff',
    tags: ['Grid', 'Modern'],
    preview: '+---+ +---+\n|   | |   |\n+---+ +---+',
  },
  {
    name: 'Portfolio',
    gradient: 'from-[#0a0a0a] to-[#1a1a2e]',
    accent: '#c5ff4a',
    tags: ['Pro', 'Lime'],
    preview: "HELLO WORLD.\nI MAKE THINGS.\nLET'S TALK.",
  },
  {
    name: 'Open Source',
    gradient: 'from-[#0d1117] to-[#161b22]',
    accent: '#3fb950',
    tags: ['Community', 'Green'],
    preview: 'git commit -m "feat"\ngit push origin main\n🚀 Deployed.',
  },
]

export interface SummaryFeatureRaw {
  num: string
  titleKey: string
  titleEn: string
  titlePt: string
  descKey: string
  descEn: string
  descPt: string
}

export const SUMMARY_FEATURES_RAW: readonly SummaryFeatureRaw[] = [
  {
    num: '[ ENGINE-01 ]',
    titleKey: 'landing.summary.feat1.title',
    titleEn: 'Real-Time SVG Engine',
    titlePt: 'Motor SVG em Tempo Real',
    descKey: 'landing.summary.feat1.desc',
    descEn:
      'Generates live statistics, contribution streaks, and language charts directly from public APIs on-the-fly.',
    descPt:
      'Gera estatísticas, racha de commits e gráficos de linguagens dinamicamente via APIs públicas.',
  },
  {
    num: '[ ENGINE-02 ]',
    titleKey: 'landing.summary.feat2.title',
    titleEn: 'Image-to-ASCII Converter',
    titlePt: 'Conversor de Imagem para ASCII',
    descKey: 'landing.summary.feat2.desc',
    descEn:
      'Convert your avatar or custom branding into text-based art grids with adjustable character density and contrast.',
    descPt:
      'Converta seu avatar ou logo em matrizes de caracteres com densidade e contraste ajustáveis.',
  },
  {
    num: '[ ENGINE-03 ]',
    titleKey: 'landing.summary.feat3.title',
    titleEn: 'Theme Adaptability',
    titlePt: 'Adaptabilidade de Temas',
    descKey: 'landing.summary.feat3.desc',
    descEn:
      'Seamless switching between dark and light themes using standard HTML <picture> tags and media queries.',
    descPt:
      'Alternância automática de temas claro e escuro usando tags HTML <picture> e media queries.',
  },
  {
    num: '[ ENGINE-04 ]',
    titleKey: 'landing.summary.feat4.title',
    titleEn: 'Edge Native & Zero Setup',
    titlePt: 'Edge Native e Zero Setup',
    descKey: 'landing.summary.feat4.desc',
    descEn:
      'Rendered instantly on Serverless Edge functions. Cached efficiently for fast loading on GitHub Camo.',
    descPt:
      'Renderização instantânea em Serverless Edge. Cache otimizado para carregamento ultra-rápido no GitHub Camo.',
  },
]

export interface VsMatrixRowRaw {
  featureKey: string
  featureEn: string
  featurePt: string
  gitascii: string
  readme: string
  gprm: string
}

export const SUMMARY_VS_MATRIX_RAW: readonly VsMatrixRowRaw[] = [
  {
    featureKey: 'vs.concept_edge_rendering',
    featureEn: 'Dynamic SVG Edge Rendering',
    featurePt: 'Renderização de SVG na Edge',
    gitascii: 'included',
    readme: 'no',
    gprm: 'no',
  },
  {
    featureKey: 'vs.concept_theme_toggle',
    featureEn: 'Native Light/Dark Auto-Toggle',
    featurePt: 'Alternância Clara/Escura Nativa',
    gitascii: 'included',
    readme: 'manual',
    gprm: 'manual',
  },
  {
    featureKey: 'vs.concept_ascii_engine',
    featureEn: 'Luminance-Based ASCII Engine',
    featurePt: 'Motor ASCII por Luminância',
    gitascii: 'included',
    readme: 'no',
    gprm: 'no',
  },
  {
    featureKey: 'vs.concept_visual_builder',
    featureEn: 'Visual Layout Canvas Builder',
    featurePt: 'Construtor de Layout Visual',
    gitascii: 'included',
    readme: 'included',
    gprm: 'form',
  },
  {
    featureKey: 'vs.concept_zero_db',
    featureEn: 'Zero Database Dependency',
    featurePt: 'Dependência Zero de Banco de Dados',
    gitascii: 'included',
    readme: 'requires_db',
    gprm: 'included',
  },
  {
    featureKey: 'vs.concept_self_host',
    featureEn: 'MIT Open Source & Self-Hostable',
    featurePt: 'Código Aberto MIT / Auto-Hospedável',
    gitascii: 'mit',
    readme: 'open_source',
    gprm: 'open_source',
  },
]

export interface NavbarDropdownItemRaw {
  key: string
  defaultTitle: string
  defaultDesc: string
  href: string
  isExternal?: boolean
  badge?: string
  featured?: boolean
  titleNormal?: string
  titleHighlight?: string
  titleEnd?: string
}

export interface NavbarMenuSectionRaw {
  key: string
  defaultLabel: string
  items: readonly NavbarDropdownItemRaw[]
  footerLink?: {
    key: string
    defaultLabel: string
    href: string
    isExternal?: boolean
  }
}

export const NAVBAR_DROPDOWN_SECTIONS: readonly NavbarMenuSectionRaw[] = [
  {
    key: 'landing.navbar.platform',
    defaultLabel: 'PLATFORM',
    items: [
      {
        key: 'pricing',
        defaultTitle: 'GitAscii Pro',
        titleNormal: 'GitAscii ',
        titleHighlight: 'Pro',
        titleEnd: '',
        defaultDesc: 'Lifetime analytics, 24/7 monitoring, multi-profile & edge CDN. Pay once.',
        href: '/pro',
        badge: 'LIFETIME ACCESS',
        featured: true,
      },
      {
        key: 'templates',
        defaultTitle: 'Templates Catalog',
        titleNormal: 'Explore ',
        titleHighlight: 'Templates',
        titleEnd: ' Catalog',
        defaultDesc: '13+ battle-tested layout presets ready to clone & customize.',
        href: '/templates',
        badge: '13+',
      },
      {
        key: 'widgets',
        defaultTitle: 'Dynamic Widgets',
        titleNormal: 'Dynamic ',
        titleHighlight: 'Widgets',
        defaultDesc: '30+ live SVG widgets mapping GitHub stats & ASCII art.',
        href: '/widgets',
        badge: '30+ SVG',
      },
      {
        key: 'explore',
        defaultTitle: 'Explore Profiles',
        titleNormal: 'Community ',
        titleHighlight: 'Portfolios',
        defaultDesc: 'Browse developer setups and clone real READMEs.',
        href: '/explore',
        badge: 'COMMUNITY',
      },
      {
        key: 'guides',
        defaultTitle: 'Guides & Tutorials',
        titleNormal: 'README ',
        titleHighlight: 'Guides',
        defaultDesc: 'Curated articles on GitHub markdown, SVG badges & themes.',
        href: '/guides',
      },
    ],
    footerLink: {
      key: 'landing.navbar.platform_pricing',
      defaultLabel: 'View Full Pricing & Features',
      href: '/pro',
    },
  },
  {
    key: 'landing.navbar.developers',
    defaultLabel: 'DEVELOPERS',
    items: [
      {
        key: 'api_rendering',
        defaultTitle: 'Edge Rendering API',
        titleNormal: 'Real-Time ',
        titleHighlight: 'Edge API',
        titleEnd: ' Engine',
        defaultDesc: 'Dynamic SVGs served from global edge caches in milliseconds.',
        href: 'https://docs.gitascii.com/api/rendering',
        isExternal: true,
        badge: 'HIGH SPEED',
        featured: true,
      },
      {
        key: 'quickstart',
        defaultTitle: 'Quickstart Guide',
        titleNormal: 'Quickstart ',
        titleHighlight: 'Guide',
        defaultDesc: 'Get your dynamic README running in less than 2 minutes.',
        href: 'https://docs.gitascii.com/quickstart',
        isExternal: true,
      },
      {
        key: 'ascii_pipeline',
        defaultTitle: 'ASCII Architecture',
        titleNormal: 'ASCII ',
        titleHighlight: 'Pipeline',
        defaultDesc: 'Deep dive into FIGlet font rasterization & luminance mapping.',
        href: 'https://docs.gitascii.com/guides/ascii-pipeline',
        isExternal: true,
      },
      {
        key: 'design_tokens',
        defaultTitle: 'Design Tokens & Themes',
        titleNormal: 'Design ',
        titleHighlight: 'Tokens',
        defaultDesc: 'Dark/Light specifications and theme color palettes.',
        href: 'https://docs.gitascii.com/reference/design-tokens',
        isExternal: true,
      },
    ],
    footerLink: {
      key: 'landing.navbar.docs_full',
      defaultLabel: 'Visit Full Documentation (docs.gitascii.com)',
      href: 'https://docs.gitascii.com',
      isExternal: true,
    },
  },
]

export type ShowcaseTabType = 'templates' | 'widgets' | 'profiles' | 'guides'

export interface ShowcaseTabDef {
  id: ShowcaseTabType
  labelKey: string
  labelEn: string
  labelPt: string
  icon: LucideIcon
}

export const SHOWCASE_TABS: readonly ShowcaseTabDef[] = [
  {
    id: 'templates',
    labelKey: 'landing.showcase.tab.templates',
    labelEn: '01 · TEMPLATES',
    labelPt: '01 · TEMPLATES',
    icon: Layout,
  },
  {
    id: 'widgets',
    labelKey: 'landing.showcase.tab.widgets',
    labelEn: '02 · DYNAMIC WIDGETS',
    labelPt: '02 · WIDGETS DINÂMICOS',
    icon: Zap,
  },
  {
    id: 'profiles',
    labelKey: 'landing.showcase.tab.profiles',
    labelEn: '03 · COMMUNITY PROFILES',
    labelPt: '03 · PERFIS DA COMUNIDADE',
    icon: Users,
  },
  {
    id: 'guides',
    labelKey: 'landing.showcase.tab.guides',
    labelEn: '04 · README GUIDES',
    labelPt: '04 · GUIAS DE README',
    icon: BookOpen,
  },
]

export interface PopularTemplateItem {
  id: string
  name: string
  bg: string
  border: string
  accent: string
  text: string
  category: string
  tags: string[]
}

export const POPULAR_TEMPLATES: readonly PopularTemplateItem[] = [
  {
    id: 'terminal',
    name: 'Terminal CLI',
    bg: 'bg-[#000000]',
    border: 'border-signal-lime/30',
    accent: '#c5ff4a',
    text: '#ffffff',
    category: 'cli',
    tags: ['Classic', 'CLI'],
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    bg: 'bg-[#1a1b26]',
    border: 'border-[#7aa2f7]/30',
    accent: '#7aa2f7',
    text: '#a9b1d6',
    category: 'themes',
    tags: ['Neon', 'Modern'],
  },
  {
    id: 'dracula',
    name: 'Dracula Theme',
    bg: 'bg-[#282a36]',
    border: 'border-[#bd93f9]/30',
    accent: '#bd93f9',
    text: '#f8f8f2',
    category: 'themes',
    tags: ['Vibrant', 'Theme'],
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    bg: 'bg-[#ffffff]',
    border: 'border-black/30',
    accent: '#000000',
    text: '#222222',
    category: 'minimal',
    tags: ['Clean', 'Light'],
  },
]

export interface ShowcaseWidgetRaw {
  id: string
  nameKey: string
  nameEn: string
  namePt: string
  snippet: string
  descKey: string
  descEn: string
  descPt: string
}

export const SHOWCASE_WIDGETS: readonly ShowcaseWidgetRaw[] = [
  {
    id: 'stats',
    nameKey: 'widget.name.stats',
    nameEn: 'Live Stats Card',
    namePt: 'Cartão de Estatísticas',
    snippet: '![Stats](${APP_URL}/api/YOUR_USERNAME)',
    descKey: 'widget.desc.stats',
    descEn: 'Calculates total commits, stars, PRs, issues and repos dynamically.',
    descPt: 'Calcula commits, estrelas, PRs, issues e repositórios em tempo real.',
  },
  {
    id: 'streak',
    nameKey: 'widget.name.streak',
    nameEn: 'Contribution Streak',
    namePt: 'Racha de Contribuições',
    snippet: '![Streak](${APP_URL}/api/YOUR_USERNAME?widget=streak)',
    descKey: 'widget.desc.streak',
    descEn: 'Displays active daily contribution streak and longest record.',
    descPt: 'Exibe sua racha de contribuição diária atual e recorde histórico.',
  },
  {
    id: 'languages',
    nameKey: 'widget.name.languages',
    nameEn: 'Top Languages',
    namePt: 'Principais Linguagens',
    snippet: '![Languages](${APP_URL}/api/YOUR_USERNAME?widget=languages)',
    descKey: 'widget.desc.languages',
    descEn: 'Visual breakdown of programming languages used across public repositories.',
    descPt: 'Detalhamento visual das linguagens mais usadas em repositórios públicos.',
  },
  {
    id: 'stack',
    nameKey: 'widget.name.stack',
    nameEn: 'Tech Stack Badges',
    namePt: 'Badges de Habilidades',
    snippet: '![Stack](${APP_URL}/api/YOUR_USERNAME?widget=stack)',
    descKey: 'widget.desc.stack',
    descEn: 'Displays customized tech stack skill badges dynamically.',
    descPt: 'Exibe badges personalizados de suas habilidades e tecnologias.',
  },
]

export interface FeaturedProfileItem {
  id: string
  username: string
  name: string
  role: string
  template: string
  widgets: number
  avatar: string
  tags: string[]
}

export const FEATURED_PROFILES: readonly FeaturedProfileItem[] = [
  {
    id: 'igorcbraz',
    username: 'Igorcbraz',
    name: 'Igor Braz',
    role: 'Creator / Developer',
    template: 'terminal',
    widgets: 4,
    avatar: 'https://github.com/Igorcbraz.png?size=150',
    tags: ['Terminal CLI', 'Verified Creator'],
  },
  {
    id: 'schunckleonardo',
    username: 'schunckleonardo',
    name: 'Leonardo Schunck',
    role: 'Contributor / Engineer',
    template: 'dracula',
    widgets: 3,
    avatar: 'https://github.com/schunckleonardo.png?size=150',
    tags: ['Dracula Theme', 'Core Contributor'],
  },
]

export interface FeaturedGuideRaw {
  id: string
  title: string
  publisher: string
  url: string
  readTime: string
  summaryKey: string
  summaryEn: string
  summaryPt: string
}

export const FEATURED_GUIDES: readonly FeaturedGuideRaw[] = [
  {
    id: 'github',
    title: 'Managing Your Profile README (Official GitHub)',
    publisher: 'GITHUB DOCS',
    url: 'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme',
    readTime: '4 min read',
    summaryKey: 'guide.desc.github',
    summaryEn:
      'Official instructions on initializing your special repository (username/username) and publishing your developer README.',
    summaryPt:
      'Instruções oficiais sobre como inicializar seu repositório especial (username/username) e publicar seu README.',
  },
  {
    id: 'themes',
    title: 'Dark & Light Mode Switching in GitHub Markdown',
    publisher: 'GITHUB MARKUP',
    url: 'https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax',
    readTime: '5 min read',
    summaryKey: 'guide.desc.themes',
    summaryEn:
      'Learn to use HTML <picture> and media queries (prefers-color-scheme) to render adaptive SVGs.',
    summaryPt:
      'Aprenda a usar a tag HTML <picture> e media queries para renderizar SVGs adaptativos.',
  },
  {
    id: 'badges',
    title: 'Mastering Shields.io Badges & Custom SVG Layouts',
    publisher: 'SHIELDS.IO',
    url: 'https://shields.io',
    readTime: '6 min read',
    summaryKey: 'guide.desc.badges',
    summaryEn:
      'Guide to embedding custom technology badges, social media links and custom stats parameters.',
    summaryPt:
      'Guia para incorporar badges de tecnologia customizados, redes sociais e parâmetros de estatísticas.',
  },
]

export interface FeatureGridItemRaw {
  titleKey: string
  titleDef: string
  icon: LucideIcon
  descKey: string
  descDef: string
}

export const FEATURES_GRID_LIST: readonly FeatureGridItemRaw[] = [
  {
    titleKey: 'landing.features.visual_editor.title',
    titleDef: 'Visual Editor',
    icon: Paintbrush,
    descKey: 'landing.features.visual_editor.desc',
    descDef: 'Drag-and-drop editor inspired by Canva and Figma. See every change in real-time.',
  },
  {
    titleKey: 'landing.features.ascii_art.title',
    titleDef: 'ASCII Art Engine',
    icon: Terminal,
    descKey: 'landing.features.ascii_art.desc',
    descDef:
      'Convert any image to stunning ASCII art with 6+ character sets, adjustable density and color.',
  },
  {
    titleKey: 'landing.features.templates.title',
    titleDef: 'Premium Templates',
    icon: Layout,
    descKey: 'landing.features.templates.desc',
    descDef:
      '13+ handcrafted templates. From Terminal to Cyberpunk. One-click apply, fully customizable.',
  },
  {
    titleKey: 'landing.features.live_rendering.title',
    titleDef: 'Live Rendering',
    icon: Zap,
    descKey: 'landing.features.live_rendering.desc',
    descDef: 'Your SVG is served via URL — always up to date. No manual uploads, no stale data.',
  },
  {
    titleKey: 'landing.features.adaptive_themes.title',
    titleDef: 'Adaptive Themes',
    icon: Sparkles,
    descKey: 'landing.features.adaptive_themes.desc',
    descDef:
      'Automatically switch between dark and light themes using embedded SVG media queries and prefers-color-scheme.',
  },
  {
    titleKey: 'landing.features.edge_native.title',
    titleDef: 'Edge Native Caching',
    icon: Cpu,
    descKey: 'landing.features.edge_native.desc',
    descDef:
      'Served from global Serverless Edge functions with 4-hour caching to ensure fast loading on GitHub Camo.',
  },
]

export interface FaqItemRaw {
  question: string
  answer: string
}

export const LANDING_FAQS: readonly FaqItemRaw[] = [
  {
    question: 'What is GitAscii?',
    answer:
      'GitAscii is a platform for creating premium GitHub Profile READMEs using customizable SVGs and a visual editor. Think of it as Canva for your GitHub profile.',
  },
  {
    question: 'Is GitAscii free?',
    answer:
      'Yes! GitAscii is completely free and open source. We believe every developer deserves a beautiful profile.',
  },
  {
    question: 'How does the live SVG rendering work?',
    answer:
      'Instead of uploading SVG files to GitHub, you embed a URL that points to our servers. We generate your SVG on-the-fly with your latest GitHub data, so your profile is always up to date.',
  },
  {
    question: 'What is ASCII Art conversion?',
    answer:
      'Our ASCII Art Engine converts any image (like your GitHub avatar) into stunning character-based art using configurable character sets, density, and color options.',
  },
  {
    question: 'Can I have multiple profile layouts?',
    answer:
      'Absolutely! Each user can create multiple named profiles (e.g., Portfolio, Terminal, Resume) with different templates and configurations.',
  },
  {
    question: 'Does it support dark and light mode?',
    answer:
      "Yes. GitAscii generates separate SVGs for dark and light themes. Using the HTML picture element, GitHub automatically shows the right version based on the viewer's preference.",
  },
  {
    question: 'What is Generate Best Profile?',
    answer:
      'Our smart generation feature analyzes your GitHub data (repos, languages, contributions, bio) and automatically creates an optimized profile layout tailored to your activity.',
  },
  {
    question: 'Can I customize everything?',
    answer:
      'Yes. While templates give you a great starting point, every single widget property (colors, fonts, sizes, positions) can be customized in the visual editor.',
  },
  {
    question: 'What is GitAscii Pro and how does the lifetime access work?',
    answer:
      'GitAscii Pro unlocks privacy-friendly real-time telemetry (unique visitors, countries, referrers), 24/7 widget error alerts via email, up to 10 dynamic profiles, instant GitHub Camo cache purging, priority sub-10ms Edge CDN, and lifetime updates. You pay once and own it forever with zero monthly or renewal fees.',
  },
  {
    question: 'How does payment and instant activation work?',
    answer:
      'Payments are processed securely via Stripe/Polar with 256-bit encryption. As soon as checkout completes, your GitHub account is instantly upgraded to Pro lifetime access.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), along with digital wallets like Apple Pay and Google Pay.',
  },
  {
    question: 'How does the 14-day refund guarantee work?',
    answer:
      'We offer an unconditional 14-day 100% money-back guarantee. If GitAscii Pro is not the right fit for you, we refund your payment with no questions asked.',
  },
]

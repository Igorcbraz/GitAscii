import {
  Activity,
  Award,
  BarChart3,
  Code2,
  Cpu,
  Eye,
  FileText,
  Flame,
  FolderGit2,
  Globe,
  Grid,
  Heading,
  LayoutTemplate,
  Minus,
  PieChart,
  Quote,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  TerminalSquare,
  TrendingUp,
  Trophy,
  Type,
  User,
} from 'lucide-react'
import React from 'react'

export type WidgetBadgeType =
  'popular' | 'essential' | 'highlight' | 'interactive' | 'trending' | 'new'

export interface WidgetBadge {
  text: string
  type: WidgetBadgeType
}

export type WidgetCategory =
  'essential' | 'interactive' | 'stats' | 'external' | 'misc' | 'godprofile'

export interface WidgetCatalogItem {
  id: string
  name: string
  desc: string
  icon: React.ElementType
  isExternal?: boolean
  badge?: WidgetBadge
  category?: WidgetCategory
  defaultSize?: { width: number; height: number }
}

export interface WidgetFilterItem {
  id: string
  labelKey: string // Translation key
  defaultLabel: string
  icon: React.ElementType
  match: (item: WidgetCatalogItem) => boolean
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  {
    id: 'header',
    name: 'Header',
    icon: Heading,
    desc: 'Name, handle & company badge',
    category: 'essential',
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: 'ascii-text',
    name: 'ASCII Text',
    icon: Type,
    desc: 'Custom text rendered in ASCII art font',
    category: 'interactive',
    badge: { text: 'Novo', type: 'highlight' },
  },
  {
    id: 'ascii-art',
    name: 'ASCII Art',
    icon: Terminal,
    desc: 'Image converted to character art',
    category: 'interactive',
    badge: { text: 'Destaque', type: 'highlight' },
  },
  {
    id: 'terminal-info',
    name: 'Terminal Info',
    icon: TerminalSquare,
    desc: 'Neofetch-style terminal info card',
    category: 'essential',
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: 'avatar',
    name: 'Avatar',
    icon: User,
    desc: 'Profile picture frame',
    category: 'essential',
    badge: { text: 'Essencial', type: 'essential' },
  },
  {
    id: 'tech-stack',
    name: 'Tech Stack',
    icon: Cpu,
    desc: 'Interactive skill icons gallery',
    category: 'interactive',
    badge: { text: 'Interativo', type: 'interactive' },
  },
  {
    id: 'bio',
    name: 'Bio & Links',
    icon: FileText,
    desc: 'Biography, location & blog link',
    category: 'essential',
  },
  {
    id: 'custom-image',
    name: 'Image',
    icon: FileText,
    desc: 'Custom image or banner',
    category: 'misc',
  },
  {
    id: 'stats',
    name: 'GitHub Stats',
    icon: BarChart3,
    desc: 'Stars, repos, followers metrics',
    category: 'stats',
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: 'languages',
    name: 'Top Languages',
    icon: Code2,
    desc: 'Language breakdown bar',
    category: 'stats',
  },
  {
    id: 'repositories',
    name: 'Featured Repos',
    icon: FolderGit2,
    desc: 'Highlighted repository cards',
    category: 'stats',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    icon: Share2,
    desc: 'Shields & social media badges',
    category: 'misc',
  },

  {
    id: 'github-readme-stats',
    name: 'GitHub Readme Stats',
    icon: BarChart3,
    desc: 'Estatísticas, top linguagens & repos fixados',
    isExternal: true,
    category: 'external',
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: 'streak-stats',
    name: 'GitHub Streak Stats',
    icon: Flame,
    desc: 'Sequência e recorde de contribuições',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'profile-trophy',
    name: 'GitHub Profile Trophy',
    icon: Trophy,
    desc: 'Troféus e conquistas do perfil',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'activity-graph',
    name: 'Activity Graph',
    icon: Activity,
    desc: 'Gráfico de linhas de atividade em 31 dias',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'contribution-snake',
    name: 'Contribution Snake',
    icon: TrendingUp,
    desc: 'Cobra animada comendo os blocos de commit',
    isExternal: true,
    category: 'external',
    badge: { text: 'Trending', type: 'trending' },
  },
  {
    id: 'metrics-card',
    name: 'Metrics Card',
    icon: PieChart,
    desc: 'Infográfico avançado de métricas e hábitos',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'views-counter',
    name: 'Profile Views Counter',
    icon: Eye,
    desc: 'Contador de visitas ao perfil GitHub',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'readme-quotes',
    name: 'GitHub Readme Quotes',
    icon: Quote,
    desc: 'Citação diária para desenvolvedores',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'awesome-badge',
    name: 'Awesome Profile Badge',
    icon: Award,
    desc: 'Badge de destaque para perfis incríveis',
    isExternal: true,
    category: 'external',
  },
  {
    id: 'gitfest-lineup',
    name: 'GitFest',
    icon: Sparkles,
    desc: 'Festival lineup of your repos',
    isExternal: true,
    category: 'external',
    badge: { text: 'New', type: 'highlight' },
  },

  {
    id: 'ghstats',
    name: 'GHStats.dev',
    icon: BarChart3,
    desc: 'GitHub Stats Cards from ghstats.dev',
    isExternal: true,
    category: 'external',
    badge: { text: 'New', type: 'highlight' },
  },
  {
    id: 'divider',
    name: 'Neon Divider',
    icon: Minus,
    desc: 'Section separator line',
    category: 'misc',
  },
  {
    id: 'footer',
    name: 'Footer Stamp',
    icon: LayoutTemplate,
    desc: 'Signature metadata footer',
    category: 'misc',
  },
  {
    id: 'godprofile-terminal',
    name: 'Terminal Emulator',
    icon: TerminalSquare,
    desc: 'Animated typewriter terminal SVG',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 450, height: 300 },
  },
  {
    id: 'godprofile-marquee',
    name: 'Icon Marquee',
    icon: Sparkles,
    desc: 'Infinite CSS-scrolling tech badges',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 800, height: 120 },
  },
  {
    id: 'godprofile-neural',
    name: 'Neural Network Map',
    icon: Activity,
    desc: 'Animated tech stack visualization',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 800, height: 320 },
  },
  {
    id: 'godprofile-trophies',
    name: 'GitHub Trophies',
    icon: Trophy,
    desc: 'Trophy case with S/A/B/C tiers',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 800, height: 280 },
  },
  {
    id: 'godprofile-wakatime',
    name: 'WakaTime Activity',
    icon: BarChart3,
    desc: 'Coding stats horizontal bar chart',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 420, height: 260 },
  },

  {
    id: 'godprofile-globe',
    name: '3D Contribution Globe',
    icon: Globe,
    desc: 'Isometric 3D globe SVG',
    category: 'godprofile',
    isExternal: true,
    defaultSize: { width: 320, height: 350 },
  },
]

export const WIDGET_FILTERS: WidgetFilterItem[] = [
  {
    id: 'all',
    labelKey: 'editor.sidebar.filter.all',
    defaultLabel: 'Todos',
    icon: Grid,
    match: () => true,
  },
  {
    id: 'popular',
    labelKey: 'editor.sidebar.filter.popular',
    defaultLabel: 'Destaques',
    icon: Flame,
    match: (item) =>
      item.badge?.type === 'popular' ||
      item.badge?.type === 'highlight' ||
      item.badge?.type === 'trending',
  },
  {
    id: 'essential',
    labelKey: 'editor.sidebar.filter.essential',
    defaultLabel: 'Essenciais',
    icon: ShieldCheck,
    match: (item) => item.category === 'essential' || item.badge?.type === 'essential',
  },
  {
    id: 'external',
    labelKey: 'editor.sidebar.filter.external',
    defaultLabel: 'Externos',
    icon: Globe,
    match: (item) => !!item.isExternal && item.category !== 'godprofile',
  },
  {
    id: 'godprofile',
    labelKey: 'editor.sidebar.filter.godprofile',
    defaultLabel: 'GodProfile',
    icon: Sparkles,
    match: (item) => item.category === 'godprofile',
  },
]

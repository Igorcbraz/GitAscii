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

import { WIDGET_CATEGORIES, WIDGET_IDS, WidgetCategory, WidgetId } from '@/constants'

export type WidgetBadgeType =
  'popular' | 'essential' | 'highlight' | 'interactive' | 'trending' | 'new'

export interface WidgetBadge {
  text: string
  type: WidgetBadgeType
}

export interface WidgetCatalogItem {
  id: WidgetId
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
    id: WIDGET_IDS.HEADER,
    name: 'Header',
    icon: Heading,
    desc: 'Name, handle & company badge',
    category: WIDGET_CATEGORIES.ESSENTIAL,
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: WIDGET_IDS.ASCII_TEXT,
    name: 'ASCII Text',
    icon: Type,
    desc: 'Custom text rendered in ASCII art font',
    category: WIDGET_CATEGORIES.INTERACTIVE,
    badge: { text: 'Novo', type: 'highlight' },
  },
  {
    id: WIDGET_IDS.ASCII_ART,
    name: 'ASCII Art',
    icon: Terminal,
    desc: 'Image converted to character art',
    category: WIDGET_CATEGORIES.INTERACTIVE,
    badge: { text: 'Destaque', type: 'highlight' },
  },
  {
    id: WIDGET_IDS.TERMINAL_INFO,
    name: 'Terminal Info',
    icon: TerminalSquare,
    desc: 'Neofetch-style terminal info card',
    category: WIDGET_CATEGORIES.ESSENTIAL,
    badge: { text: 'Mais Usado', type: 'popular' },
  },
  {
    id: WIDGET_IDS.AVATAR,
    name: 'Avatar',
    icon: User,
    desc: 'Profile picture frame',
    category: WIDGET_CATEGORIES.ESSENTIAL,
    badge: { text: 'Essencial', type: 'essential' },
  },
  {
    id: WIDGET_IDS.TECH_STACK,
    name: 'Tech Stack',
    icon: Cpu,
    desc: 'Interactive skill icons gallery',
    category: WIDGET_CATEGORIES.INTERACTIVE,
    badge: { text: 'Interativo', type: 'interactive' },
  },
  {
    id: WIDGET_IDS.BIO,
    name: 'Bio & Links',
    icon: FileText,
    desc: 'Biography, location & blog link',
    category: WIDGET_CATEGORIES.ESSENTIAL,
  },
  {
    id: WIDGET_IDS.CUSTOM_IMAGE,
    name: 'Image',
    icon: FileText,
    desc: 'Custom image or banner',
    category: WIDGET_CATEGORIES.MISC,
  },
  {
    id: WIDGET_IDS.STATS,
    name: 'GitHub Stats',
    icon: BarChart3,
    desc: 'Stars, repos, followers metrics',
    category: WIDGET_CATEGORIES.STATS,
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: WIDGET_IDS.LANGUAGES,
    name: 'Top Languages',
    icon: Code2,
    desc: 'Language breakdown bar',
    category: WIDGET_CATEGORIES.STATS,
  },
  {
    id: WIDGET_IDS.REPOSITORIES,
    name: 'Featured Repos',
    icon: FolderGit2,
    desc: 'Highlighted repository cards',
    category: WIDGET_CATEGORIES.STATS,
  },
  {
    id: WIDGET_IDS.SOCIAL_MEDIA,
    name: 'Social Media',
    icon: Share2,
    desc: 'Shields & social media badges',
    category: WIDGET_CATEGORIES.MISC,
  },

  {
    id: WIDGET_IDS.GITHUB_README_STATS,
    name: 'GitHub Readme Stats',
    icon: BarChart3,
    desc: 'Estatísticas, top linguagens & repos fixados',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
    badge: { text: 'Popular', type: 'popular' },
  },
  {
    id: WIDGET_IDS.STREAK_STATS,
    name: 'GitHub Streak Stats',
    icon: Flame,
    desc: 'Sequência e recorde de contribuições',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.PROFILE_TROPHY,
    name: 'GitHub Profile Trophy',
    icon: Trophy,
    desc: 'Troféus e conquistas do perfil',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.ACTIVITY_GRAPH,
    name: 'Activity Graph',
    icon: Activity,
    desc: 'Gráfico de linhas de atividade em 31 dias',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.CONTRIBUTION_SNAKE,
    name: 'Contribution Snake',
    icon: TrendingUp,
    desc: 'Cobra animada comendo os blocos de commit',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
    badge: { text: 'Trending', type: 'trending' },
  },
  {
    id: WIDGET_IDS.METRICS_CARD,
    name: 'Metrics Card',
    icon: PieChart,
    desc: 'Infográfico avançado de métricas e hábitos',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.VIEWS_COUNTER,
    name: 'Profile Views Counter',
    icon: Eye,
    desc: 'Contador de visitas ao perfil GitHub',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.README_QUOTES,
    name: 'GitHub Readme Quotes',
    icon: Quote,
    desc: 'Citação diária para desenvolvedores',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.AWESOME_BADGE,
    name: 'Awesome Profile Badge',
    icon: Award,
    desc: 'Badge de destaque para perfis incríveis',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
  },
  {
    id: WIDGET_IDS.GITFEST_LINEUP,
    name: 'GitFest',
    icon: Sparkles,
    desc: 'Festival lineup of your repos',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
    badge: { text: 'New', type: 'highlight' },
  },

  {
    id: WIDGET_IDS.GHSTATS,
    name: 'GHStats.dev',
    icon: BarChart3,
    desc: 'GitHub Stats Cards from ghstats.dev',
    isExternal: true,
    category: WIDGET_CATEGORIES.EXTERNAL,
    badge: { text: 'New', type: 'highlight' },
  },
  {
    id: WIDGET_IDS.DIVIDER,
    name: 'Neon Divider',
    icon: Minus,
    desc: 'Section separator line',
    category: WIDGET_CATEGORIES.MISC,
  },
  {
    id: WIDGET_IDS.FOOTER,
    name: 'Footer Stamp',
    icon: LayoutTemplate,
    desc: 'Signature metadata footer',
    category: WIDGET_CATEGORIES.MISC,
  },
  {
    id: WIDGET_IDS.GODPROFILE_TERMINAL,
    name: 'Terminal Emulator',
    icon: TerminalSquare,
    desc: 'Animated typewriter terminal SVG',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 450, height: 300 },
  },
  {
    id: WIDGET_IDS.GODPROFILE_MARQUEE,
    name: 'Icon Marquee',
    icon: Sparkles,
    desc: 'Infinite CSS-scrolling tech badges',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 800, height: 120 },
  },
  {
    id: WIDGET_IDS.GODPROFILE_NEURAL,
    name: 'Neural Network Map',
    icon: Activity,
    desc: 'Animated tech stack visualization',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 800, height: 320 },
  },
  {
    id: WIDGET_IDS.GODPROFILE_TROPHIES,
    name: 'GitHub Trophies',
    icon: Trophy,
    desc: 'Trophy case with S/A/B/C tiers',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 800, height: 280 },
  },
  {
    id: WIDGET_IDS.GODPROFILE_WAKATIME,
    name: 'WakaTime Activity',
    icon: BarChart3,
    desc: 'Coding stats horizontal bar chart',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 420, height: 260 },
  },

  {
    id: WIDGET_IDS.GODPROFILE_GLOBE,
    name: '3D Contribution Globe',
    icon: Globe,
    desc: 'Isometric 3D globe SVG',
    category: WIDGET_CATEGORIES.GODPROFILE,
    isExternal: true,
    defaultSize: { width: 320, height: 350 },
  },
  {
    id: WIDGET_IDS.ASCII_PORTRAIT,
    name: 'ASCII Portrait',
    icon: Terminal,
    desc: 'Animated monochrome typing ASCII portrait',
    category: WIDGET_CATEGORIES.ASCIIPROFILE,
    isExternal: true,
    defaultSize: { width: 370, height: 400 },
  },
  {
    id: WIDGET_IDS.ASCII_INFO,
    name: 'ASCII Info Card',
    icon: FileText,
    desc: 'Neofetch-style ASCII profile info card',
    category: WIDGET_CATEGORIES.ASCIIPROFILE,
    isExternal: true,
    defaultSize: { width: 490, height: 400 },
  },
  {
    id: WIDGET_IDS.ASCII_HEATMAP,
    name: 'ASCII Heatmap',
    icon: Grid,
    desc: 'Animated contribution heatmap calendar',
    category: WIDGET_CATEGORIES.ASCIIPROFILE,
    isExternal: true,
    defaultSize: { width: 780, height: 240 },
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
    match: (item) =>
      item.category === WIDGET_CATEGORIES.ESSENTIAL || item.badge?.type === 'essential',
  },
  {
    id: 'external',
    labelKey: 'editor.sidebar.filter.external',
    defaultLabel: 'Externos',
    icon: Globe,
    match: (item) =>
      !!item.isExternal &&
      item.category !== WIDGET_CATEGORIES.GODPROFILE &&
      item.category !== WIDGET_CATEGORIES.ASCIIPROFILE,
  },
  {
    id: 'godprofile',
    labelKey: 'editor.sidebar.filter.godprofile',
    defaultLabel: 'GodProfile',
    icon: Sparkles,
    match: (item) => item.category === WIDGET_CATEGORIES.GODPROFILE,
  },
  {
    id: 'asciiprofile',
    labelKey: 'editor.sidebar.filter.asciiprofile',
    defaultLabel: 'ASCII Profile',
    icon: TerminalSquare,
    match: (item) => item.category === WIDGET_CATEGORIES.ASCIIPROFILE,
  },
]

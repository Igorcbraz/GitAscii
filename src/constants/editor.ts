import type { LucideIcon } from 'lucide-react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Check,
  Cloud,
  Crosshair,
  Download,
  FileCode2,
  FileJson,
  FlipHorizontal,
  FlipVertical,
  FolderGit2,
  GitFork,
  Github,
  Globe,
  Grid,
  Keyboard,
  Layers,
  LayoutGrid,
  Monitor,
  Move,
  Server,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { API_ENDPOINTS } from '@/services/endpoints'

export interface ExportGuideStepDef {
  icon: LucideIcon
  title: string
  titleKey: string
  description: string
  descriptionKey: string
  descriptionIcon: LucideIcon | null
  linkLabel: string | null
  linkLabelKey?: string | null
  getLinkUrl: (username: string) => string
}

export const EXPORT_GUIDE_STEPS: readonly ExportGuideStepDef[] = [
  {
    icon: Download,
    title: 'Baixe o Arquivo de Configuração',
    titleKey: 'editor.guide.export.step1_title',
    description:
      'O arquivo de configuração contém toda a estrutura de layout e widgets do seu perfil.',
    descriptionKey: 'editor.guide.export.step1_desc',
    descriptionIcon: FileJson,
    linkLabel: null,
    getLinkUrl: () => '',
  },
  {
    icon: Github,
    title: 'Upload no Repositório',
    titleKey: 'editor.guide.export.step2_title',
    description: 'Faça o upload do arquivo na raiz do seu repositório especial no GitHub.',
    descriptionKey: 'editor.guide.export.step2_desc',
    descriptionIcon: null,
    linkLabel: 'Fazer upload no GitHub',
    linkLabelKey: 'editor.guide.export.step2_link',
    getLinkUrl: (username: string) => API_ENDPOINTS.GITHUB.SPECIAL_REPO_UPLOAD(username),
  },
  {
    icon: Sparkles,
    title: 'Adicione ao seu README.md',
    titleKey: 'editor.guide.export.step3_title',
    description: 'Copie o código HTML formatado e cole no arquivo README.md do seu repositório.',
    descriptionKey: 'editor.guide.export.step3_desc',
    descriptionIcon: null,
    linkLabel: 'Editar README.md no GitHub',
    linkLabelKey: 'editor.guide.export.step3_link',
    getLinkUrl: (username: string) => API_ENDPOINTS.GITHUB.SPECIAL_REPO_EDIT_README(username),
  },
]

export const USER_SPECIFIC_FIELDS: readonly string[] = [
  'avatarUrl',
  'uploadedImageData',
  'customBio',
  'customLocation',
  'customBlog',
  'customBullet1',
  'customBullet2',
  'customNow',
  'customAlso',
  'customLoc',
  'customSite',
  'customFrontend',
  'customBackend',
  'customLangs',
  'customWhoami',
  'asciiText',
]

export const COMMON_LANGUAGES: readonly string[] = [
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'CSS',
  'HTML',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Dart',
  'Shell',
  'Dockerfile',
  'MDX',
  'Vue',
  'Svelte',
]

export interface FontOption {
  value: string
  label: string
  category: 'sans-serif' | 'monospace' | 'serif'
}

export const GLOBAL_FONT_OPTIONS: readonly FontOption[] = [
  { value: 'Inter Tight', label: 'Inter Tight (Sans-serif)', category: 'sans-serif' },
  { value: 'Inter', label: 'Inter (Sans-serif)', category: 'sans-serif' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Sans-serif)', category: 'sans-serif' },
  { value: 'DM Sans', label: 'DM Sans (Sans-serif)', category: 'sans-serif' },
  { value: 'Outfit', label: 'Outfit (Sans-serif)', category: 'sans-serif' },
  { value: 'Poppins', label: 'Poppins (Sans-serif)', category: 'sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Sans-serif)', category: 'sans-serif' },
  { value: 'Roboto', label: 'Roboto (Sans-serif)', category: 'sans-serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)', category: 'monospace' },
  { value: 'Fira Code', label: 'Fira Code (Monospace)', category: 'monospace' },
  { value: 'PT Serif', label: 'PT Serif (Serif)', category: 'serif' },
]

export type GridMode = 'off' | 'basic' | 'axes' | 'thirds' | 'dense'

export interface GridModeOptionDef {
  id: Exclude<GridMode, 'off'>
  labelKey: string
  defaultLabel: string
  descKey: string
  defaultDesc: string
  icon: LucideIcon
}

export const GRID_MODE_OPTIONS: readonly GridModeOptionDef[] = [
  {
    id: 'basic',
    labelKey: 'editor.grid.mode_basic',
    defaultLabel: 'Básico (Blocos 100px)',
    descKey: 'editor.grid.mode_basic_desc',
    defaultDesc: 'Quadrados maiores para alinhamento geral',
    icon: LayoutGrid,
  },
  {
    id: 'axes',
    labelKey: 'editor.grid.mode_axes',
    defaultLabel: 'Apenas Eixo X e Y (Centro)',
    descKey: 'editor.grid.mode_axes_desc',
    defaultDesc: 'Linhas centrais vertical e horizontal',
    icon: Crosshair,
  },
  {
    id: 'thirds',
    labelKey: 'editor.grid.mode_thirds',
    defaultLabel: 'Regra dos Terços (3x3)',
    descKey: 'editor.grid.mode_thirds_desc',
    defaultDesc: 'Guias de proporção estilo câmera/fotografia',
    icon: Move,
  },
  {
    id: 'dense',
    labelKey: 'editor.grid.mode_dense',
    defaultLabel: 'Grade Fina (20px)',
    descKey: 'editor.grid.mode_dense_desc',
    defaultDesc: 'Grade detalhada para precisão milimétrica',
    icon: Grid,
  },
]

export type TextAlignMode = 'left' | 'center' | 'right' | 'justify'

export interface TextAlignOptionDef {
  id: TextAlignMode
  icon: LucideIcon
  labelKey: string
  defaultLabel: string
}

export const TEXT_ALIGN_OPTIONS: readonly TextAlignOptionDef[] = [
  {
    id: 'left',
    icon: AlignLeft,
    labelKey: 'editor.properties.align_left',
    defaultLabel: 'Esquerda',
  },
  {
    id: 'center',
    icon: AlignCenter,
    labelKey: 'editor.properties.align_center',
    defaultLabel: 'Centro',
  },
  {
    id: 'right',
    icon: AlignRight,
    labelKey: 'editor.properties.align_right',
    defaultLabel: 'Direita',
  },
  {
    id: 'justify',
    icon: AlignJustify,
    labelKey: 'editor.properties.align_justify',
    defaultLabel: 'Justificado',
  },
]

export interface TechStackPreset {
  label: string
  icon: LucideIcon
  items: readonly string[]
}

export const TECH_STACK_PRESETS: readonly TechStackPreset[] = [
  {
    label: 'Frontend',
    icon: Globe,
    items: ['html', 'css', 'js', 'ts', 'react', 'nextjs', 'tailwind', 'vite'],
  },
  {
    label: 'Backend',
    icon: Server,
    items: ['nodejs', 'ts', 'express', 'postgres', 'mongodb', 'docker', 'redis'],
  },
  {
    label: 'Full Stack',
    icon: Layers,
    items: ['js', 'ts', 'react', 'nextjs', 'nodejs', 'tailwind', 'postgres', 'docker', 'git'],
  },
  {
    label: 'DevOps & Cloud',
    icon: Cloud,
    items: ['linux', 'docker', 'kubernetes', 'aws', 'git', 'github', 'bash', 'python'],
  },
]

export interface SocialPlatform {
  id: string
  label: string
  logo: string
  color: string
  defaultUrl: string
}

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  {
    id: 'github',
    label: 'GitHub',
    logo: 'github',
    color: '181717',
    defaultUrl: 'https://github.com/{username}',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    logo: 'linkedin',
    color: '0A66C2',
    defaultUrl: 'https://linkedin.com/in/{username}',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    logo: 'x',
    color: '000000',
    defaultUrl: 'https://x.com/{username}',
  },
  {
    id: 'discord',
    label: 'Discord',
    logo: 'discord',
    color: '5865F2',
    defaultUrl: 'https://discord.gg/yourserver',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    logo: 'youtube',
    color: 'FF0000',
    defaultUrl: 'https://youtube.com/@{username}',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    logo: 'instagram',
    color: 'E4405F',
    defaultUrl: 'https://instagram.com/{username}',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    logo: 'twitch',
    color: '9146FF',
    defaultUrl: 'https://twitch.tv/{username}',
  },
  {
    id: 'devto',
    label: 'Dev.to',
    logo: 'devto',
    color: '0A0A0A',
    defaultUrl: 'https://dev.to/{username}',
  },
  {
    id: 'medium',
    label: 'Medium',
    logo: 'medium',
    color: '000000',
    defaultUrl: 'https://medium.com/@{username}',
  },
  {
    id: 'email',
    label: 'Email',
    logo: 'gmail',
    color: 'EA4335',
    defaultUrl: 'mailto:user@example.com',
  },
  {
    id: 'website',
    label: 'Portfolio',
    logo: 'googlechrome',
    color: '2563EB',
    defaultUrl: 'https://{username}.dev',
  },
  {
    id: 'stackoverflow',
    label: 'StackOverflow',
    logo: 'stackoverflow',
    color: 'F48024',
    defaultUrl: 'https://stackoverflow.com/users/{username}',
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    logo: 'bluesky',
    color: '1185FE',
    defaultUrl: 'https://bsky.app/profile/{username}',
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    logo: 'mastodon',
    color: '6364FF',
    defaultUrl: 'https://mastodon.social/@{username}',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    logo: 'reddit',
    color: 'FF4500',
    defaultUrl: 'https://reddit.com/user/{username}',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    logo: 'spotify',
    color: '1DB954',
    defaultUrl: 'https://open.spotify.com/user/{username}',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    logo: 'telegram',
    color: '26A5E4',
    defaultUrl: 'https://t.me/{username}',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    logo: 'tiktok',
    color: '000000',
    defaultUrl: 'https://tiktok.com/@{username}',
  },
  {
    id: 'steam',
    label: 'Steam',
    logo: 'steam',
    color: '000000',
    defaultUrl: 'https://steamcommunity.com/id/{username}',
  },
  {
    id: 'hashnode',
    label: 'Hashnode',
    logo: 'hashnode',
    color: '2962FF',
    defaultUrl: 'https://hashnode.com/@{username}',
  },
]

export interface BadgeStyleDef {
  id: string
  name: string
  preview: string
  infoKey: string
  defaultInfo: string
}

export const BADGE_STYLES: readonly BadgeStyleDef[] = [
  {
    id: 'for-the-badge',
    name: 'SHIELDS BOLD',
    preview: 'for-the-badge',
    infoKey: 'editor.social.bold_info',
    defaultInfo: 'Caixa alta preenchida',
  },
  {
    id: 'flat-square',
    name: 'SHIELDS FLAT',
    preview: 'flat-square',
    infoKey: 'editor.social.flat_info',
    defaultInfo: 'Badge retangular clean',
  },
  {
    id: 'social',
    name: 'SHIELDS SOCIAL',
    preview: 'social',
    infoKey: 'editor.social.social_info',
    defaultInfo: 'Estilo contador social',
  },
  {
    id: 'skillicons',
    name: 'SKILL ICONS',
    preview: 'skillicons',
    infoKey: 'editor.social.skill_info',
    defaultInfo: 'Ícones circulares minimalistas',
  },
]

export interface GithubStatsMetricDef {
  id: string
  label: string
  icon: LucideIcon
}

export const GITHUB_STATS_METRICS: readonly GithubStatsMetricDef[] = [
  { id: 'stars', label: 'Stars', icon: Star },
  { id: 'repos', label: 'Repos', icon: FolderGit2 },
  { id: 'followers', label: 'Followers', icon: Users },
  { id: 'following', label: 'Following', icon: UserCheck },
  { id: 'forks', label: 'Total Forks', icon: GitFork },
  { id: 'gists', label: 'Public Gists', icon: FileCode2 },
]

export interface GithubStatsStyleDef {
  value: string
  label: string
  preview: string
}

export const GITHUB_STATS_STYLES: readonly GithubStatsStyleDef[] = [
  { value: 'default', label: 'Números grandes', preview: '42\nSTARS' },
  { value: 'terminal', label: 'Terminal', preview: '[ 42 ]\nSTARS' },
  { value: 'minimal', label: 'Minimalista', preview: '42' },
  { value: 'cards', label: 'Cartões', preview: '┌──────┐\n│  42  │\n└──────┘' },
]

export interface SuggestedGifItem {
  name: string
  url: string
}

export const SUGGESTED_GIFS: readonly SuggestedGifItem[] = [
  {
    name: 'Designer',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Designer.gif',
  },
  {
    name: 'Developer',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Developer.gif',
  },
  {
    name: 'Earth',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Earth.gif',
  },
  {
    name: 'Handshake',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Handshake.gif',
  },
  {
    name: 'Hi',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Hi.gif',
  },
  {
    name: 'Mario Gameplay',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Mario_Gameplay.gif',
  },
  {
    name: 'Mario Hello',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Mario_Hello_Big.gif',
  },
  {
    name: 'Medal',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Medal.gif',
  },
  {
    name: 'PC',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/PC.gif',
  },
  {
    name: 'Point Down',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Point_Down.gif',
  },
  {
    name: 'Rocket',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Rocket.gif',
  },
  {
    name: 'Super Mario',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/Super_Mario.gif',
  },
  {
    name: 'Coin',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/coin.gif',
  },
  {
    name: 'Dino',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/dino.gif',
  },
  {
    name: 'Gandalf',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/gandalf_parrot.gif',
  },
  {
    name: 'Happy',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/happy.gif',
  },
  {
    name: 'Headbang',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/headbang.gif',
  },
  {
    name: 'Hmm',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/hmm.gif',
  },
  {
    name: 'Powerup',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/powerup.gif',
  },
  {
    name: 'Wave',
    url: 'https://raw.githubusercontent.com/TheDudeThatCode/TheDudeThatCode/master/Assets/wave.gif',
  },
]

export interface AsciiCharsetOption {
  id: string
  name: string
  preview: string
  info: string
}

export const ASCII_TEXT_CHARSET_OPTIONS: readonly AsciiCharsetOption[] = [
  { id: 'default', name: 'NATURAL / FONTE', preview: 'Native', info: 'Original do estilo' },
  { id: 'dense', name: 'DENSE GRADIENT', preview: '"$@B%8&WM#*oahk', info: '67 chars' },
  { id: 'standard', name: 'STANDARD', preview: ' .:-=+*#%@', info: '10 chars' },
  { id: 'blocks', name: 'BLOCKS / SHADING', preview: ' ░▒▓█', info: '5 chars' },
  { id: 'dots', name: 'BRAILLE / DOTS', preview: ' ⠁⠃⠇⡇⣇⣿', info: '7 chars' },
  { id: 'matrix', name: 'MATRIX / HEX', preview: ' 0123456789ABCDEF', info: '16 chars' },
  { id: 'ascii', name: 'CLASSIC ASCII', preview: " .',:;!|/>(){}", info: '13 chars' },
  { id: 'binary', name: 'BINARY', preview: ' 01010101', info: '2 chars' },
  { id: 'slash', name: 'SLASH PATTERN', preview: ' \\/|/\\/|', info: '3 chars' },
  { id: 'retro', name: 'RETRO ORBS', preview: ' .oO@Oop', info: '5 chars' },
  { id: 'minimal', name: 'MINIMAL', preview: ' .*#*.*#', info: '4 chars' },
  { id: 'custom', name: 'CUSTOMIZADO', preview: ' [ Digitar... ]', info: 'Personalizado' },
]

export const ASCII_ART_CHARSET_OPTIONS: readonly AsciiCharsetOption[] = [
  {
    id: 'dense',
    name: 'DENSE GRADIENT',
    preview: ' .\'`^\\",:;I',
    info: '70 chars - Máxima Precisão',
  },
  { id: 'standard', name: 'STANDARD', preview: ' .:-=+*#%@', info: '10 chars' },
  { id: 'blocks', name: 'BLOCKS / SHADING', preview: ' ░▒▓█', info: '5 chars' },
  { id: 'dots', name: 'BRAILLE / DOTS', preview: ' ⠁⠃⠇⡇⣇⣿', info: '7 chars' },
  { id: 'matrix', name: 'MATRIX / HEX', preview: ' 0123456789ABCDEF', info: '16 chars' },
  { id: 'ascii', name: 'CLASSIC ASCII', preview: " .',:;!|/>(){}", info: '13 chars' },
  { id: 'binary', name: 'BINARY', preview: ' 01010101', info: '2 chars' },
  { id: 'slash', name: 'SLASH PATTERN', preview: ' \\/|/\\/|', info: '3 chars' },
  { id: 'retro', name: 'RETRO ORBS', preview: ' .oO@Oop', info: '5 chars' },
  { id: 'minimal', name: 'MINIMAL', preview: ' .*#*.*#', info: '4 chars' },
  {
    id: 'braille',
    name: 'TRUE BRAILLE',
    preview: '⡿⣟⣯⣷',
    info: 'Alta Resolução 2x4',
  },
  { id: 'custom', name: 'CUSTOMIZADO', preview: ' [ Digitar... ]', info: 'Personalizado' },
]

export type AnimationType =
  | 'none'
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-x'
  | 'flip-y'
  | 'typewriter'
  | 'glitch'
  | 'scan-lines'

export type AnimationEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'spring'

export interface AnimationPresetDef {
  id: AnimationType
  label: string
  icon: LucideIcon
  description: string
}

export const ANIMATION_PRESETS: readonly AnimationPresetDef[] = [
  {
    id: 'none',
    label: 'Sem animação',
    icon: Ban,
    description: 'Widget aparece instantaneamente',
  },
  {
    id: 'fade-in',
    label: 'Fade In',
    icon: Sparkles,
    description: 'Aparece gradualmente com opacidade',
  },
  {
    id: 'slide-up',
    label: 'Slide Up',
    icon: ArrowUp,
    description: 'Desliza de baixo para cima',
  },
  {
    id: 'slide-down',
    label: 'Slide Down',
    icon: ArrowDown,
    description: 'Desliza de cima para baixo',
  },
  {
    id: 'slide-left',
    label: 'Slide Left',
    icon: ArrowLeft,
    description: 'Desliza da direita para esquerda',
  },
  {
    id: 'slide-right',
    label: 'Slide Right',
    icon: ArrowRight,
    description: 'Desliza da esquerda para direita',
  },
  {
    id: 'zoom-in',
    label: 'Zoom In',
    icon: ZoomIn,
    description: 'Expande de um ponto central',
  },
  {
    id: 'zoom-out',
    label: 'Zoom Out',
    icon: ZoomOut,
    description: 'Reduz desde tamanho maior',
  },
  {
    id: 'flip-x',
    label: 'Flip Horizontal',
    icon: FlipHorizontal,
    description: 'Gira no eixo horizontal',
  },
  {
    id: 'flip-y',
    label: 'Flip Vertical',
    icon: FlipVertical,
    description: 'Gira no eixo vertical',
  },
  {
    id: 'typewriter',
    label: 'Typing',
    icon: Keyboard,
    description: 'Digita caractere por caractere',
  },
  {
    id: 'glitch',
    label: 'Glitch',
    icon: Zap,
    description: 'Efeito de falha digital',
  },
  {
    id: 'scan-lines',
    label: 'Scan Lines',
    icon: Monitor,
    description: 'Varredura estilo terminal CRT',
  },
]

export interface AnimationEasingOption {
  id: AnimationEasing
  label: string
}

export const ANIMATION_EASING_OPTIONS: readonly AnimationEasingOption[] = [
  { id: 'ease', label: 'Ease' },
  { id: 'ease-in', label: 'Ease In' },
  { id: 'ease-out', label: 'Ease Out' },
  { id: 'ease-in-out', label: 'Ease In-Out' },
  { id: 'linear', label: 'Linear' },
  { id: 'spring', label: 'Spring' },
]

export interface AnimationDurationPreset {
  label: string
  value: number
}

export const ANIMATION_DURATION_PRESETS: readonly AnimationDurationPreset[] = [
  { label: '600ms', value: 600 },
  { label: '1s', value: 1000 },
  { label: '1.5s', value: 1500 },
  { label: '2s', value: 2000 },
  { label: '3s', value: 3000 },
]

export interface GuestBenefitItem {
  readonly id: string
  readonly icon: LucideIcon
  readonly badge: string
  readonly titleKey: string
  readonly defaultTitle: string
  readonly descKey: string
  readonly defaultDesc: string
}

export const GUEST_BENEFIT_ITEMS: readonly GuestBenefitItem[] = [
  {
    id: 'sync',
    icon: Zap,
    badge: '1-CLICK',
    titleKey: 'editor.guest_modal.feature1_title',
    defaultTitle: 'Sincronização Direta',
    descKey: 'editor.guest_modal.feature1_desc',
    defaultDesc:
      'O botão "Update README" salva e atualiza o seu repositório de perfil instantaneamente.',
  },
  {
    id: 'no-download',
    icon: Check,
    badge: 'AUTO',
    titleKey: 'editor.guest_modal.feature2_title',
    defaultTitle: 'Zero Arquivos para Baixar',
    descKey: 'editor.guest_modal.feature2_desc',
    defaultDesc: 'Dispensa baixar JSON, fazer upload no GitHub ou colar código manualmente.',
  },
  {
    id: 'live-preview',
    icon: Sparkles,
    badge: 'LIVE',
    titleKey: 'editor.guest_modal.feature3_title',
    defaultTitle: 'Preview Instantâneo e Dinâmico',
    descKey: 'editor.guest_modal.feature3_desc',
    defaultDesc: 'Seus widgets e SVGs funcionam com máxima qualidade e atualização em tempo real.',
  },
]

export interface SurveillanceColorTheme {
  name: string
  primary: string
  secondary: string
  led: string
}

export const SURVEILLANCE_COLOR_THEMES: readonly SurveillanceColorTheme[] = [
  {
    name: 'Cyan Oxide',
    primary: '#55ffff',
    secondary: '#c084fc',
    led: '#ff5555',
  },
  {
    name: 'Matrix Green',
    primary: '#00ff88',
    secondary: '#55ffff',
    led: '#00ff88',
  },
  {
    name: 'Cyber Crimson',
    primary: '#ff3366',
    secondary: '#ffff55',
    led: '#ff3366',
  },
  {
    name: 'Amber Terminal',
    primary: '#ffb454',
    secondary: '#ff5555',
    led: '#ffb454',
  },
  {
    name: 'Synthwave Violet',
    primary: '#c084fc',
    secondary: '#55ffff',
    led: '#ff55ff',
  },
  {
    name: 'Monochrome Ice',
    primary: '#e6fbfb',
    secondary: '#8a8a8a',
    led: '#ffffff',
  },
]

export interface WinXPColorTheme {
  name: string
  titleGradientStart: string
  titleGradientEnd: string
  titleColor: string
  windowBg: string
  border: string
  accent: string
}

export const WINXP_COLOR_THEMES: readonly WinXPColorTheme[] = [
  {
    name: 'Luna Blue (Default)',
    titleGradientStart: '#0058ee',
    titleGradientEnd: '#2989f5',
    titleColor: '#ffffff',
    windowBg: '#ece9d8',
    border: '#0054e3',
    accent: '#3c81f3',
  },
  {
    name: 'Homestead (Olive Green)',
    titleGradientStart: '#738849',
    titleGradientEnd: '#96b169',
    titleColor: '#ffffff',
    windowBg: '#ece9d8',
    border: '#6f8346',
    accent: '#839c55',
  },
  {
    name: 'Metallic (Silver)',
    titleGradientStart: '#787782',
    titleGradientEnd: '#b5b4be',
    titleColor: '#ffffff',
    windowBg: '#ece9d8',
    border: '#706f7b',
    accent: '#9a98a6',
  },
  {
    name: 'Royale (Energy Blue)',
    titleGradientStart: '#1d488c',
    titleGradientEnd: '#3a76d8',
    titleColor: '#ffffff',
    windowBg: '#ece9d8',
    border: '#1c4689',
    accent: '#2c67c5',
  },
  {
    name: 'Zune (Dark Slate)',
    titleGradientStart: '#202020',
    titleGradientEnd: '#383838',
    titleColor: '#ffffff',
    windowBg: '#2a2a2a',
    border: '#1c1c1c',
    accent: '#f35a22',
  },
]

export interface AsciiPremiumColorTheme {
  name: string
  primary: string
  secondary: string
  border: string
  background: string
}

export const ASCII_PREMIUM_COLOR_THEMES: readonly AsciiPremiumColorTheme[] = [
  {
    name: 'Matrix Green',
    primary: '#3fb950',
    secondary: '#39c5cf',
    border: '#30363d',
    background: 'transparent',
  },
  {
    name: 'Cyber Amber',
    primary: '#ffb454',
    secondary: '#ff5555',
    border: '#3e2815',
    background: 'transparent',
  },
  {
    name: 'Electric Cyan',
    primary: '#39c5cf',
    secondary: '#58a6ff',
    border: '#1f3448',
    background: 'transparent',
  },
  {
    name: 'Dracula Neon',
    primary: '#bd93f9',
    secondary: '#ff79c6',
    border: '#382a47',
    background: 'transparent',
  },
  {
    name: 'Solarized Teal',
    primary: '#2aa198',
    secondary: '#b58900',
    border: '#2b353b',
    background: 'transparent',
  },
  {
    name: 'Monochrome Silver',
    primary: '#e6edf3',
    secondary: '#8b949e',
    border: '#30363d',
    background: 'transparent',
  },
  {
    name: 'Crimson Alert',
    primary: '#ff5252',
    secondary: '#ffa726',
    border: '#3d1d1d',
    background: 'transparent',
  },
  {
    name: 'Synthwave Sunset',
    primary: '#ff71ce',
    secondary: '#01cdfe',
    border: '#3b1c45',
    background: 'transparent',
  },
  {
    name: 'Golden Horizon',
    primary: '#e3b341',
    secondary: '#f0883e',
    border: '#3b2c15',
    background: 'transparent',
  },
]

export interface GlobalColorTheme {
  name: string
  category: 'cyberpunk' | 'terminal' | 'dracula' | 'monochrome' | 'synthwave'
  accent: string
  background: string
  secondary: string
  text: string
  border: string
  headerColor?: string
  labelColor?: string
  dotColor?: string
  valueColor?: string
  statsValColor?: string
  dividerColor?: string
}

export const GLOBAL_COLOR_THEMES: readonly GlobalColorTheme[] = [
  {
    name: 'Signal Lime (Default)',
    category: 'terminal',
    accent: '#c5ff4a',
    background: '#0d1117',
    secondary: '#55ffff',
    text: '#f0f6fc',
    border: '#30363d',
    headerColor: '#c5ff4a',
    labelColor: '#ffa657',
    dotColor: '#484f58',
    valueColor: '#f0f6fc',
    statsValColor: '#79c0ff',
    dividerColor: '#30363d',
  },
  {
    name: 'Matrix Terminal',
    category: 'terminal',
    accent: '#00ff88',
    background: '#0a0f0d',
    secondary: '#55ffff',
    text: '#c9d1d9',
    border: '#1a2e22',
    headerColor: '#00ff88',
    labelColor: '#55ffff',
    dotColor: '#2e4c38',
    valueColor: '#e6edf3',
    statsValColor: '#00ff88',
    dividerColor: '#1a2e22',
  },
  {
    name: 'Amber CRT',
    category: 'terminal',
    accent: '#ffb454',
    background: '#0f0c08',
    secondary: '#ff5555',
    text: '#ffd580',
    border: '#332211',
    headerColor: '#ffb454',
    labelColor: '#ff9933',
    dotColor: '#553311',
    valueColor: '#ffe6b3',
    statsValColor: '#ffb454',
    dividerColor: '#332211',
  },
  {
    name: 'Dracula Purple',
    category: 'dracula',
    accent: '#bd93f9',
    background: '#282a36',
    secondary: '#ff79c6',
    text: '#f8f8f2',
    border: '#44475a',
    headerColor: '#bd93f9',
    labelColor: '#ff79c6',
    dotColor: '#6272a4',
    valueColor: '#f8f8f2',
    statsValColor: '#8be9fd',
    dividerColor: '#44475a',
  },
  {
    name: 'Cyber Cyan',
    category: 'cyberpunk',
    accent: '#55ffff',
    background: '#050308',
    secondary: '#ff3366',
    text: '#e6fbfb',
    border: '#1a1424',
    headerColor: '#55ffff',
    labelColor: '#ff3366',
    dotColor: '#4d3a66',
    valueColor: '#e6fbfb',
    statsValColor: '#55ffff',
    dividerColor: '#2d1f3f',
  },
  {
    name: 'Synthwave 84',
    category: 'synthwave',
    accent: '#ff71ce',
    background: '#1a102f',
    secondary: '#01cdfe',
    text: '#ffffff',
    border: '#3d1e6d',
    headerColor: '#ff71ce',
    labelColor: '#01cdfe',
    dotColor: '#6b3ba7',
    valueColor: '#fffb96',
    statsValColor: '#05ffa1',
    dividerColor: '#3d1e6d',
  },
  {
    name: 'Monochrome Luxe',
    category: 'monochrome',
    accent: '#e4e4e7',
    background: '#09090b',
    secondary: '#a1a1aa',
    text: '#f4f4f5',
    border: '#27272a',
    headerColor: '#ffffff',
    labelColor: '#d4d4d8',
    dotColor: '#3f3f46',
    valueColor: '#fafafa',
    statsValColor: '#e4e4e7',
    dividerColor: '#27272a',
  },
]

export const PRESET_QUOTES: readonly string[] = [
  '“Once I told the computer to do something and it did it exactly how I told it to.”',
  '“Talk is cheap. Show me the code.”',
  '“Programs must be written for people to read, and only incidentally for machines to execute.”',
  '“Simplicity is prerequisite for reliability.”',
  '“Linux is not an OS, it’s a lifestyle: best lived in the terminal.”',
  '“First, solve the problem. Then, write the code.”',
  '“Given enough eyeballs, all bugs are shallow.”',
]

export interface SurveillanceTitlePreset {
  label: string
  ref: string
}

export const TITLE_PRESETS: readonly SurveillanceTitlePreset[] = [
  { label: 'ESTABLISH UPLINK', ref: 'REF://CONTACT.SYS' },
  { label: 'ABOUT // DOSSIER', ref: 'REF://PROFILE.DAT' },
  { label: 'TACTICAL LOADOUT', ref: 'REF://STACK.CFG' },
  { label: 'SYSTEM TELEMETRY', ref: 'REF://METRICS.SYS' },
  { label: 'PROJECTS // VAULT', ref: 'REF://REPOS.DIR' },
  { label: 'COMMUNICATION CHANNELS', ref: 'REF://SOCIAL.NET' },
]

export interface SurveillanceLedColor {
  color: string
  name: string
}

export const LED_COLORS: readonly SurveillanceLedColor[] = [
  { color: '#ff5555', name: 'Red' },
  { color: '#55ff55', name: 'Green' },
  { color: '#ffff55', name: 'Yellow' },
  { color: '#55ffff', name: 'Cyan' },
]

export const GITHUB_THEME_KEYS = {
  AUTO: 'github-auto',
  DARK: '#0d1117',
  DARK_DIMMED: '#212830',
  LIGHT: '#ffffff',
} as const

export interface GitHubThemeSwatch {
  id: string
  hex: string
  labelKey: string
  fallback: string
}

export const GITHUB_THEME_SWATCHES: readonly GitHubThemeSwatch[] = [
  {
    id: 'dark',
    hex: GITHUB_THEME_KEYS.DARK,
    labelKey: 'editor.properties.color_picker.github_dark',
    fallback: 'GitHub Dark (#0D1117)',
  },
  {
    id: 'dimmed',
    hex: GITHUB_THEME_KEYS.DARK_DIMMED,
    labelKey: 'editor.properties.color_picker.github_dimmed',
    fallback: 'GitHub Dark Dimmed (#212830)',
  },
  {
    id: 'light',
    hex: GITHUB_THEME_KEYS.LIGHT,
    labelKey: 'editor.properties.color_picker.github_light',
    fallback: 'GitHub Light (#FFFFFF)',
  },
] as const

export const LANGUAGE_COLORS: Readonly<Record<string, string>> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Vue: '#41b883',
  Shell: '#89e051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
} as const

export const MONTH_NAMES: readonly string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export const MONTH_FULL_NAMES: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const DAY_NAMES: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const GITHUB_CONTRIBUTION_COLORS = {
  LEVEL_0: '#161b22',
  LEVEL_1: '#0e4429',
  LEVEL_2: '#006d32',
  LEVEL_3: '#26a641',
  LEVEL_4: '#39d353',
} as const

export function isGitHubAdaptiveTheme(color?: string): boolean {
  if (!color) return false
  const normalized = color.trim().toLowerCase()
  return normalized === GITHUB_THEME_KEYS.AUTO || normalized === 'auto'
}

import type { LucideIcon } from 'lucide-react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Ban,
  Cloud,
  Download,
  FileCode2,
  FileJson,
  FlipHorizontal,
  FlipVertical,
  FolderGit2,
  GitFork,
  Github,
  Globe,
  Keyboard,
  Layers,
  Monitor,
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

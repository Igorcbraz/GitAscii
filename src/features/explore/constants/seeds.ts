export interface CommunityProfileItem {
  username: string
  profileSlug: string
  templateId: string
  widgetsCount: number
  hasAsciiArt: boolean
  tags: string[]
  isStored: boolean
}

export const DEFAULT_SEED_USERS: string[] = [
  'Igorcbraz',
  'shadcn',
  'leerob',
  'antfu',
  'sindresorhus',
  'developit',
  'schunckleonardo',
  'torvalds',
  'gaearon',
  'yyx990803',
  'mdo',
  'rauchg',
  'swyx',
  't3dotgg',
  'delbaoliveira',
  'addyosmani',
]

export const FALLBACK_SEED_PROFILES: CommunityProfileItem[] = [
  {
    username: 'Igorcbraz',
    profileSlug: 'default',
    templateId: 'native',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Terminal CLI', 'ASCII Matrix', 'Live Stats', 'Verified Creator'],
    isStored: true,
  },
  {
    username: 'shadcn',
    profileSlug: 'default',
    templateId: 'minimal_luxe',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Minimal Light', 'Tech Stack', 'Clean Vectors'],
    isStored: true,
  },
  {
    username: 'leerob',
    profileSlug: 'default',
    templateId: 'bento_grid',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Edge Native', 'Activity Graph', 'Top Repos'],
    isStored: true,
  },
  {
    username: 'antfu',
    profileSlug: 'default',
    templateId: 'codeweb',
    widgetsCount: 7,
    hasAsciiArt: true,
    tags: ['Cyberpunk Neon', 'ASCII Banner', 'OSS Streaks'],
    isStored: true,
  },
  {
    username: 'sindresorhus',
    profileSlug: 'default',
    templateId: 'hacker',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Hacker Matrix', 'CLI Packages', 'Verified Maker'],
    isStored: true,
  },
  {
    username: 'developit',
    profileSlug: 'default',
    templateId: 'native_simple',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Lightweight', 'Micro-framework', 'Edge Fast'],
    isStored: true,
  },
  {
    username: 'schunckleonardo',
    profileSlug: 'default',
    templateId: 'ascii_native',
    widgetsCount: 4,
    hasAsciiArt: false,
    tags: ['Dracula Theme', 'Stats Widget', 'Verified Contributor'],
    isStored: true,
  },
  {
    username: 'torvalds',
    profileSlug: 'default',
    templateId: 'windows_xp',
    widgetsCount: 4,
    hasAsciiArt: true,
    tags: ['Retro OS', 'Kernel Legend', 'Dynamic SVG'],
    isStored: true,
  },
  {
    username: 'rauchg',
    profileSlug: 'default',
    templateId: 'minimal_luxe',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Vercel Edge', 'Minimalist', 'Clean SVG'],
    isStored: true,
  },
  {
    username: 'yyx990803',
    profileSlug: 'default',
    templateId: 'bento_grid',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Vue Ecosystem', 'Vite Matrix', 'Open Source'],
    isStored: true,
  },
  {
    username: 'gaearon',
    profileSlug: 'default',
    templateId: 'terminal',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['React Native', 'Terminal Dark', 'Stats Engine'],
    isStored: true,
  },
  {
    username: 't3dotgg',
    profileSlug: 'default',
    templateId: 'codeweb',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['TypeScript', 'Full Stack', 'Neon Theme'],
    isStored: true,
  },
]

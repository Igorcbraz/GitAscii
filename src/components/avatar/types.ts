import type { CSSProperties, ReactNode } from 'react'

export type GitAsciiSemanticExpression =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'focused'
  | 'terminal'
  | 'attentive'
  | 'surprised'
  | 'sleeping'
  | 'thinking'
  | 'skeptical'
  | 'playful'
  | 'gentle'

export type GitAsciiSemanticAnimation =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'searching'
  | 'working'
  | 'excited'
  | 'celebrate'
  | 'curious'
  | 'confused'
  | 'surprised'
  | 'proud'
  | 'playful'

export type GitAsciiAvatarVariant = 'default' | 'octo'

export type GitAsciiAvatarTheme = 'dark' | 'light' | 'terminal' | 'monochrome'

export interface GitAsciiAvatarColors {
  body: `#${string}`
  eyes: `#${string}`
}

export interface GitAsciiAvatarProps {
  size?: number | string
  expression?: GitAsciiSemanticExpression | (string & {})
  animation?: GitAsciiSemanticAnimation | (string & {})
  animated?: boolean
  variant?: GitAsciiAvatarVariant
  theme?: GitAsciiAvatarTheme
  colors?: Partial<GitAsciiAvatarColors>
  className?: string
  style?: CSSProperties
  ariaLabel?: string
  children?: ReactNode
}

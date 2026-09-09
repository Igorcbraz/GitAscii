import type { AvatarDefinition, ExpressionKey } from '@bible-strong/avatar-core'

import gitasciiBaseJson from './gitascii.avatar.json'
import type {
  GitAsciiAvatarColors,
  GitAsciiAvatarTheme,
  GitAsciiAvatarVariant,
  GitAsciiSemanticExpression,
} from './types'

export const GITASCII_THEME_COLORS: Record<GitAsciiAvatarTheme, GitAsciiAvatarColors> = {
  dark: {
    body: '#c5ff4a', // GitAscii Signal Lime
    eyes: '#000000', // Void Black
  },
  light: {
    body: '#060606', // Carbon
    eyes: '#c5ff4a', // Signal Lime
  },
  terminal: {
    body: '#111316', // Terminal Onyx
    eyes: '#c5ff4a', // Signal Lime
  },
  monochrome: {
    body: '#ffffff', // Chalk White
    eyes: '#000000', // Void Black
  },
}

export const EXPRESSION_ALIASES: Record<GitAsciiSemanticExpression, ExpressionKey> = {
  neutral: 'neutral',
  happy: 'joyful-wide',
  curious: 'curious-left',
  focused: 'small-attentive',
  terminal: 'small-attentive',
  attentive: 'attentive-left',
  surprised: 'surprised-wide-left',
  sleeping: 'eyes-closed',
  thinking: 'upward-side-glance',
  skeptical: 'skeptical-left',
  playful: 'playful-right',
  gentle: 'gentle-downward-gaze',
}

export function resolveGitAsciiExpression(expression?: string): ExpressionKey {
  if (!expression) return 'neutral'
  if (expression in EXPRESSION_ALIASES) {
    return EXPRESSION_ALIASES[expression as GitAsciiSemanticExpression]
  }
  return expression as ExpressionKey
}

export function getGitAsciiAvatarDefinition(
  variant: GitAsciiAvatarVariant = 'default',
  theme: GitAsciiAvatarTheme = 'dark',
  customColors?: Partial<GitAsciiAvatarColors>
): AvatarDefinition {
  const baseColors = GITASCII_THEME_COLORS[theme] ?? GITASCII_THEME_COLORS.dark
  const resolvedColors: GitAsciiAvatarColors = {
    body: customColors?.body ?? baseColors.body,
    eyes: customColors?.eyes ?? baseColors.eyes,
  }

  const base = gitasciiBaseJson as unknown as AvatarDefinition

  if (variant === 'octo') {
    return {
      ...base,
      name: 'GitAscii Mascote (Octo)',
      colors: resolvedColors,
      body: {
        ...base.body,
        nodes: [
          {
            surface: {
              type: 'sphere',
              width: 70,
              height: 70,
              depth: 36,
              roundness: 1,
            },
            position: [-82, -72, -18],
            rotation: [0, 0, 0],
          },
          {
            surface: {
              type: 'sphere',
              width: 70,
              height: 70,
              depth: 36,
              roundness: 1,
            },
            position: [82, -72, -18],
            rotation: [0, 0, 0],
          },
        ],
      },
    }
  }

  return {
    ...base,
    name: 'GitAscii Mascote',
    colors: resolvedColors,
  }
}

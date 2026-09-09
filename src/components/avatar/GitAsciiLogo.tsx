import React from 'react'

import { GitAsciiAvatar } from './GitAsciiAvatar'
import type {
  GitAsciiAvatarTheme,
  GitAsciiAvatarVariant,
  GitAsciiSemanticExpression,
} from './types'

export interface GitAsciiLogoProps {
  size?: number
  theme?: GitAsciiAvatarTheme
  expression?: GitAsciiSemanticExpression
  variant?: GitAsciiAvatarVariant
  iconOnly?: boolean
  className?: string
  animated?: boolean
}

export function GitAsciiLogo({
  size = 36,
  theme = 'dark',
  expression = 'neutral',
  variant = 'default',
  iconOnly = false,
  className = '',
  animated = false,
}: GitAsciiLogoProps) {
  const isLight = theme === 'light'
  const gitColor = isLight ? '#060606' : '#ffffff'
  const asciiColor = isLight ? '#597321' : '#c5ff4a'

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      style={{ verticalAlign: 'middle' }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <GitAsciiAvatar
          size={size}
          theme={theme}
          expression={expression}
          variant={variant}
          animated={animated}
        />
      </div>

      {!iconOnly && (
        <span
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
            fontSize: `${Math.round(size * 0.58)}px`,
            fontWeight: 700,
            letterSpacing: '0.02em',
            lineHeight: 1,
            color: gitColor,
          }}
        >
          Git
          <span style={{ color: asciiColor }}>Ascii</span>
        </span>
      )}
    </div>
  )
}

import { renderAvatarDefinition } from '@bible-strong/avatar-core'
import React, { useId } from 'react'

import { getGitAsciiAvatarDefinition, resolveGitAsciiExpression } from './avatarDefinition'
import type { GitAsciiAvatarProps } from './types'

export function GitAsciiAvatarStatic({
  size = 120,
  expression = 'neutral',
  variant = 'default',
  theme = 'dark',
  colors,
  className,
  style,
  ariaLabel = 'GitAscii Mascote',
  children,
}: GitAsciiAvatarProps) {
  const clipId = useId()
  const resolvedKey = resolveGitAsciiExpression(expression)
  const definition = getGitAsciiAvatarDefinition(variant, theme, colors)
  const scene = renderAvatarDefinition(definition, resolvedKey)

  const sizeStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
  }

  return (
    <div
      className={['gitascii-avatar', className ?? ''].filter(Boolean).join(' ')}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        aspectRatio: '1',
        userSelect: 'none',
        ...sizeStyle,
        ...style,
      }}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        viewBox="-150 -150 300 300"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={scene.geometry.headPath} />
          </clipPath>
        </defs>

        {scene.geometry.backPaths.map((pathValue, idx) => (
          <path key={`back-${idx}`} d={pathValue} fill={scene.colors.body} />
        ))}

        <path d={scene.geometry.headPath} fill={scene.colors.body} />

        <g clipPath={`url(#${clipId})`} fill={scene.colors.eyes}>
          {scene.geometry.leftVisible && <path d={scene.geometry.leftPath} />}
          {scene.geometry.rightVisible && <path d={scene.geometry.rightPath} />}
        </g>

        {scene.geometry.frontPaths.map((pathValue, idx) => (
          <path key={`front-${idx}`} d={pathValue} fill={scene.colors.body} />
        ))}

        {children}
      </svg>
    </div>
  )
}

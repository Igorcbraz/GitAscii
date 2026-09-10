'use client'

import '@bible-strong/avatar-react/styles.css'

import { Avatar } from '@bible-strong/avatar-react'
import React, { useMemo } from 'react'

import { getGitAsciiAvatarDefinition, resolveGitAsciiExpression } from './avatarDefinition'
import type { GitAsciiAvatarProps } from './types'

export function GitAsciiAvatarClient({
  size = 120,
  expression,
  animation,
  variant = 'default',
  theme = 'dark',
  colors,
  className,
  style,
  ariaLabel = 'GitAscii Mascote',
}: GitAsciiAvatarProps) {
  const definition = useMemo(
    () => getGitAsciiAvatarDefinition(variant, theme, colors),
    [variant, theme, colors]
  )

  const resolvedExpression = expression ? resolveGitAsciiExpression(expression) : undefined

  const animationKey = animation ?? (expression ? undefined : 'idle')

  return (
    <Avatar
      definition={definition}
      animation={animationKey}
      expression={animation ? undefined : resolvedExpression}
      defaultAnimation={animation ? undefined : 'idle'}
      size={size}
      className={className}
      style={style}
      ariaLabel={ariaLabel}
    />
  )
}

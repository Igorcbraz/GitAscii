import dynamic from 'next/dynamic'
import React from 'react'

import { GitAsciiAvatarStatic } from './GitAsciiAvatarStatic'
import type { GitAsciiAvatarProps } from './types'

const GitAsciiAvatarClient = dynamic(
  () => import('./GitAsciiAvatarClient').then((mod) => mod.GitAsciiAvatarClient),
  { ssr: false }
)

export function GitAsciiAvatar({ animated = false, animation, ...props }: GitAsciiAvatarProps) {
  if (animated || animation !== undefined) {
    return <GitAsciiAvatarClient animation={animation} {...props} />
  }

  return <GitAsciiAvatarStatic {...props} />
}

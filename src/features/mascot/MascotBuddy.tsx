'use client'

import React from 'react'

import { StrobiAnchor } from './components/StrobiAnchor'

export interface MascotBuddyProps {
  inline?: boolean
  size?: number
  className?: string
}

export function MascotBuddy({ inline = false, size = 72, className }: MascotBuddyProps) {
  return (
    <StrobiAnchor
      id={inline ? 'inline-dock' : 'dock'}
      size={size}
      className={className}
      align="bottom-right"
      float
    />
  )
}

export function MascotWalker() {
  return null
}

'use client'

import React from 'react'

import { STROBI_SCENE } from '../constants/strobi'
import { StrobiProvider } from '../core/StrobiContext'
import { StrobiDeferredHost } from './StrobiDeferredHost'

export function StrobiRoot({ children }: { children: React.ReactNode }) {
  return (
    <StrobiProvider initialAnchor="hero-cta" initialScene={STROBI_SCENE.LANDING}>
      <StrobiDeferredHost />
      {children}
    </StrobiProvider>
  )
}

'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { StrobiProvider } from '../core/StrobiContext'

const StrobiHost = dynamic(() => import('./StrobiHost').then((m) => m.StrobiHost), { ssr: false })

export function StrobiRoot({ children }: { children: React.ReactNode }) {
  return (
    <StrobiProvider initialAnchor="hero-cta" initialScene="landing">
      <StrobiHost />
      {children}
    </StrobiProvider>
  )
}

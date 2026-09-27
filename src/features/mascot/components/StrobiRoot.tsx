'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { StrobiProvider } from '../core/StrobiContext'

const StrobiHost = dynamic(() => import('./StrobiHost').then((m) => m.StrobiHost), { ssr: false })

export function StrobiRoot({ children }: { children: React.ReactNode }) {
  const [shouldMountMascot, setShouldMountMascot] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        ;(window as any).requestIdleCallback(() => setShouldMountMascot(true))
      } else {
        setShouldMountMascot(true)
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <StrobiProvider initialAnchor="hero-cta" initialScene="landing">
      {shouldMountMascot && <StrobiHost />}
      {children}
    </StrobiProvider>
  )
}

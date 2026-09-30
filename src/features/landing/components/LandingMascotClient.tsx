'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'

const LandingMascot = dynamic(() => import('@/features/mascot').then((mod) => mod.LandingMascot), {
  ssr: false,
})

export function LandingMascotClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let handle: any
    if ('requestIdleCallback' in window) {
      handle = (window as any).requestIdleCallback(() => setMounted(true), { timeout: 3000 })
    } else {
      handle = setTimeout(() => setMounted(true), 2000)
    }

    return () => {
      if ('requestIdleCallback' in window && 'cancelIdleCallback' in window) {
        ;(window as any).cancelIdleCallback(handle)
      } else {
        clearTimeout(handle)
      }
    }
  }, [])

  if (!mounted) return null
  return <LandingMascot />
}

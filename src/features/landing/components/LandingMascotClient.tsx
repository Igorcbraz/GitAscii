'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const LandingMascot = dynamic(() => import('@/features/mascot').then((mod) => mod.LandingMascot), {
  ssr: false,
})

export function LandingMascotClient() {
  return <LandingMascot />
}

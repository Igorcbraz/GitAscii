'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { STROBI_LANDING_DELAY_MS, STROBI_SCENE } from '../constants/strobi'
import { useStrobiContext } from '../core/StrobiContext'

const StrobiHost = dynamic(() => import('./StrobiHost').then((m) => m.StrobiHost), { ssr: false })

export function StrobiDeferredHost() {
  const { state } = useStrobiContext()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let idle: number | undefined
    const timer = setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idle = window.requestIdleCallback(() => setReady(true))
      } else setReady(true)
    }, STROBI_LANDING_DELAY_MS)
    return () => {
      clearTimeout(timer)
      if (idle !== undefined) window.cancelIdleCallback(idle)
    }
  }, [])
  return ready ||
    state.currentScene === STROBI_SCENE.EDITOR ||
    state.currentScene === STROBI_SCENE.PRO ? (
    <StrobiHost />
  ) : null
}

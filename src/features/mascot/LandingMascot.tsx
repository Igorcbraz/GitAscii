'use client'

import { useEffect, useRef } from 'react'

import { useScrollJourney } from './hooks/useScrollJourney'
import { useStrobi } from './hooks/useStrobi'

export function LandingMascot() {
  const { strobe } = useStrobi()
  const initialGreetingFired = useRef(false)

  useScrollJourney(true)

  useEffect(() => {
    if (initialGreetingFired.current) return
    initialGreetingFired.current = true

    const timer = setTimeout(() => {
      strobe.react('happy', 1400)
    }, 1200)

    return () => clearTimeout(timer)
  }, [strobe])

  return null
}

export interface LandingMascotWalkInProps {
  message?: string
  onDone?: () => void
}

export function LandingMascotWalkIn({ message, onDone }: LandingMascotWalkInProps) {
  const { strobe } = useStrobi()

  useEffect(() => {
    if (message) {
      strobe.react('excited', 2500)
      strobe.speak({
        id: `walkin-${Date.now()}`,
        message,
        duration: 5000,
        mood: 'happy',
      })
    }

    const timer = setTimeout(() => {
      onDone?.()
    }, 5500)

    return () => clearTimeout(timer)
  }, [message, onDone, strobe])

  return null
}

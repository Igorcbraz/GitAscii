'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

import { MicrosoftClarity } from '@/lib/analytics/clarity'
import { getConsentChoice } from '@/lib/consent'

export function ConsentControlledScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const [clarityGranted, setClarityGranted] = useState(false)

  useEffect(() => {
    const stored = getConsentChoice()
    if (stored === 'granted') {
      setClarityGranted(true)
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ choice: 'granted' | 'denied' }>).detail
      setClarityGranted(detail.choice === 'granted')
    }
    window.addEventListener('analytics-consent-decision', handler)
    return () => window.removeEventListener('analytics-consent-decision', handler)
  }, [])

  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} />}

      <MicrosoftClarity consentGranted={clarityGranted} />
    </>
  )
}

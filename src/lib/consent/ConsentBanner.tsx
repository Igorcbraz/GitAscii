'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { clearConsentChoice, getConsentChoice, saveConsentChoice } from '@/lib/consent'

interface ConsentBannerProps {
  onConsent: (choice: 'granted' | 'denied') => void
}

export function ConsentBanner({ onConsent }: ConsentBannerProps) {
  const { t } = useI18n()
  const [state, setState] = useState<'pending' | 'visible' | 'hidden'>('hidden')
  const acceptRef = useRef<HTMLButtonElement>(null)
  const scrollListenerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const stored = getConsentChoice()
    if (stored !== null) {
      setState('hidden')
      return
    }

    setState('pending')

    const handleFirstScroll = () => {
      setState('visible')
      window.removeEventListener('scroll', handleFirstScroll)
      scrollListenerRef.current = null
    }

    scrollListenerRef.current = handleFirstScroll
    window.addEventListener('scroll', handleFirstScroll, { passive: true })

    return () => {
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (state === 'visible') {
      const t = setTimeout(() => acceptRef.current?.focus(), 300)
      return () => clearTimeout(t)
    }
  }, [state])

  if (state === 'hidden') return null

  function handleChoice(choice: 'granted' | 'denied') {
    saveConsentChoice(choice)
    setState('hidden')
    onConsent(choice)
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Analytics consent"
      aria-describedby="consent-description"
      className={[
        'fixed bottom-6 right-6 z-9999 w-[min(360px,calc(100vw-3rem))]',
        'transition-all duration-500 ease-out',
        state === 'visible'
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="rounded-sm border border-graphite bg-carbon/98 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.85)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal-lime shadow-[0_0_6px_rgba(197,255,74,0.8)]" />
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash">
            {t('consent.eyebrow', 'Privacy')}
          </span>
        </div>

        <p
          id="consent-description"
          className="font-inter-tight text-note text-bone leading-body text-justify mb-4"
        >
          {t('consent.description_prefix', 'GitAscii uses')}{' '}
          <span className="text-chalk font-medium">Google Analytics</span> &amp;{' '}
          <span className="text-chalk font-medium">Microsoft Clarity</span>{' '}
          {t(
            'consent.description_body',
            'to understand how the product is used and improve it. No personal data is sold. See our'
          )}{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="underline underline-offset-2 text-ash hover:text-signal-lime transition-colors"
          >
            {t('consent.privacy_policy', 'Privacy Policy')}
          </Link>{' '}
          {t('consent.and', 'and')}{' '}
          <Link
            href="/terms"
            target="_blank"
            className="underline underline-offset-2 text-ash hover:text-signal-lime transition-colors"
          >
            {t('consent.terms_of_use', 'Terms of Use')}
          </Link>
          .
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChoice('denied')}
            className="flex-1 font-inter-tight font-medium text-eyebrow text-ash border border-graphite hover:border-smoke hover:text-pearl py-2 px-3 rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-lime uppercase tracking-wide cursor-pointer"
            aria-label="Decline analytics tracking"
          >
            {t('consent.decline', 'Decline')}
          </button>
          <button
            ref={acceptRef}
            onClick={() => handleChoice('granted')}
            className="flex-1 font-inter-tight font-medium text-eyebrow text-black bg-signal-lime hover:brightness-110 py-2 px-3 rounded-sm transition-all shadow-[0_0_8px_rgba(197,255,74,0.45)] hover:shadow-[0_0_16px_rgba(197,255,74,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-lime focus-visible:ring-offset-2 focus-visible:ring-offset-carbon uppercase tracking-wide cursor-pointer"
            aria-label="Accept analytics tracking"
          >
            {t('consent.accept', 'Accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Privacy Settings button — placed in the footer so users can revisit their choice.
 */
export function PrivacySettingsButton() {
  const { t } = useI18n()

  function handleClick() {
    clearConsentChoice()
    window.location.reload()
  }

  return (
    <button
      onClick={handleClick}
      className="font-inter-tight text-body text-ash transition-colors hover:text-signal-lime focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-lime rounded-sm"
    >
      {t('consent.privacy_settings', 'Privacy Settings')}
    </button>
  )
}

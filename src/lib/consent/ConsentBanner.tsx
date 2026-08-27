'use client'

import { Check, X } from 'lucide-react'
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

  useEffect(() => {
    const stored = getConsentChoice()
    if (stored !== null) {
      setState('hidden')
      return
    }

    setState('pending')
    const timer = setTimeout(() => {
      setState('visible')
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (state === 'visible') {
      const timer = setTimeout(() => acceptRef.current?.focus(), 300)
      return () => clearTimeout(timer)
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
      aria-label={t('consent.dialog_aria', 'Analytics consent')}
      aria-describedby="consent-description"
      className={[
        'fixed bottom-6 right-6 z-9999 w-[min(440px,calc(100vw-2rem))]',
        'transition-all duration-300 ease-out',
        state === 'visible'
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none',
      ].join(' ')}
    >
      <div className="bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl flex flex-col text-chalk">
        <div className="px-5 py-3.5 border-b border-graphite flex items-center justify-between bg-onyx/40">
          <div className="flex items-center gap-2">
            <span className="text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider">
              [ PRIVACY · {t('consent.badge', 'COOKIES & ANALYTICS')} ]
            </span>
          </div>
          <button
            onClick={() => handleChoice('denied')}
            className="p-1 rounded text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
            title={t('consent.decline', 'Fechar')}
            aria-label={t('consent.decline_aria', 'Fechar')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-pt-serif font-light text-white text-xl tracking-tight leading-snug">
            {t('consent.title_prefix', 'Valorizamos sua ')}
            <span className="italic text-signal-lime font-pt-serif">
              {t('consent.title_highlight', 'privacidade')}
            </span>
            {t('consent.title_suffix', '')}
          </h3>
          <p
            id="consent-description"
            className="font-inter-tight text-note text-pearl leading-relaxed mt-2"
          >
            {t('consent.description_prefix', 'GitAscii uses')}{' '}
            <span className="text-white font-medium">Google Analytics</span> &amp;{' '}
            <span className="text-white font-medium">Microsoft Clarity</span>{' '}
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
        </div>

        <div className="px-5 py-3.5 border-t border-graphite bg-onyx/40 flex items-center justify-between gap-3">
          <button
            onClick={() => handleChoice('denied')}
            className="px-3.5 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
            aria-label={t('consent.decline_aria', 'Decline analytics tracking')}
          >
            {t('consent.decline', 'Decline')}
          </button>
          <button
            ref={acceptRef}
            onClick={() => handleChoice('granted')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-note hover:brightness-110 transition-all cursor-pointer shadow-[0_0_8px_rgba(197,255,74,0.45)]"
            aria-label={t('consent.accept_aria', 'Accept analytics tracking')}
          >
            <Check size={14} className="stroke-[2.5]" />
            <span>{t('consent.accept', 'Accept')}</span>
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
      className="font-inter-tight text-body text-ash transition-colors hover:text-signal-lime focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal-lime rounded-sm cursor-pointer"
    >
      {t('consent.privacy_settings', 'Privacy Settings')}
    </button>
  )
}

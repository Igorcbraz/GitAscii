'use client'

import Link from 'next/link'

import { useI18n } from '@/i18n'

export default function NotFound() {
  const { t } = useI18n()

  return (
    <main className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight p-6">
      <header className="flex flex-col items-center text-center">
        <span className="text-label uppercase tracking-[0.22em] text-ash mb-4">
          {t('not_found.eyebrow', '[ 404 — NOT FOUND ]')}
        </span>
        <h1 className="text-heading font-pt-serif font-light text-chalk mb-2">
          {t('not_found.title', 'Page Not Found.')}
        </h1>
        <p className="text-body text-bone mb-8 max-w-md text-center">
          {t(
            'not_found.description',
            'The profile or route you requested could not be located on GitAscii.'
          )}
        </p>
      </header>
      <Link
        href="/"
        className="bg-signal-lime text-black font-medium text-label px-6 py-3 rounded-sm glow-lime uppercase tracking-wider transition-all hover:brightness-110"
      >
        {t('not_found.return_home', 'Return to Home')}
      </Link>
    </main>
  )
}

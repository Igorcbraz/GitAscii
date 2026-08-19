'use client'

import { ArrowRight, Compass, Github, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import AsciiHands from '@/components/ui/ascii-hands'
import KineticGrid from '@/components/ui/kinetic-grid'
import { useToast } from '@/components/ui/toast'
import Navbar from '@/features/landing/components/Navbar'
import { useI18n } from '@/i18n'

const POPULAR_PROFILES = ['torvalds', 'shadcn', 'leerob', 'igorcbraz', 'antfu']

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useI18n()
  const { error } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const validateUsername = (val: string) => {
    const clean = val.trim().replace(/^@+/, '')
    if (
      clean.includes('/') ||
      clean.includes('.') ||
      clean.includes('http') ||
      clean.includes('www')
    ) {
      return false
    }
    const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
    return githubUsernameRegex.test(clean)
  }

  const handleOpenEditor = (e: React.FormEvent) => {
    e.preventDefault()
    const handle = username.trim().replace(/^@+/, '') || 'Igorcbraz'
    if (username.trim() && !validateUsername(handle)) {
      error(
        t(
          'errors.invalid_github_username',
          'Please enter a valid GitHub username (no links or special characters).'
        )
      )
      return
    }

    setIsLoading(true)
    router.push(`/${handle}`)
  }

  return (
    <main className="relative min-h-screen bg-carbon text-chalk font-inter-tight select-none overflow-x-hidden">
      <Navbar />

      <KineticGrid className="min-h-screen!">
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 sm:px-6 text-center">
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {mounted && <AsciiHands className="absolute inset-0 opacity-40" />}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,6,0.92)_0%,rgba(6,6,6,0.55)_50%,transparent_75%)]" />
          </div>

          <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-150 mb-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-onyx/90 border border-graphite/80 text-eyebrow font-jetbrains-mono uppercase tracking-[0.22em] text-ash shadow-2xl backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse" />
                {t('not_found.eyebrow', '[ 404 — ROUTE NOT FOUND ]')}
              </span>
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300 font-pt-serif font-light text-white text-5xl md:text-heading-lg leading-hero md:leading-heading-lg tracking-heading-lg mb-6">
              {t('not_found.title_part1', 'Lost in the')}{' '}
              <span className="italic text-signal-lime font-pt-serif">
                {t('not_found.title_highlight', 'ASCII Void')}
              </span>
              {t('not_found.title_part2', '.')}
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-500 font-inter-tight font-normal text-bone text-body leading-body max-w-lg mb-10">
              {t(
                'not_found.description',
                'The profile or route you requested could not be located on GitAscii. Jump into the editor or explore developer profiles.'
              )}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-700 w-full max-w-md mx-auto mb-4">
              <form onSubmit={handleOpenEditor} className="flex w-full group">
                <div className="relative grow flex items-center">
                  <Github className="absolute left-4 w-4 h-4 text-ash z-10" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder={t('not_found.placeholder', 'Enter your GitHub username...')}
                    className="w-full bg-onyx/95 border border-graphite text-white font-inter-tight text-body py-3.5 pl-11 pr-4 rounded-l-sm focus:outline-none focus:border-signal-lime/60 focus:ring-1 focus:ring-signal-lime/60 transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="shrink-0 bg-signal-lime text-black font-inter-tight font-bold text-label py-3.5 px-5 rounded-r-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(197,255,74,0.3)] hover:shadow-[0_0_20px_rgba(197,255,74,0.6)] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>{t('landing.hero.loading', 'Loading...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('not_found.open_editor', 'Open Editor')}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-caption text-ash font-jetbrains-mono">
                <span className="text-fog">{t('not_found.suggestions', 'Popular Profiles:')}</span>
                {POPULAR_PROFILES.map((slug) => (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="px-2 py-0.5 rounded-xs bg-onyx/80 border border-graphite/70 text-pearl hover:text-signal-lime hover:border-signal-lime/50 transition-colors"
                  >
                    @{slug}
                  </Link>
                ))}
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-900 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-md mx-auto mt-4 mb-8">
              <Link
                href="/"
                className="group p-3.5 bg-onyx/85 border border-graphite/80 hover:border-signal-lime/50 rounded-sm transition-all duration-300 flex items-center gap-3 text-left shadow-lg"
              >
                <div className="w-9 h-9 rounded-xs bg-graphite flex items-center justify-center shrink-0 group-hover:bg-signal-lime/10 transition-colors">
                  <Home
                    size={18}
                    className="text-pearl group-hover:text-signal-lime transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body text-white flex items-center justify-between">
                    <span>{t('not_found.return_home', 'Return to Home')}</span>
                    <ArrowRight
                      size={13}
                      className="text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                  <p className="text-note text-ash mt-0.5 line-clamp-1">
                    {t('not_found.home_desc', 'Return to main showcase and landing')}
                  </p>
                </div>
              </Link>

              <Link
                href="/explore"
                className="group p-3.5 bg-onyx/85 border border-graphite/80 hover:border-signal-lime/50 rounded-sm transition-all duration-300 flex items-center gap-3 text-left shadow-lg"
              >
                <div className="w-9 h-9 rounded-xs bg-graphite flex items-center justify-center shrink-0 group-hover:bg-signal-lime/10 transition-colors">
                  <Compass
                    size={18}
                    className="text-pearl group-hover:text-signal-lime transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-body text-white flex items-center justify-between">
                    <span>{t('not_found.explore_title', 'Explore Community')}</span>
                    <ArrowRight
                      size={13}
                      className="text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all"
                    />
                  </div>
                  <p className="text-note text-ash mt-0.5 line-clamp-1">
                    {t(
                      'not_found.explore_desc',
                      'Discover authentic profiles built by the community'
                    )}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)] z-20" />
        </div>
      </KineticGrid>
    </main>
  )
}

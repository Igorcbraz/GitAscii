'use client'

import { ArrowRight, Github, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import AsciiHands from '@/components/ui/ascii-hands'
import { useToast } from '@/components/ui/toast'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UserSession {
  username: string
  githubId: number
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [session, setSession] = useState<UserSession | null>(null)
  const router = useRouter()
  const { t } = useI18n()
  const { error } = useToast()

  useEffect(() => {
    setMounted(true)

    fetch(API_ENDPOINTS.AUTH.SESSION)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session)
        }
      })
      .catch(() => {})
  }, [])

  const validateUsername = (val: string) => {
    const clean = val.trim()
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
    const handle = username.trim() || 'Igorcbraz'
    if (username.trim() && !validateUsername(handle)) {
      error(
        t(
          'errors.invalid_github_username',
          'Por favor, insira um nome de usuário válido do GitHub (sem links ou caracteres especiais).'
        )
      )
      return
    }

    setIsLoading(true)
    router.push(`/${handle}`)
  }

  return (
    <section className="relative min-h-screen">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {mounted && <AsciiHands className="absolute inset-0 opacity-60" />}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,6,0.85)_0%,rgba(6,6,6,0.3)_45%,transparent_70%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center pb-24 md:pb-32 pt-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-150 mb-8">
            <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash">
              {t('landing.hero.eyebrow', '[ THE FUTURE OF GITHUB PROFILES ]')}
            </span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300 font-pt-serif font-light text-white text-5xl md:text-heading-lg leading-hero md:leading-heading-lg tracking-heading-lg mb-8">
            {t('landing.hero.title_normal', 'Create ')}
            <span className="italic text-signal-lime">
              {t('landing.hero.title_italic', 'Stunning')}
            </span>
            {t('landing.hero.title_end', ' GitHub Profile READMEs.')}
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-500 font-inter-tight font-normal text-bone text-body leading-body max-w-130 mb-12">
            {t(
              'landing.hero.subtitle',
              'Premium SVGs. ASCII art. Visual editor. One platform for developers who care about their profile.'
            )}
          </p>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-700 flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            {session ? (
              <Link
                href={`/${session.username}`}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-sm bg-signal-lime px-6 py-3.5 font-inter-tight text-body font-bold text-black transition-all duration-300 shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:shadow-[0_0_20px_rgba(197,255,74,0.65)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <User size={18} />
                <span>
                  {t('landing.hero.go_to_editor', 'Go to Editor')} (@{session.username})
                </span>
              </Link>
            ) : (
              <Link
                href={API_ENDPOINTS.AUTH.LOGIN()}
                prefetch={false}
                onClick={() => setIsGithubLoading(true)}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-sm bg-signal-lime px-6 py-3.5 font-inter-tight text-body font-bold text-black transition-all duration-300 shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:shadow-[0_0_20px_rgba(197,255,74,0.65)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isGithubLoading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Github size={18} />
                )}
                <span>{t('landing.hero.login_github', 'Login with GitHub')}</span>
              </Link>
            )}

            <div className="flex items-center gap-3 w-full">
              <span className="flex-1 h-px bg-graphite/60" />
              <span className="uppercase text-caption tracking-widest text-fog font-inter-tight">
                {t('common.or', 'or')}
              </span>
              <span className="flex-1 h-px bg-graphite/60" />
            </div>

            <form onSubmit={handleOpenEditor} className="flex w-full group">
              <div className="relative grow flex items-center">
                <Github className="absolute left-4 w-5 h-5 text-ash z-10" />
                <input
                  id="hero-username-input"
                  type="text"
                  aria-label={t('landing.hero.placeholder', 'Enter your GitHub username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder={t('landing.hero.placeholder', 'Enter your GitHub username')}
                  className="w-full bg-onyx/80 backdrop-blur-sm border border-graphite text-white font-inter-tight text-body py-3.5 pl-11 pr-5 rounded-l-sm focus:outline-none focus:border-signal-lime/60 focus:ring-1 focus:ring-signal-lime/60 transition-all disabled:opacity-50 [&:-webkit-autofill]:[WebkitTextFillColor:#ffffff] [&:-webkit-autofill]:[WebkitBoxShadow:0_0_0_1000px_#060606_inset] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                aria-label={t('landing.hero.open_editor', 'Open Editor')}
                className="shrink-0 bg-onyx border border-graphite border-l-0 text-white font-inter-tight font-medium text-body py-3.5 px-5 rounded-r-sm transition-all duration-300 hover:border-signal-lime/50 hover:text-signal-lime flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('landing.hero.loading', 'Loading...')}</span>
                  </>
                ) : (
                  <>
                    {t('landing.hero.open_editor', 'Open Editor')} <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)] z-20"></div>
    </section>
  )
}

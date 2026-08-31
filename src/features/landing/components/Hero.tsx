'use client'

import { ArrowRight, ChevronDown, Github, Sparkles, User, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import AsciiHands from '@/components/ui/ascii-hands'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import { useToast } from '@/components/ui/toast'
import { getProPricing, PRO_PLAN_TIERS, PRO_PRICING_CONFIG } from '@/constants'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UserSession {
  username: string
  githubId: number
  isPro?: boolean
  tier?: (typeof PRO_PLAN_TIERS)[keyof typeof PRO_PLAN_TIERS]
}

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [session, setSession] = useState<UserSession | null>(null)
  const router = useRouter()
  const { t, language } = useI18n()
  const pricing = getProPricing(language)
  const { error } = useToast()

  const isProUser = Boolean(session?.isPro || session?.tier === 'pro')

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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 font-jetbrains-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              <ShinyText speed={3.5}>
                {t('landing.hero.eyebrow', '[ THE FUTURE OF GITHUB PROFILES ]')}
              </ShinyText>
            </div>
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
              <div className="w-full flex flex-col items-center gap-3">
                <Magnet distance={60} strength={0.25} className="w-full">
                  <Link
                    href={`/${session.username}`}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-sm bg-signal-lime px-6 py-3.5 font-inter-tight text-body font-bold text-black transition-all duration-300 shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:shadow-[0_0_20px_rgba(197,255,74,0.65)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[48px]"
                  >
                    <User size={18} />
                    <span>
                      {t('landing.hero.go_to_editor', 'Go to Editor')} (@{session.username})
                    </span>
                  </Link>
                </Magnet>

                {isProUser ? (
                  <Link
                    href="/pro"
                    className="relative overflow-hidden w-full inline-flex items-center justify-between gap-3 px-4 py-3.5 rounded-sm bg-gradient-to-r from-onyx via-carbon to-onyx hover:from-[#151515] hover:to-[#181818] text-white transition-colors duration-200 group cursor-pointer shadow-none"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1200 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none" />

                    <div className="flex items-center gap-2.5 min-w-0 z-10">
                      <div className="size-6 rounded-sm bg-signal-lime/15 flex items-center justify-center group-hover:bg-signal-lime/25 group-hover:scale-105 transition-all shrink-0">
                        <Zap className="size-3.5 text-signal-lime fill-signal-lime" />
                      </div>
                      <div className="flex flex-col items-start min-w-0 text-left">
                        <span className="font-inter-tight text-body font-semibold text-white group-hover:text-signal-lime transition-colors">
                          {t('landing.hero.access_pro', 'Access GitAscii Pro')}
                        </span>
                        <span className="font-inter-tight text-[11px] text-bone/70 group-hover:text-bone transition-colors truncate">
                          {t(
                            'landing.hero.pro_workspace_desc',
                            'Real-time analytics, error monitor & multi-profile management'
                          )}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all shrink-0 z-10" />
                  </Link>
                ) : (
                  <Link
                    href="/pro"
                    className="relative overflow-hidden w-full inline-flex items-center justify-between gap-3 px-4 py-3.5 rounded-sm bg-gradient-to-r from-onyx via-carbon to-onyx hover:from-[#151515] hover:to-[#181818] text-white transition-colors duration-200 group cursor-pointer shadow-none"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1200 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none" />

                    <div className="flex items-center gap-2.5 min-w-0 z-10">
                      <div className="size-6 rounded-sm bg-signal-lime/10 flex items-center justify-center group-hover:bg-signal-lime/20 group-hover:scale-105 transition-all shrink-0">
                        <Zap className="size-3.5 text-signal-lime fill-signal-lime/20 group-hover:fill-signal-lime" />
                      </div>
                      <div className="flex flex-col items-start min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-inter-tight text-body font-semibold text-white group-hover:text-signal-lime transition-colors">
                            GitAscii Pro
                          </span>
                          <span className="font-jetbrains-mono text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-signal-lime/20 text-signal-lime leading-tight">
                            {PRO_PRICING_CONFIG.discountPercentage}% OFF
                          </span>
                        </div>
                        <span className="font-inter-tight text-[11px] text-bone/70 group-hover:text-bone transition-colors truncate">
                          {t('landing.hero.pro_cta_dense', 'Get Lifetime Access')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 z-10">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-jetbrains-mono text-ash/60 line-through leading-none">
                          {pricing.originalPriceFormatted}
                        </span>
                        <span className="text-[14px] font-jetbrains-mono font-bold text-signal-lime leading-tight">
                          {pricing.priceFormatted}
                        </span>
                      </div>
                      <ArrowRight className="size-4 text-ash group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Magnet distance={60} strength={0.25} className="w-full">
                  <Link
                    href={API_ENDPOINTS.AUTH.LOGIN()}
                    prefetch={false}
                    rel="nofollow"
                    onClick={() => setIsGithubLoading(true)}
                    className="w-full inline-flex items-center justify-center gap-2.5 rounded-sm bg-signal-lime px-6 py-3.5 font-inter-tight text-body font-bold text-black transition-all duration-300 shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:shadow-[0_0_20px_rgba(197,255,74,0.65)] hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[48px]"
                  >
                    {isGithubLoading ? (
                      <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Github size={18} />
                    )}
                    <span>{t('landing.hero.login_github', 'Login with GitHub')}</span>
                  </Link>
                </Magnet>

                <div className="flex items-center gap-3 w-full">
                  <span className="flex-1 h-px bg-graphite/60" />
                  <span className="uppercase text-caption tracking-widest text-ash font-inter-tight">
                    {t('common.or', 'or')}
                  </span>
                  <span className="flex-1 h-px bg-graphite/60" />
                </div>

                <form onSubmit={handleOpenEditor} className="flex w-full group">
                  <div className="relative grow flex items-center">
                    <label htmlFor="hero-username-input" className="sr-only">
                      {t('landing.hero.placeholder', 'Enter your GitHub username')}
                    </label>
                    <Github className="absolute left-4 w-5 h-5 text-ash z-10" aria-hidden="true" />
                    <input
                      id="hero-username-input"
                      type="text"
                      aria-label={t('landing.hero.placeholder', 'Enter your GitHub username')}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      placeholder={t('landing.hero.placeholder', 'Enter your GitHub username')}
                      className="w-full bg-onyx border border-graphite text-white font-inter-tight text-body py-3.5 pl-11 pr-5 rounded-l-sm focus:outline-none focus:border-signal-lime/60 focus:ring-1 focus:ring-signal-lime/60 transition-all disabled:opacity-50 [&:-webkit-autofill]:[WebkitTextFillColor:#ffffff] [&:-webkit-autofill]:[WebkitBoxShadow:0_0_0_1000px_#060606_inset] [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]"
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

                <Link
                  href="/pro"
                  className="w-full inline-flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-sm bg-transparent hover:bg-signal-lime/[0.04] transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Zap className="size-3 text-signal-lime/80 shrink-0 group-hover:text-signal-lime group-hover:scale-110 transition-transform" />
                    <span className="font-inter-tight text-[12px] text-bone/75 group-hover:text-white transition-colors truncate">
                      <span className="font-semibold text-signal-lime tracking-wide">
                        GitAscii Pro
                      </span>
                      <span className="text-ash/60 mx-1.5">·</span>
                      {t('landing.hero.pro_cta_dense', 'Get Lifetime Access')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-jetbrains-mono text-ash/50 line-through">
                      {pricing.originalPriceFormatted}
                    </span>
                    <span className="text-[12px] font-jetbrains-mono font-bold text-signal-lime">
                      {pricing.priceFormatted}
                    </span>
                    <ArrowRight className="size-3 text-ash/60 group-hover:text-signal-lime group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none animate-in fade-in duration-1000 fill-mode-both delay-1000"
        style={{ top: 'calc(100vh - 72px)' }}
      >
        <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.22em] text-ash/60">
          {t('landing.hero.scroll_cue', 'scroll to explore')}
        </span>
        <ChevronDown className="w-4 h-4 text-signal-lime/60 animate-bounce" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)] z-20" />
    </section>
  )
}

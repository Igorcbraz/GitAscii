'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

import type { LandingMetrics } from '@/constants/metrics'
import type { CommunityProfileItem } from '@/features/explore/getCommunityProfiles'
import { useI18n } from '@/i18n'

const ComparisonTable = dynamic(() => import('./ComparisonTable'), { ssr: false })
const EcosystemHub = dynamic(() => import('./EcosystemHub'), { ssr: false })
const FinalCTA = dynamic(() => import('./FinalCTA'), { ssr: false })
const TemplatesPreview = dynamic(
  () => import('./TemplatesPreview').then((module) => module.TemplatesPreview),
  {
    ssr: false,
  }
)
const WidgetsShowcase = dynamic(
  () => import('./WidgetsShowcase').then((module) => module.WidgetsShowcase),
  {
    ssr: false,
  }
)

const InteractiveEditorDemo = dynamic(() => import('./InteractiveEditorDemo'), { ssr: false })
const TractionBar = dynamic(() => import('./TractionBar').then((module) => module.TractionBar), {
  ssr: false,
})
const CommunityProfiles = dynamic(
  () => import('./CommunityProfiles').then((module) => module.CommunityProfiles),
  { ssr: false }
)
const FAQ = dynamic(() => import('./FAQ').then((module) => module.FAQ), { ssr: false })
const Footer = dynamic(() => import('./Footer').then((module) => module.Footer), { ssr: false })

function useApproachingViewport() {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setReady(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setReady(true)
        observer.disconnect()
      },
      { rootMargin: '700px 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, ready }
}

export function DeferredTractionBar({ metrics }: { metrics?: LandingMetrics }) {
  const { ref, ready } = useApproachingViewport()
  return (
    <div ref={ref} className="min-h-[514px] lg:min-h-[186px]">
      {ready ? (
        <TractionBar metrics={metrics} />
      ) : (
        <section id="traction" aria-busy="true" className="min-h-[514px] lg:min-h-[186px]" />
      )}
    </div>
  )
}

export function DeferredCommunityProfiles({
  profiles,
  metrics,
  usersCount,
}: {
  profiles?: CommunityProfileItem[]
  metrics?: LandingMetrics
  usersCount?: number
}) {
  const { ref, ready } = useApproachingViewport()
  const { t } = useI18n()
  return (
    <div ref={ref} className="min-h-[1957px] lg:min-h-[1294px]">
      {ready ? (
        <CommunityProfiles profiles={profiles} metrics={metrics} usersCount={usersCount} />
      ) : (
        <section
          id="community-showcase"
          aria-busy="true"
          className="min-h-[1957px] lg:min-h-[1294px] px-4 py-20"
        >
          <h2 className="font-pt-serif text-3xl text-chalk">
            {t('landing.community.title_start', 'See How Developers Build Their ')}
            {t('landing.community.title_highlight', 'READMEs.')}
          </h2>
          <p className="font-inter-tight text-body text-bone mt-4">
            {t(
              'landing.community.subtitle',
              'Real dynamic profiles created by developers worldwide. Inspect the exact layouts, widgets, and styles they selected for their GitHub Profile README.'
            )}
          </p>
          <ul className="mt-8 text-bone font-inter-tight">
            {(profiles?.length
              ? profiles
              : [{ username: 'Igorcbraz' }, { username: 'shadcn' }, { username: 'leerob' }]
            ).map((profile) => (
              <li key={profile.username}>
                <a href={`/${profile.username}`}>{profile.username}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export function DeferredFAQ({ faqs }: { faqs: readonly { question: string; answer: string }[] }) {
  const { ref, ready } = useApproachingViewport()
  const { t } = useI18n()
  return (
    <div ref={ref} className="min-h-[1398px] lg:min-h-[1352px]">
      {ready ? (
        <FAQ />
      ) : (
        <section id="faq" aria-busy="true" className="min-h-[1398px] lg:min-h-[1352px] px-4 py-24">
          <h2 className="font-pt-serif text-3xl text-chalk">
            {t('landing.faq.title_normal', 'Frequently Asked ')}
            {t('landing.faq.title_italic', 'Questions.')}
          </h2>
          {faqs.map((faq, index) => (
            <details key={faq.question} className="font-inter-tight text-bone mt-6">
              <summary>{t(`landing.faq.q${index + 1}`, faq.question)}</summary>
              <p>{t(`landing.faq.a${index + 1}`, faq.answer)}</p>
            </details>
          ))}
        </section>
      )}
    </div>
  )
}

export function DeferredFooter() {
  const { ref, ready } = useApproachingViewport()
  return (
    <div ref={ref} className="min-h-[500px]">
      {ready ? <Footer /> : <footer aria-busy="true" className="min-h-[500px] bg-void-black" />}
    </div>
  )
}

function useNearViewport(rootMargin = '2000px 0px', waitForIdle = true) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const trigger = () => {
          setReady(true)
        }
        if (!waitForIdle) {
          trigger()
        } else if ('requestIdleCallback' in window) {
          ;(window as any).requestIdleCallback(trigger, { timeout: 2000 })
        } else {
          setTimeout(trigger, 1000)
        }

        observer.disconnect()
      },
      { rootMargin }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, waitForIdle])

  return { ref, ready }
}

export function DeferredTemplatesPreview({ count }: { count: number }) {
  const { ref, ready } = useNearViewport()
  const { t } = useI18n()

  return (
    <div ref={ref}>
      {ready ? (
        <TemplatesPreview count={count} />
      ) : (
        <section
          id="templates-preview"
          aria-busy="true"
          className="relative z-10 w-full min-h-[2390px] md:min-h-[1784px] bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60"
        >
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
              {t('landing.templates.title_start', 'Authentic Layouts Generated Directly by the ')}
              <em className="italic text-signal-lime">
                {t('landing.templates.title_highlight', 'Engine.')}
              </em>
            </h2>
            <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
              {t(
                'landing.templates.subtitle',
                'What you see is exactly what the editor renders on your canvas. Pick any layout preset to instantly load its configured widgets, typography, and color tokens.'
              )}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export function DeferredWidgetsShowcase({ count }: { count: number }) {
  const { ref, ready } = useNearViewport()
  const { t } = useI18n()

  return (
    <div ref={ref}>
      {ready ? (
        <WidgetsShowcase count={count} />
      ) : (
        <section
          id="widgets-showcase"
          aria-busy="true"
          className="relative z-10 w-full min-h-[8470px] md:min-h-[5675px] bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60"
        >
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
              {t('landing.widgets.title_start', 'Modular Engine Packed with Over ')}
              <em className="italic text-signal-lime">
                {t('landing.widgets.title_highlight', `${count}+ Dynamic Cards.`, {
                  count: String(count),
                })}
              </em>
            </h2>
            <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
              {t(
                'landing.widgets.subtitle',
                'Explore widgets in the exact order available in Studio: Featured, GitAscii Native, Thematic Categories, and Community Extensions.'
              )}
            </p>
          </div>
        </section>
      )}
    </div>
  )
}

export function DeferredComparisonTable({
  proCustomers,
  proUsernames,
}: {
  proCustomers: number
  proUsernames: string[]
}) {
  const { ref, ready } = useNearViewport()
  const { t } = useI18n()

  return (
    <div ref={ref}>
      {ready ? (
        <ComparisonTable proCustomers={proCustomers} proUsernames={proUsernames} />
      ) : (
        <section
          id="pricing"
          aria-busy="true"
          className="relative z-10 w-full min-h-[2085px] md:min-h-[1594px] py-24 md:py-36 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="font-pt-serif text-3xl text-chalk sm:text-heading">
              {t('landing.pricing.title_start', 'Stop guessing if anyone sees your work. ')}
              <em className="italic text-signal-lime">
                {t('landing.pricing.title_highlight', 'Now you know.')}
              </em>
            </h2>
          </div>
        </section>
      )}
    </div>
  )
}

export function DeferredEcosystemHub({ metrics }: { metrics: LandingMetrics }) {
  const { ref, ready } = useNearViewport()
  const { t } = useI18n()

  return (
    <div ref={ref}>
      {ready ? (
        <EcosystemHub metrics={metrics} />
      ) : (
        <section
          id="ecosystem"
          aria-busy="true"
          className="relative z-10 w-full min-h-[3095px] md:min-h-[1626px] py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-pt-serif text-3xl text-chalk sm:text-heading">
              {t('landing.ecosystem.title_start', 'Everything You Need to Build Your ')}
              <em className="italic text-signal-lime">
                {t('landing.ecosystem.title_highlight', 'Presence.')}
              </em>
            </h2>
          </div>
        </section>
      )}
    </div>
  )
}

export function DeferredFinalCTA({ metrics }: { metrics: LandingMetrics }) {
  const { ref, ready } = useNearViewport()
  const { t } = useI18n()

  return (
    <div ref={ref}>
      {ready ? (
        <FinalCTA metrics={metrics} />
      ) : (
        <section
          id="final-cta"
          aria-busy="true"
          className="relative w-full min-h-[778px] md:min-h-[690px] border-t border-graphite/60 py-24 md:py-32 px-4 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-pt-serif text-3xl text-chalk sm:text-heading">
              {t('landing.final_cta.title_start', 'Ready to Transform Your ')}
              <em className="italic text-signal-lime">
                {t('landing.final_cta.title_highlight', 'Profile?')}
              </em>
            </h2>
          </div>
        </section>
      )}
    </div>
  )
}

export function DeferredInteractiveEditorDemo({ defaultUsername }: { defaultUsername?: string }) {
  const { ref, ready } = useNearViewport('-100px 0px', false)
  const { t } = useI18n()

  return (
    <div ref={ref} className="min-h-[960px] md:min-h-[1036px] lg:min-h-[1076px]">
      {ready ? (
        <InteractiveEditorDemo defaultUsername={defaultUsername} />
      ) : (
        <section
          id="editor-sandbox"
          aria-busy="true"
          className="relative z-10 w-full min-h-[960px] bg-black pb-20 md:pb-24 px-2 sm:px-4 md:px-6 lg:px-8 md:min-h-[1036px] lg:min-h-[1076px]"
        >
          <div className="w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto">
            <div
              className="relative w-full rounded-2xl flex flex-col h-[880px] md:h-[940px] lg:h-[980px] border border-white/[0.08] overflow-hidden"
              style={{
                background: 'rgba(8, 8, 8, 0.88)',
                boxShadow:
                  '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 0 rgba(197,255,74,0.18)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal-lime/50 to-transparent" />
              <div className="relative z-10 bg-black/50 px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-3 text-ash shrink-0">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
                </div>
                <span className="font-jetbrains-mono text-[11px] uppercase tracking-[0.18em] text-pearl font-medium">
                  {t('landing.editor_demo.title_video', '[ PRESENTATION · GITASCII OVERVIEW ]')}
                </span>
              </div>
              <div
                className="flex-1 bg-black bg-center bg-cover"
                style={{ backgroundImage: "url('/editor-poster.webp')" }}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

'use client'

import { ArrowRight, Compass, Wand2 } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import React from 'react'

import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import { useI18n } from '@/i18n'

interface FinalCTAProps {
  metrics?: LandingMetrics
}

export function FinalCTA({ metrics = DEFAULT_LANDING_METRICS }: FinalCTAProps) {
  const { t } = useI18n()

  const handleScrollToHero = () => {
    if (typeof window !== 'undefined') {
      const input = document.getElementById('hero-username-input')
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      id="final-cta"
      className="relative w-full bg-transparent border-t border-graphite/60 py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-20"
        aria-hidden="true"
      >
        <pre className="font-jetbrains-mono text-[10px] sm:text-xs md:text-sm leading-tight text-graphite whitespace-pre">
          {`
     ██████╗ ██╗████████╗ █████╗ ███████╗ ██████╗██╗██╗
    ██╔════╝ ██║╚══██╔══╝██╔══██╗██╔════╝██╔════╝██║██║
    ██║  ███╗██║   ██║   ███████║███████╗██║     ██║██║
    ██║   ██║██║   ██║   ██╔══██║╚════██║██║     ██║██║
    ╚██████╔╝██║   ██║   ██║  ██║███████║╚██████╗██║██║
     ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝
`}
        </pre>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.6)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center"
      >
        <span className="font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash">
          <ShinyText speed={3}>
            {t('landing.final_cta.eyebrow', '[ GET STARTED TODAY ]')}
          </ShinyText>
        </span>

        <h2 className="font-pt-serif font-light text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.02em] text-chalk max-w-3xl">
          {t('landing.final_cta.title_start', 'Ready to Transform Your ')}
          <span className="italic text-signal-lime">
            {t('landing.final_cta.title_highlight', 'Profile?')}
          </span>
        </h2>

        <p className="font-inter-tight text-body sm:text-lg text-bone leading-relaxed max-w-xl mx-auto">
          {t('landing.final_cta.subtitle_prefix', 'Join ')}
          <AnimatedCounter value={metrics.users} suffix="+" />
          {t(
            'landing.final_cta.subtitle_suffix',
            ' developers who already elevated their GitHub presence with stunning ASCII art, dynamic stats, and verified SVGs.'
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Magnet distance={80} strength={0.25}>
            <button
              onClick={handleScrollToHero}
              className="px-8 py-4 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[15px] uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-[0_0_25px_rgba(197,255,74,0.3)] hover:shadow-[0_0_35px_rgba(197,255,74,0.5)] cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{t('landing.final_cta.start_building', 'Start Building Free')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Magnet>

          <Magnet distance={60} strength={0.2}>
            <Link
              href="/explore"
              className="px-8 py-4 bg-onyx hover:bg-carbon text-chalk hover:text-signal-lime border border-graphite hover:border-signal-lime/50 font-inter-tight font-medium text-[15px] uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{t('landing.final_cta.explore_community', 'Explore Community')}</span>
            </Link>
          </Magnet>
        </div>

        <div className="pt-8 border-t border-graphite/40 w-full flex flex-wrap items-center justify-center gap-6 text-ash font-jetbrains-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-lime" />
            {t('landing.final_cta.badge_free', '100% Free & Open Source')}
          </span>
          <span>·</span>
          <span>{t('landing.final_cta.badge_mit', 'MIT Licensed')}</span>
          <span>·</span>
          <span>{t('landing.final_cta.badge_zero_db', 'Zero Database Lock-In')}</span>
          <span>·</span>
          <span>{t('landing.final_cta.badge_edge', 'Edge CDN Speed')}</span>
        </div>
      </motion.div>
    </section>
  )
}

export default FinalCTA

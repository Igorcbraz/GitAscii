'use client'

import {
  Cpu,
  Layers,
  Moon,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { FeatureCard } from '@/components/ui/grid-feature-cards'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import { useI18n } from '@/i18n'

interface WhyGitAsciiProps {
  metrics?: LandingMetrics
}

export function WhyGitAscii({ metrics = DEFAULT_LANDING_METRICS }: WhyGitAsciiProps) {
  const { t } = useI18n()

  const features = [
    {
      title: t('landing.why.dynamic_title', 'Dynamic & Self-Updating'),
      icon: Zap,
      description: t(
        'landing.why.dynamic_desc',
        'Your profile never goes stale. Commits, stars, streaks, and languages are fetched from GitHub and rendered dynamically on serverless edge functions with high-speed CDN caching.'
      ),
    },
    {
      title: t('landing.why.theme_title', 'Automatic Light/Dark Mode'),
      icon: Moon,
      description: t(
        'landing.why.theme_desc',
        'Seamless switching between GitHub Dark and Light modes using standard HTML <picture> tags and media queries with zero layout shift.'
      ),
    },
    {
      title: t('landing.why.craft_title', 'High-Craft Design Without CSS'),
      icon: Sparkles,
      description: t(
        'landing.why.craft_desc',
        `Skip painful Markdown formatting. Choose from ${metrics.templates} designer presets tailored for software engineers and customize typography, layout, and colors visually.`
      ),
    },
    {
      title: t('landing.why.widgets_title', `${metrics.widgets}+ Dynamic Widgets`),
      icon: Layers,
      description: t(
        'landing.why.widgets_desc',
        'From live stats and vector ASCII portraits to collectible Pokémon developer cards, FIFA FUT scouting cards, and circadian night-owl telemetry.'
      ),
    },
    {
      title: t('landing.why.zerodb_title', 'Zero Database & Client-Safe'),
      icon: ShieldCheck,
      description: t(
        'landing.why.zerodb_desc',
        'Your configuration is stored directly as a clean gitascii.json file in your own GitHub profile repository. No proprietary database lock-in.'
      ),
    },
    {
      title: t('landing.why.oss_title', '100% MIT Open Source'),
      icon: Cpu,
      description: t(
        'landing.why.oss_desc',
        'Transparent, self-hostable, and free forever. Built for the developer community with continuous open source contributions.'
      ),
    },
  ]

  return (
    <section
      id="why-gitascii"
      className="relative z-10 w-full bg-carbon py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite"
    >
      <div className="mx-auto w-full max-w-7xl space-y-12">
        <AnimatedContainer className="mx-auto max-w-3xl text-center space-y-4">
          <span className="font-inter-tight font-medium text-eyebrow uppercase tracking-[0.22em] text-ash block">
            {t('landing.why.eyebrow', '[ WHY GITASCII ]')}
          </span>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.why.title_normal', 'Your GitHub Profile is More Than ')}
            <em className="italic text-signal-lime">
              {t('landing.why.title_italic', 'a README.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.why.subtitle',
              'Static Markdown tables are hard to maintain and break easily. GitAscii turns your developer profile into an interactive, high-craft visual statement that stays up to date forever.'
            )}
          </p>
        </AnimatedContainer>

        <AnimatedContainer
          delay={0.2}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </AnimatedContainer>

        <div className="pt-8 text-center flex flex-col items-center gap-3">
          <span className="font-jetbrains-mono text-[12px] text-ash">
            Want to see a direct technical breakdown against traditional README builders?
          </span>
          <Link
            href="/vs"
            className="inline-flex items-center gap-2 font-jetbrains-mono text-[12px] uppercase tracking-wider text-signal-lime hover:text-chalk font-semibold transition-colors"
          >
            <span>Compare GitAscii vs Readme.so vs GPRM Matrix</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: {
  className?: string
  delay?: number
  children: React.ReactNode
}) {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setShouldReduceMotion(mediaQuery.matches)
      const listener = (event: MediaQueryListEvent) => setShouldReduceMotion(event.matches)
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
  }, [])

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default WhyGitAscii

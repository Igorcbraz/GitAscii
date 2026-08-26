'use client'

import { ArrowRight, Compass, Cpu, Layers, Moon, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import React from 'react'

import { FeatureCard, type FeatureType } from '@/components/ui/grid-feature-cards'
import Magnet from '@/components/ui/Magnet'
import ShinyText from '@/components/ui/ShinyText'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import { useI18n } from '@/i18n'

interface EcosystemHubProps {
  metrics?: LandingMetrics
}

export function EcosystemHub({ metrics = DEFAULT_LANDING_METRICS }: EcosystemHubProps) {
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

  const features: FeatureType[] = [
    {
      title: t('landing.why.dynamic_title', 'Dynamic & Self-Updating'),
      icon: Zap,
      description: t(
        'landing.why.dynamic_desc',
        'Your profile never goes stale. Commits, stars, streaks, and languages are fetched from GitHub and rendered dynamically on serverless edge functions with high-speed CDN caching.'
      ),
      tag: t('landing.why.tag_edge', '// 01 · EDGE CDN'),
      actionText: t('landing.why.action_specs', 'Inspect Live Specs'),
    },
    {
      title: t('landing.why.theme_title', 'Automatic Light/Dark Mode'),
      icon: Moon,
      description: t(
        'landing.why.theme_desc',
        'Seamless switching between GitHub Dark and Light modes using standard HTML <picture> tags and media queries with zero layout shift.'
      ),
      tag: t('landing.why.tag_adaptive', '// 02 · ADAPTIVE'),
      actionText: t('landing.why.action_themes', 'Browse Themes'),
    },
    {
      title: t('landing.why.craft_title', 'High-Craft Design Without CSS'),
      icon: Sparkles,
      description: t(
        'landing.why.craft_desc',
        `Skip painful Markdown formatting. Choose from ${metrics.templates} designer presets tailored for software engineers and customize typography, layout, and colors visually.`,
        { count: String(metrics.templates) }
      ),
      tag: t('landing.why.tag_presets', `// 03 · ${metrics.templates} PRESETS`, {
        count: String(metrics.templates),
      }),
      actionText: t('landing.why.action_templates', 'Browse Templates'),
    },
    {
      title: t('landing.why.widgets_title', `${metrics.widgets}+ Dynamic Widgets`, {
        count: String(metrics.widgets),
      }),
      icon: Layers,
      description: t(
        'landing.why.widgets_desc',
        'From live stats and vector ASCII portraits to collectible Pokémon developer cards, FIFA FUT scouting cards, and circadian night-owl telemetry.'
      ),
      tag: t('landing.why.tag_widgets', `// 04 · ${metrics.widgets}+ WIDGETS`, {
        count: String(metrics.widgets),
      }),
      actionText: t('landing.why.action_widgets', 'Explore Widgets'),
    },
    {
      title: t('landing.why.zerodb_title', 'Zero Database & Client-Safe'),
      icon: ShieldCheck,
      description: t(
        'landing.why.zerodb_desc',
        'Your configuration is stored directly as a clean gitascii.json file in your own GitHub profile repository. No proprietary database lock-in.'
      ),
      tag: t('landing.why.tag_portable', '// 05 · PORTABLE'),
      actionText: t('landing.why.action_community', 'Explore Verified Community'),
    },
    {
      title: t('landing.why.oss_title', '100% MIT Open Source'),
      icon: Cpu,
      description: t(
        'landing.why.oss_desc',
        'Transparent, self-hostable, and free forever. Built for the developer community with continuous open source contributions.'
      ),
      tag: t('landing.why.tag_mit', '// 06 · MIT LICENSE'),
      actionText: t('landing.why.action_compare', 'Compare vs Alternatives'),
    },
  ]

  return (
    <section
      id="ecosystem"
      className="relative z-10 w-full bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60 overflow-hidden"
    >
      <div className="pointer-events-none absolute -top-40 right-1/4 w-[700px] h-[300px] bg-signal-lime/[0.02] blur-[120px] rounded-full" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-[0.2em]">
            <Compass className="w-3.5 h-3.5" />
            <ShinyText speed={3}>
              {t('landing.ecosystem.badge', '[ THE GITASCII ECOSYSTEM ]')}
            </ShinyText>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.ecosystem.title_start', 'Everything You Need to Build Your ')}
            <em className="italic text-signal-lime">
              {t('landing.ecosystem.title_highlight', 'Presence.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.ecosystem.subtitle',
              'Static Markdown tables break easily and go stale. GitAscii turns your developer profile into an interactive, high-craft visual statement that stays up to date forever.'
            )}
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              feature={feature}
              index={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            />
          ))}
        </motion.div>

        <div className="pt-2 text-center flex flex-col items-center gap-3">
          <span className="font-jetbrains-mono text-[12px] text-ash">
            {t(
              'landing.ecosystem.vs_question',
              'Want to see a direct technical breakdown against traditional README builders?'
            )}
          </span>
          <Link
            href="/vs"
            className="inline-flex items-center gap-2 font-jetbrains-mono text-[12px] uppercase tracking-wider text-signal-lime hover:text-chalk font-semibold transition-colors"
          >
            <span>
              {t('landing.ecosystem.vs_link', 'Compare GitAscii vs Readme.so vs GPRM Matrix')}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="p-8 sm:p-10 bg-void-black border border-graphite flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-jetbrains-mono text-[11px] text-signal-lime uppercase tracking-widest block">
              {t('landing.ecosystem.guarantee_badge', '[ ZERO LOCK-IN GUARANTEE ]')}
            </span>
            <h3 className="font-pt-serif font-light text-2xl text-chalk">
              {t(
                'landing.ecosystem.guarantee_title',
                'Ready to create your dynamic profile in 60 seconds?'
              )}
            </h3>
            <p className="font-inter-tight text-bone text-[14px]">
              {t(
                'landing.ecosystem.guarantee_desc',
                'No credit card, no database accounts, no complicated YAML configs.'
              )}
            </p>
          </div>

          <Magnet distance={60} strength={0.25}>
            <button
              onClick={handleScrollToHero}
              className="px-6 py-3.5 bg-signal-lime hover:bg-signal-lime-hover text-carbon font-inter-tight font-semibold text-[13px] uppercase tracking-wider flex items-center gap-2 shrink-0 transition-colors shadow-[0_0_20px_rgba(197,255,74,0.2)] cursor-pointer"
            >
              <span>{t('landing.ecosystem.guarantee_cta', 'Type Your GitHub Handle')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Magnet>
        </div>
      </div>
    </section>
  )
}

export default EcosystemHub

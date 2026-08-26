'use client'

import { FileText, LayoutGrid, Sparkles, Star, Users } from 'lucide-react'
import { motion } from 'motion/react'
import React from 'react'

import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { DEFAULT_LANDING_METRICS, type LandingMetrics } from '@/constants/metrics'
import { useI18n } from '@/i18n'

interface TractionBarProps {
  metrics?: LandingMetrics
}

export function TractionBar({ metrics = DEFAULT_LANDING_METRICS }: TractionBarProps) {
  const { t } = useI18n()

  const stats = [
    {
      icon: Star,
      value: metrics.stars,
      suffix: '+',
      label: t('landing.traction.stars', 'GitHub Stars'),
      subtext: t('landing.traction.stars_sub', 'Open source community'),
    },
    {
      icon: Users,
      value: metrics.users,
      suffix: '+',
      label: t('landing.traction.users', 'Active Developers'),
      subtext: t('landing.traction.users_sub', 'Building profiles'),
    },
    {
      icon: FileText,
      value: metrics.readmes,
      suffix: '+',
      label: t('landing.traction.readmes', 'READMEs Built'),
      subtext: t('landing.traction.readmes_sub', 'Edge SVGs generated'),
    },
    {
      icon: LayoutGrid,
      value: metrics.widgets,
      suffix: '+',
      label: t('landing.traction.widgets', 'SVG Widgets'),
      subtext: t('landing.traction.widgets_sub', '11 core categories'),
    },
    {
      icon: Sparkles,
      value: metrics.templates,
      suffix: '',
      label: t('landing.traction.templates', 'Design Templates'),
      subtext: t('landing.traction.templates_sub', 'Production ready'),
    },
  ]

  return (
    <section
      id="traction"
      className="relative z-20 w-full bg-carbon border-y border-graphite/30"
      aria-label="GitAscii Traction Metrics"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 divide-y sm:divide-y-0 divide-graphite/40 sm:divide-x sm:divide-graphite/40">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                className={`flex flex-col items-center text-center group cursor-default transition-colors ${
                  i > 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''
                } ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2 text-signal-lime group-hover:text-chalk transition-colors">
                  <Icon
                    className="w-4 h-4 opacity-90 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span className="font-jetbrains-mono text-[10px] tracking-[0.25em] uppercase text-ash group-hover:text-signal-lime transition-colors">
                    [ 0{i + 1} ]
                  </span>
                </div>

                <div className="font-pt-serif font-light text-3xl sm:text-4xl text-chalk tracking-tight flex items-baseline justify-center group-hover:text-signal-lime transition-colors duration-200">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2.8}
                    delay={0.15 + i * 0.08}
                  />
                </div>

                <span className="font-inter-tight font-medium text-[12px] sm:text-caption uppercase tracking-[0.16em] text-bone mt-1 group-hover:text-white transition-colors">
                  {stat.label}
                </span>

                <span className="font-jetbrains-mono text-[10px] text-ash/80 mt-0.5 hidden sm:inline group-hover:text-ash transition-colors">
                  {stat.subtext}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TractionBar

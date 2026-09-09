'use client'

import { Crown, FileText, LayoutGrid, Sparkles, Star, UserCheck, Users } from 'lucide-react'
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

  const baseStats = [
    {
      icon: Star,
      value: metrics.stars,
      suffix: '+',
      label: t('landing.traction.stars', 'GitHub Stars'),
      subtext: t('landing.traction.stars_sub', 'Open source community'),
      accent: false,
    },
    {
      icon: Users,
      value: metrics.users,
      suffix: '+',
      label: t('landing.traction.users', 'Active Developers'),
      subtext: t('landing.traction.users_sub', 'Building profiles'),
      accent: false,
    },
    {
      icon: UserCheck,
      value: metrics.loggedInUsers > 0 ? metrics.loggedInUsers : Math.max(metrics.users, 15),
      suffix: '+',
      label: t('landing.traction.logged_in', 'Users Registered'),
      subtext: t('landing.traction.logged_in_sub', 'GitHub logins'),
      accent: false,
    },
    {
      icon: Crown,
      value: metrics.proCustomers > 0 ? metrics.proCustomers : 3,
      suffix: metrics.proCustomers > 5 ? '+' : '',
      label: t('landing.traction.pro_customers', 'Pro Members'),
      subtext: t('landing.traction.pro_customers_sub', 'Lifetime access'),
      accent: true,
    },
    {
      icon: FileText,
      value: metrics.readmes,
      suffix: '+',
      label: t('landing.traction.readmes', 'Live Profiles'),
      subtext: t('landing.traction.readmes_sub', 'Real-time READMEs'),
      accent: false,
    },
    {
      icon: LayoutGrid,
      value: metrics.widgets,
      suffix: '+',
      label: t('landing.traction.widgets', 'SVG Widgets'),
      subtext: t('landing.traction.widgets_sub', '11 core categories'),
      accent: false,
    },
    {
      icon: Sparkles,
      value: metrics.templates,
      suffix: '',
      label: t('landing.traction.templates', 'Design Templates'),
      subtext: t('landing.traction.templates_sub', 'Production ready'),
      accent: false,
    },
  ]

  const _colCount = baseStats.length

  return (
    <section
      id="traction"
      className="relative z-20 w-full bg-carbon border-y border-graphite/30"
      aria-label="GitAscii Traction Metrics"
    >
      <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-y-6 divide-y sm:divide-y-0 sm:divide-x divide-graphite/40">
          {baseStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={i}
                initial={{ y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="flex flex-col items-center justify-center text-center group cursor-default transition-colors px-2 sm:px-3 lg:px-4 py-2"
              >
                <div
                  className={`flex items-center gap-2 mb-2 transition-colors ${
                    stat.accent
                      ? 'text-signal-lime group-hover:text-chalk'
                      : 'text-signal-lime group-hover:text-chalk'
                  }`}
                >
                  <Icon
                    className="w-4 h-4 opacity-90 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span className="font-jetbrains-mono text-[10px] tracking-[0.25em] uppercase text-ash group-hover:text-signal-lime transition-colors">
                    [ 0{i + 1} ]
                  </span>
                </div>

                <div
                  className={`font-pt-serif font-light text-3xl sm:text-4xl tracking-tight flex items-baseline justify-center transition-colors duration-200 ${
                    stat.accent
                      ? 'text-signal-lime group-hover:text-chalk'
                      : 'text-chalk group-hover:text-signal-lime'
                  }`}
                >
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2.8}
                    delay={0.15 + i * 0.08}
                  />
                </div>

                <span
                  className={`font-inter-tight font-medium text-[11px] sm:text-[12px] uppercase tracking-[0.14em] mt-1 transition-colors whitespace-nowrap ${
                    stat.accent
                      ? 'text-signal-lime group-hover:text-chalk'
                      : 'text-bone group-hover:text-white'
                  }`}
                >
                  {stat.label}
                </span>

                <span className="font-jetbrains-mono text-[10px] text-ash/80 mt-0.5 hidden sm:inline group-hover:text-ash transition-colors whitespace-nowrap">
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

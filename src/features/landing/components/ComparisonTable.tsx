'use client'

import { ArrowRight, Check, Minus, Sparkles, X } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import React from 'react'

import { SUMMARY_VS_MATRIX_RAW } from '@/constants/landing'
import { useI18n } from '@/i18n'

export function ComparisonTable() {
  const { t } = useI18n()

  const renderBadge = (val: string) => {
    switch (val) {
      case 'included':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-signal-lime/10 border border-signal-lime/40 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-wider font-semibold">
            <Check className="w-3.5 h-3.5" />
            {t('vs.badge.included', 'Included')}
          </span>
        )
      case 'manual':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-graphite text-ash font-jetbrains-mono text-[11px] uppercase tracking-wider">
            <Minus className="w-3 h-3" />
            {t('vs.badge.manual', 'Manual Setup')}
          </span>
        )
      case 'no':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-graphite text-ash/60 font-jetbrains-mono text-[11px] uppercase tracking-wider">
            <X className="w-3.5 h-3.5 text-red-400/60" />
            {t('vs.badge.no', 'No')}
          </span>
        )
      case 'form':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-graphite text-ash font-jetbrains-mono text-[11px] uppercase tracking-wider">
            {t('vs.badge.form', 'Form Based')}
          </span>
        )
      case 'requires_db':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-graphite text-ash font-jetbrains-mono text-[11px] uppercase tracking-wider">
            {t('vs.badge.requires_db', 'Requires DB')}
          </span>
        )
      case 'mit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-signal-lime/10 border border-signal-lime/40 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-wider font-semibold">
            {t('vs.badge.mit', 'MIT License')}
          </span>
        )
      case 'open_source':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-carbon border border-graphite text-ash font-jetbrains-mono text-[11px] uppercase tracking-wider">
            {t('vs.badge.open_source', 'Open Source')}
          </span>
        )
      default:
        return <span className="font-jetbrains-mono text-[11px] text-ash">{val}</span>
    }
  }

  return (
    <section
      id="comparison"
      className="relative z-10 w-full bg-transparent py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-graphite/60"
    >
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-signal-lime/5 border border-signal-lime/20 text-signal-lime font-jetbrains-mono text-[11px] uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('landing.comparison.badge', '[ ARCHITECTURAL MATRIX ]')}</span>
          </div>

          <h2 className="font-pt-serif font-light text-3xl sm:text-heading leading-[0.95] tracking-[-0.02em] text-chalk">
            {t('landing.comparison.title_start', 'Engineered for ')}
            <em className="italic text-signal-lime">
              {t('landing.comparison.title_highlight', 'Edge Performance.')}
            </em>
          </h2>

          <p className="font-inter-tight text-body text-bone leading-body max-w-xl mx-auto">
            {t(
              'landing.comparison.subtitle',
              'See how GitAscii compares against traditional static README generators and form-based tools.'
            )}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-onyx border border-graphite shadow-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-void-black border-b border-graphite">
                  <th className="py-4 px-6 font-jetbrains-mono text-[11px] uppercase tracking-[0.2em] text-ash w-2/5">
                    {t('landing.comparison.th_capability', 'Architectural Capability')}
                  </th>
                  <th className="py-4 px-6 font-jetbrains-mono text-[12px] uppercase tracking-wider text-signal-lime bg-signal-lime/5 border-x border-graphite w-1/5">
                    ★ GitAscii
                  </th>
                  <th className="py-4 px-6 font-jetbrains-mono text-[11px] uppercase tracking-wider text-ash w-1/5">
                    Readme.so
                  </th>
                  <th className="py-4 px-6 font-jetbrains-mono text-[11px] uppercase tracking-wider text-ash w-1/5">
                    GPRM
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/60">
                {SUMMARY_VS_MATRIX_RAW.map((row, idx) => {
                  const label = t(row.featureKey, row.featureEn)
                  return (
                    <motion.tr
                      key={row.featureKey}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="hover:bg-carbon/80 transition-colors group"
                    >
                      <td className="py-4 px-6 font-inter-tight font-medium text-[14px] text-chalk group-hover:text-white transition-colors">
                        {label}
                      </td>
                      <td className="py-4 px-6 bg-signal-lime/5 border-x border-graphite font-jetbrains-mono">
                        {renderBadge(row.gitascii)}
                      </td>
                      <td className="py-4 px-6 font-jetbrains-mono">{renderBadge(row.readme)}</td>
                      <td className="py-4 px-6 font-jetbrains-mono">{renderBadge(row.gprm)}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 bg-carbon border-t border-graphite flex flex-wrap items-center justify-between gap-3">
            <span className="font-jetbrains-mono text-[12px] text-ash">
              {t(
                'landing.comparison.footer_desc',
                'Detailed technical breakdown and benchmark analysis:'
              )}
            </span>

            <Link
              href="/vs"
              className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[12px] uppercase tracking-wider text-signal-lime hover:text-chalk font-semibold transition-colors"
            >
              <span>{t('landing.comparison.footer_link', 'Explore Full Comparison Matrix')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ComparisonTable

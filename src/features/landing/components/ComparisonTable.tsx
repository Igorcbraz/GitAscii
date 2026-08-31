'use client'

import { ArrowRight, Check, Minus, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'

import { getProPricing, LANDING_COMPARISON, PRO_PRICING_CONFIG } from '@/constants'
import { useI18n } from '@/i18n'

export function ProPricingSection() {
  const { t, language } = useI18n()
  const pricing = getProPricing(language)

  const renderCell = (value: string | boolean, isPro: boolean, key?: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-4 h-4 mx-auto ${isPro ? 'text-signal-lime' : 'text-bone/70'}`} />
      ) : (
        <Minus className="w-4 h-4 mx-auto text-graphite" />
      )
    }
    const displayValue = key ? t(key, value) : value
    return (
      <span
        className={`font-inter-tight text-[12px] sm:text-[13px] ${
          isPro ? 'text-signal-lime font-medium' : 'text-ash'
        }`}
      >
        {displayValue}
      </span>
    )
  }

  return (
    <section id="pricing" className="relative z-10 w-full py-24 md:py-36 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-signal-lime shadow-[0_0_20px_rgba(197,255,74,0.5)]" />

      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden border border-signal-lime/20 bg-gradient-to-b from-onyx via-carbon to-void-black"
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-signal-lime/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-48 h-48 bg-signal-lime/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between px-5 sm:px-8 py-3 border-b border-signal-lime/10 bg-void-black/60">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-signal-lime" />
              <span className="font-jetbrains-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-signal-lime font-medium">
                {t('landing.pricing.badge', '[ GITASCII PRO · LIFETIME ACCESS ]')}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-signal-lime/60 animate-pulse" />
              <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash">
                {t('landing.pricing.status', 'AVAILABLE NOW')}
              </span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-0">
            <div className="lg:col-span-3 px-6 sm:px-10 lg:px-12 py-10 sm:py-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-graphite/30">
              <h2 className="font-pt-serif font-light text-3xl sm:text-4xl lg:text-[46px] leading-[0.95] tracking-[-0.02em] text-chalk mb-5">
                {t('landing.pricing.title_start', 'Stop guessing if anyone sees your work. ')}
                <em className="italic text-signal-lime">
                  {t('landing.pricing.title_highlight', 'Now you know.')}
                </em>
              </h2>
              <p className="font-inter-tight text-body text-bone/80 leading-relaxed max-w-lg mb-6">
                {t(
                  'landing.pricing.subtitle',
                  "You built a beautiful README. Now find out who's actually reading it — and never discover a broken widget from a recruiter. Create separate profiles for the AWS Summit, an open source launch, GitHub Sponsors pitch decks. Pay once, own it forever."
                )}
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <ShieldCheck className="w-3 h-3 text-signal-lime/70" />
                  {t('landing.pricing.guarantee', '14-Day Full Refund')}
                </span>
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <Sparkles className="w-3 h-3 text-signal-lime/70" />
                  {t('landing.pricing.lifetime', 'Every Future Feature Included')}
                </span>
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <Check className="w-3 h-3 text-signal-lime/70" />
                  {t('landing.pricing.no_recurring', 'No Subscription. Ever.')}
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 px-6 sm:px-10 lg:px-10 py-10 sm:py-14 flex flex-col items-center justify-center text-center bg-onyx/30 relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-lime/30 to-transparent lg:hidden" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 bg-signal-lime text-carbon font-jetbrains-mono text-[10px] uppercase font-bold tracking-widest shadow-[0_0_12px_rgba(197,255,74,0.4)]">
                <Zap className="w-3 h-3 fill-carbon" />
                {t('landing.pricing.discount', 'SPECIAL OFFER — {pct}% OFF', {
                  pct: String(PRO_PRICING_CONFIG.discountPercentage),
                })}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-ash line-through font-inter-tight text-lg">
                  {pricing.originalPriceFormatted}
                </span>
                <span className="text-chalk font-inter-tight text-6xl sm:text-7xl font-bold tracking-tight leading-none">
                  {pricing.priceFormatted}
                </span>
              </div>
              <p className="font-jetbrains-mono text-[11px] text-ash uppercase tracking-wider mb-7">
                {t('landing.pricing.one_time', 'One-time payment · Own it forever')}
              </p>

              <Link
                href="/pro"
                className="w-full max-w-xs inline-flex items-center justify-center gap-2.5 py-3.5 px-6 bg-signal-lime text-carbon font-inter-tight font-semibold text-[15px] rounded-sm transition-all duration-300 shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:shadow-[0_0_24px_rgba(197,255,74,0.6)] hover:brightness-110 active:scale-[0.98] cursor-pointer group whitespace-nowrap"
              >
                <Zap className="w-4 h-4 fill-carbon shrink-0" />
                <span className="whitespace-nowrap">
                  {t('landing.pricing.cta', 'Get Lifetime Access')}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>

              <p className="mt-3 font-inter-tight text-[11px] text-ash">
                {t('landing.pricing.cta_note', 'GitHub login required. Instant activation.')}
              </p>
            </div>
          </div>

          <div className="border-t border-graphite/40">
            <div className="flex items-center gap-3 px-6 sm:px-10 lg:px-12 py-4 bg-void-black/40 border-b border-graphite/30">
              <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.22em] text-signal-lime">
                {t('landing.pricing.table_badge', '[ FREE VS PRO ]')}
              </span>
              <span className="flex-1 h-px bg-graphite/30" />
              <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash hidden sm:block">
                {t('landing.pricing.table_count', '16 FEATURES COMPARED')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[580px]">
                <thead>
                  <tr className="border-b border-graphite/40">
                    <th className="py-3.5 px-6 sm:px-10 lg:px-12 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-ash w-[50%]">
                      {t('landing.pricing.th_feature', 'Feature')}
                    </th>
                    <th className="py-3.5 px-4 sm:px-6 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-bone text-center w-[25%]">
                      {t('landing.pricing.th_free', 'Free')}
                    </th>
                    <th className="py-3.5 px-4 sm:px-6 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime text-center w-[25%] bg-signal-lime/[0.03]">
                      {t('landing.pricing.th_pro', 'Pro · {price}', {
                        price: pricing.priceFormatted,
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LANDING_COMPARISON.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.02, duration: 0.3 }}
                      className="border-b border-graphite/20 hover:bg-onyx/20 transition-colors"
                    >
                      <td className="py-3 px-6 sm:px-10 lg:px-12 font-inter-tight text-[13px] text-bone/90">
                        {t(`landing.pricing.row.${row.id}`, row.feature)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        {renderCell(row.free, false, row.freeKey)}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center bg-signal-lime/[0.03]">
                        {renderCell(row.pro, true, row.proKey)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 sm:px-10 lg:px-12 py-5 bg-void-black/40 border-t border-graphite/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-signal-lime" />
              <span className="font-inter-tight text-[13px] text-bone/70">
                {t(
                  'landing.pricing.bottom_text',
                  'The only README platform with analytics. Pay $19 once — every new feature ships to you, free, forever.'
                )}
              </span>
            </div>
            <Link
              href="/pro"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-lime text-carbon font-inter-tight font-semibold text-[13px] rounded-sm transition-all duration-300 shadow-[0_0_8px_rgba(197,255,74,0.45)] hover:shadow-[0_0_18px_rgba(197,255,74,0.55)] hover:brightness-110 active:scale-[0.98] cursor-pointer group shrink-0"
            >
              <span>{t('landing.pricing.bottom_cta', 'See Full Details')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProPricingSection

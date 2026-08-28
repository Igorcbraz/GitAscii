'use client'

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Cpu,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  Minus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import { PRO_PRICING_CONFIG, type ProFeatureItem } from '../constants/pricing'

export interface ProPaywallProps {
  username?: string
  isUpgrading: boolean
  upgradeSuccess: boolean
  onUpgrade: () => void
}

export const ProPaywall: React.FC<ProPaywallProps> = ({
  username,
  isUpgrading,
  upgradeSuccess,
  onUpgrade,
}) => {
  const { t } = useI18n()
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id))
  }

  const getFeatureIcon = (id: string) => {
    switch (id) {
      case 'analytics':
        return <BarChart3 className="w-4 h-4 text-signal-lime" />
      case 'monitor':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case 'profiles':
        return <Layers className="w-4 h-4 text-cyan-400" />
      case 'cdn':
        return <Cpu className="w-4 h-4 text-emerald-400" />
      case 'reports':
        return <FileText className="w-4 h-4 text-violet-400" />
      case 'updates':
      default:
        return <Sparkles className="w-4 h-4 text-signal-lime" />
    }
  }

  const renderCell = (value: string | boolean, isPro: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className={`w-4 h-4 mx-auto ${isPro ? 'text-signal-lime' : 'text-bone/70'}`} />
      ) : (
        <Minus className="w-4 h-4 mx-auto text-graphite" />
      )
    }
    return (
      <span
        className={`font-inter-tight text-[12px] sm:text-[13px] ${
          isPro ? 'text-signal-lime font-medium' : 'text-ash'
        }`}
      >
        {value}
      </span>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-carbon text-chalk px-4 py-8 sm:px-6 sm:py-12 lg:px-10 select-none">
      <div className="w-full max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden border border-signal-lime/20 bg-gradient-to-b from-onyx via-carbon to-void-black shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-signal-lime shadow-[0_0_24px_rgba(197,255,74,0.6)]" />

          <div className="absolute -top-32 -right-32 w-72 h-72 bg-signal-lime/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-56 h-56 bg-signal-lime/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between px-5 sm:px-8 py-3 border-b border-signal-lime/15 bg-void-black/70">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-signal-lime" />
              <span className="font-jetbrains-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-signal-lime font-medium">
                {t('pro.pricing.badge', PRO_PRICING_CONFIG.badge)}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-signal-lime animate-pulse shadow-[0_0_8px_rgba(197,255,74,0.8)]" />
              <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash">
                {t('landing.pricing.status', 'AVAILABLE NOW · LIFETIME ACCESS')}
              </span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 px-6 sm:px-10 lg:px-12 py-10 sm:py-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-graphite/30">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-signal-lime/10 border border-signal-lime/30 text-[11px] font-jetbrains-mono text-signal-lime tracking-wider uppercase">
                  <Terminal className="w-3 h-3 text-signal-lime" />
                  <span>{t('pro.pricing.tier_name', 'GITASCII PRO ECOSYSTEM')}</span>
                </div>

                <h1 className="font-pt-serif font-light text-3xl sm:text-4xl lg:text-[44px] leading-[1.02] tracking-[-0.02em] text-chalk">
                  {t('pro.pricing.hero_title_part1', 'Complete Telemetry & ')}
                  <em className="italic text-signal-lime">
                    {t('pro.pricing.hero_title_part2', 'Multi-Profile Architecture.')}
                  </em>
                </h1>

                <p className="font-inter-tight text-body text-bone/80 leading-relaxed max-w-xl text-[14px] sm:text-[15px]">
                  {t(
                    'pro.pricing.hero_desc_extended',
                    'Upgrade your developer presence with real-time cookieless analytics, 24/7 automated widget error monitoring, up to 10 isolated profiles, and instant GitHub Camo edge invalidation. One single payment — yours forever.'
                  )}
                </p>

                <div className="space-y-3 pt-2 text-[13px] sm:text-[14px] font-inter-tight text-bone/90">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime shrink-0 mt-0.5 shadow-[0_0_6px_rgba(197,255,74,0.2)]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-chalk font-semibold">
                        {t('pro.pricing.bullet1_title', 'Cookieless Telemetry & 90-Day Retention:')}
                      </strong>{' '}
                      <span className="text-ash">
                        {t(
                          'pro.pricing.bullet1_desc',
                          'Real-time unique visitors, interactive 7x24 heatmaps, country maps, and referrer analytics.'
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime shrink-0 mt-0.5 shadow-[0_0_6px_rgba(197,255,74,0.2)]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-chalk font-semibold">
                        {t('pro.pricing.bullet2_title', '24/7 Sentinel Health & Email Alerts:')}
                      </strong>{' '}
                      <span className="text-ash">
                        {t(
                          'pro.pricing.bullet2_desc',
                          'Automated background health checks alert you immediately when external badges or APIs break.'
                        )}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime shrink-0 mt-0.5 shadow-[0_0_6px_rgba(197,255,74,0.2)]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      <strong className="text-chalk font-semibold">
                        {t('pro.pricing.bullet3_title', '10 Profiles & Instant Camo Purge:')}
                      </strong>{' '}
                      <span className="text-ash">
                        {t(
                          'pro.pricing.bullet3_desc',
                          'Deploy dedicated profiles for Work, OSS, and Personal with sub-10ms global edge cache purging.'
                        )}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-graphite/30 flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <ShieldCheck className="w-3.5 h-3.5 text-signal-lime/80" />
                  {t('pro.pricing.guarantee_text', '{days}-Day Money-Back Guarantee', {
                    days: String(PRO_PRICING_CONFIG.guaranteeDays),
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <Sparkles className="w-3.5 h-3.5 text-signal-lime/80" />
                  {t('landing.pricing.lifetime', 'Lifetime Updates Included')}
                </span>
                <span className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-wider text-ash">
                  <Check className="w-3.5 h-3.5 text-signal-lime/80" />
                  {t('landing.pricing.no_recurring', '$0/month Forever')}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 px-6 sm:px-10 lg:px-10 py-10 sm:py-12 flex flex-col items-center justify-center text-center bg-onyx/30 relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-signal-lime/30 to-transparent lg:hidden" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 bg-signal-lime text-carbon font-jetbrains-mono text-[10px] uppercase font-bold tracking-widest shadow-[0_0_12px_rgba(197,255,74,0.4)]">
                <Zap className="w-3 h-3 fill-carbon" />
                <span>
                  {t('pro.pricing.discount_badge', 'SPECIAL OFFER — {pct}% OFF', {
                    pct: String(PRO_PRICING_CONFIG.discountPercentage),
                  })}
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-ash line-through font-inter-tight text-xl">
                  {PRO_PRICING_CONFIG.originalPriceFormatted}
                </span>
                <span className="text-chalk font-inter-tight text-6xl sm:text-7xl font-bold tracking-tight leading-none">
                  {PRO_PRICING_CONFIG.priceFormatted}
                </span>
                <span className="text-xs font-jetbrains-mono uppercase text-signal-lime font-bold bg-signal-lime/10 px-2 py-0.5 rounded-sm">
                  {PRO_PRICING_CONFIG.currency}
                </span>
              </div>

              <p className="font-jetbrains-mono text-[11px] text-ash uppercase tracking-wider mb-6">
                {t('pro.pricing.one_time_label', 'One-time payment · Own it forever')}
              </p>

              <div className="w-full max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={onUpgrade}
                  disabled={isUpgrading || upgradeSuccess}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 bg-signal-lime text-carbon font-inter-tight font-semibold text-[15px] rounded-sm transition-all duration-300 shadow-[0_0_14px_rgba(197,255,74,0.45)] hover:shadow-[0_0_24px_rgba(197,255,74,0.65)] hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                >
                  {upgradeSuccess ? (
                    <>
                      <Sparkles className="w-4 h-4 text-carbon animate-spin" />
                      <span>
                        {t('pro.guard.paywall.success', 'Pro Plan Activated! Loading...')}
                      </span>
                    </>
                  ) : isUpgrading ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-carbon animate-spin" />
                      <span>{t('pro.guard.paywall.processing', 'Processing Upgrade...')}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-carbon shrink-0" />
                      <span>{t('pro.pricing.cta_button', 'Get GitAscii Pro Lifetime')}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] font-inter-tight text-ash">
                  <Lock className="w-3 h-3 text-signal-lime/70" />
                  <span>
                    {username
                      ? t(
                          'pro.pricing.cta_footer_note',
                          'Instant unlock for @{username}. No subscriptions.',
                          { username }
                        )
                      : t('landing.pricing.cta_note', 'GitHub login required. Instant activation.')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative overflow-hidden border border-graphite/40 bg-onyx/30 p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-6 border-b border-graphite/30">
            <Cpu className="w-4 h-4 text-signal-lime" />
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.2em] text-signal-lime font-medium">
              {t('pro.pricing.arch_badge', '[ ARCHITECTURE & DATA PIPELINE ]')}
            </span>
            <span className="flex-1 h-px bg-graphite/30" />
            <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash hidden md:block">
              {t('pro.pricing.arch_latency', 'SUB-10MS EDGE LATENCY · ZERO RUNTIME DB LOCK-IN')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="space-y-2 relative">
              <div className="font-jetbrains-mono text-[10px] text-signal-lime font-semibold tracking-wider">
                01 / EDGE SVG RUNTIME
              </div>
              <h4 className="font-inter-tight font-semibold text-[14px] text-chalk">
                {t('pro.pricing.arch_1_title', 'Dynamic Global Edge Rendering')}
              </h4>
              <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                {t(
                  'pro.pricing.arch_1_desc',
                  'GitHub profile SVGs are generated directly at low-latency edge regions closest to your profile visitors with ETag 304 caching.'
                )}
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="font-jetbrains-mono text-[10px] text-signal-lime font-semibold tracking-wider">
                02 / COOKIELESS TELEMETRY
              </div>
              <h4 className="font-inter-tight font-semibold text-[14px] text-chalk">
                {t('pro.pricing.arch_2_title', 'Salt-Hashed Traffic Ingestion')}
              </h4>
              <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                {t(
                  'pro.pricing.arch_2_desc',
                  'IPs and user agents are hashed daily with rotating salt seeds. Delivers granular country and referrer metrics without GDPR banners.'
                )}
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="font-jetbrains-mono text-[10px] text-signal-lime font-semibold tracking-wider">
                03 / SENTINEL CRON MONITOR
              </div>
              <h4 className="font-inter-tight font-semibold text-[14px] text-chalk">
                {t('pro.pricing.arch_3_title', '24/7 External Badges Health')}
              </h4>
              <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                {t(
                  'pro.pricing.arch_3_desc',
                  'Continuous background health probes monitor every external badge and third-party API in your profile, alerting you on timeouts.'
                )}
              </p>
            </div>

            <div className="space-y-2 relative">
              <div className="font-jetbrains-mono text-[10px] text-signal-lime font-semibold tracking-wider">
                04 / CAMO PURGE WEBHOOK
              </div>
              <h4 className="font-inter-tight font-semibold text-[14px] text-chalk">
                {t('pro.pricing.arch_4_title', 'Instant GitHub Camo Invalidation')}
              </h4>
              <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                {t(
                  'pro.pricing.arch_4_desc',
                  'Instantly purge stale GitHub proxy caches when you change themes, layouts, or switch active profiles.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-graphite/30">
            <div>
              <div className="inline-flex items-center gap-1.5 font-jetbrains-mono text-[10px] uppercase tracking-[0.2em] text-signal-lime mb-1">
                <Sparkles className="w-3 h-3 text-signal-lime" />
                <span>{t('pro.pricing.feat_badge', '[ DEEP-DIVE CAPABILITIES ]')}</span>
              </div>
              <h2 className="font-pt-serif font-light text-2xl sm:text-3xl text-chalk tracking-tight">
                {t('pro.pricing.benefits_title', 'Everything included in your Lifetime License')}
              </h2>
            </div>
            <p className="font-inter-tight text-ash text-xs sm:text-sm max-w-md">
              {t(
                'pro.pricing.benefits_subtitle',
                'Engineered for developers who take their GitHub brand, reliability, and telemetry seriously.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRO_PRICING_CONFIG.features.map((feat: ProFeatureItem) => (
              <div
                key={feat.id}
                className="p-6 rounded-none bg-gradient-to-b from-onyx/50 to-carbon/80 border border-graphite/40 hover:border-signal-lime/40 transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-sm bg-void-black/80 border border-graphite/40 group-hover:border-signal-lime/30 transition-colors">
                      {getFeatureIcon(feat.id)}
                    </div>
                    {feat.tag && (
                      <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash group-hover:text-signal-lime transition-colors">
                        {feat.tag}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-inter-tight font-semibold text-[15px] text-chalk group-hover:text-signal-lime transition-colors mb-1.5">
                      {t(feat.titleKey, feat.titleDefault)}
                    </h3>
                    <p className="font-inter-tight text-[12px] text-ash leading-relaxed">
                      {t(feat.descKey, feat.descDefault)}
                    </p>
                  </div>

                  {feat.specs && feat.specs.length > 0 && (
                    <div className="pt-3 border-t border-graphite/20 space-y-1.5">
                      {feat.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 text-[11px] font-jetbrains-mono text-bone/80"
                        >
                          <span className="w-1 h-1 rounded-full bg-signal-lime/70" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-graphite/20 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-jetbrains-mono text-[10px] uppercase tracking-wider text-signal-lime font-medium">
                    {feat.badge}
                  </span>
                  <span className="font-jetbrains-mono text-[9px] uppercase text-graphite">
                    PRO TIER ONLY
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden border border-graphite/40 bg-gradient-to-b from-onyx/40 via-carbon to-void-black">
          <div className="flex items-center gap-3 px-6 sm:px-8 py-4 bg-void-black/60 border-b border-graphite/30">
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.22em] text-signal-lime font-medium">
              {t('landing.pricing.table_badge', '[ FREE VS PRO COMPARISON MATRIX ]')}
            </span>
            <span className="flex-1 h-px bg-graphite/30" />
            <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-ash hidden sm:block">
              {t('pro.pricing.table_count', '12 DETAILED SPECIFICATIONS')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-graphite/40 bg-void-black/40">
                  <th className="py-3.5 px-6 sm:px-8 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-ash w-[50%]">
                    {t('pro.pricing.table_feature', 'Capability / Feature')}
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-bone text-center w-[25%]">
                    {t('pro.pricing.table_free', 'Free Tier')}
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime text-center w-[25%] bg-signal-lime/[0.03]">
                    {t('pro.pricing.table_pro', 'GitAscii Pro (Lifetime · {price})', {
                      price: PRO_PRICING_CONFIG.priceFormatted,
                    })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRO_PRICING_CONFIG.comparison.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="border-b border-graphite/20 hover:bg-onyx/30 transition-colors"
                  >
                    <td className="py-3.5 px-6 sm:px-8 font-inter-tight text-[13px] text-bone/90">
                      {t(row.featureKey, row.featureDefault)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {renderCell(row.free, false)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center bg-signal-lime/[0.03]">
                      {renderCell(row.pro, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b border-graphite/30">
            <HelpCircle className="w-4 h-4 text-signal-lime" />
            <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.2em] text-signal-lime font-medium">
              {t('pro.pricing.faq_badge', '[ FREQUENTLY ASKED QUESTIONS ]')}
            </span>
            <span className="flex-1 h-px bg-graphite/30" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {PRO_PRICING_CONFIG.faqs.map((faq) => {
              const isOpen = openFaq === faq.id
              return (
                <div
                  key={faq.id}
                  className="border border-graphite/40 bg-onyx/20 hover:border-graphite/60 transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-[13px] sm:text-[14px] font-inter-tight font-semibold text-chalk hover:text-signal-lime transition-colors cursor-pointer"
                  >
                    <span>{t(faq.questionKey, faq.questionDefault)}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-ash transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-signal-lime' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-[12px] sm:text-[13px] text-ash font-inter-tight leading-relaxed border-t border-graphite/20">
                      {t(faq.answerKey, faq.answerDefault)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-graphite/30 pt-8 pb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-inter-tight font-semibold text-[13px] text-chalk">
                {t('pro.pricing.guarantee_title', '100% Risk-Free 14-Day Money-Back Guarantee')}
              </p>
              <p className="font-inter-tight text-[11px] text-ash">
                {t(
                  'pro.pricing.guarantee_desc',
                  'If GitAscii Pro does not elevate your profile, email us for an unconditional refund.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={username ? `/${username}` : '/'}
              className="font-jetbrains-mono text-[11px] uppercase tracking-wider text-ash hover:text-chalk transition-colors underline-offset-4 hover:underline"
            >
              {username
                ? t('pro.guard.paywall.back_editor', '← Return to Editor')
                : t('pro.guard.paywall.back_home', '← Return to Home')}
            </Link>

            <button
              type="button"
              onClick={onUpgrade}
              disabled={isUpgrading || upgradeSuccess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-signal-lime text-carbon font-inter-tight font-semibold text-[13px] rounded-sm transition-all duration-300 shadow-[0_0_10px_rgba(197,255,74,0.4)] hover:shadow-[0_0_20px_rgba(197,255,74,0.6)] hover:brightness-110 active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-carbon" />
              <span>
                {t('pro.pricing.cta_button_short', 'Get Lifetime Access · {price}', {
                  price: PRO_PRICING_CONFIG.priceFormatted,
                })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

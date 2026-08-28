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
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import { PRO_PRICING_CONFIG } from '../constants/pricing'
import { ProBadge } from './ProBadge'

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
        return <BarChart3 className="w-4 h-4 text-[#c5ff4a]" />
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
        return <Sparkles className="w-4 h-4 text-[#c5ff4a]" />
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#070707] text-[#e5e5e5] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 select-none">
      <div className="max-w-5xl mx-auto space-y-10 sm:space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#c5ff4a] tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('pro.pricing.hero_badge', PRO_PRICING_CONFIG.badge)}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {t('pro.pricing.hero_title', 'Unlock GitAscii Pro for Life')}
          </h1>

          <p className="text-sm sm:text-base text-[#9a9a9a] max-w-2xl mx-auto leading-relaxed">
            {t(
              'pro.pricing.hero_desc',
              'Advanced telemetry, 24/7 widget error monitoring, multi-profile architecture, and global edge cache purging. One single payment, no recurring fees.'
            )}
          </p>
        </div>

        <div className="relative rounded-2xl bg-[#0e0e0e] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {PRO_PRICING_CONFIG.planName}
                  </h2>
                  <ProBadge variant="lime">
                    {t('pro.pricing.plan_lifetime_tag', 'LIFETIME ACCESS')}
                  </ProBadge>
                </div>
                <p className="text-xs sm:text-sm text-[#8a8a8a] leading-relaxed">
                  {t(
                    'pro.pricing.card_sub',
                    'Permanent access to all Pro features with zero monthly subscriptions. Includes future updates and priority edge processing.'
                  )}
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#ccc]">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#c5ff4a]/10 border border-[#c5ff4a]/20 flex items-center justify-center text-[#c5ff4a] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong className="text-white">
                      {t('pro.pricing.bullet1_title', 'Cookieless Telemetry & 90-Day History:')}
                    </strong>{' '}
                    {t(
                      'pro.pricing.bullet1_desc',
                      'Real-time unique visitors, country demographics, and referral tracking.'
                    )}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#c5ff4a]/10 border border-[#c5ff4a]/20 flex items-center justify-center text-[#c5ff4a] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong className="text-white">
                      {t('pro.pricing.bullet2_title', '24/7 Widget Health & Instant Alerts:')}
                    </strong>{' '}
                    {t(
                      'pro.pricing.bullet2_desc',
                      'Immediate email alerts if any external badge in your README breaks or times out.'
                    )}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-[#c5ff4a]/10 border border-[#c5ff4a]/20 flex items-center justify-center text-[#c5ff4a] shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong className="text-white">
                      {t('pro.pricing.bullet3_title', '10 Profiles & Instant Camo Purge:')}
                    </strong>{' '}
                    {t(
                      'pro.pricing.bullet3_desc',
                      'Deploy separate profiles for work, personal, and open-source with edge CDN caching.'
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] font-mono text-[#8a8a8a]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {t('pro.pricing.guarantee_text', '{days}-Day Money-Back Guarantee', {
                    days: String(PRO_PRICING_CONFIG.guaranteeDays),
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  {t('pro.pricing.instant_activation', 'Instant Account Activation')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-white/70" />
                  {t('pro.pricing.secure_checkout', 'Encrypted & Secure Checkout')}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="p-6 sm:p-7 rounded-xl bg-[#141414] border border-white/10 space-y-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5ff4a]/10 border border-[#c5ff4a]/30 text-[#c5ff4a] text-[11px] font-mono font-bold tracking-wide uppercase mx-auto">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {t('pro.pricing.discount_badge', 'SPECIAL OFFER — {pct}% OFF', {
                      pct: String(PRO_PRICING_CONFIG.discountPercentage),
                    })}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-sm text-[#7a7a7a] line-through font-mono">
                      {PRO_PRICING_CONFIG.originalPriceFormatted}
                    </span>
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                      {PRO_PRICING_CONFIG.priceFormatted}
                    </span>
                    <span className="text-xs font-mono uppercase text-[#c5ff4a] font-bold bg-[#c5ff4a]/10 px-2 py-0.5 rounded">
                      {PRO_PRICING_CONFIG.currency}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a8a8a] font-mono">
                    {t('pro.pricing.one_time_label', 'One-time payment • Own it forever')}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onUpgrade}
                    disabled={isUpgrading || upgradeSuccess}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-black bg-[#c5ff4a] hover:bg-[#b0f533] transition-all cursor-pointer disabled:opacity-70 active:scale-[0.99]"
                  >
                    {upgradeSuccess ? (
                      <>
                        <Sparkles className="w-4 h-4 text-black animate-spin" />
                        <span>
                          {t('pro.guard.paywall.success', 'Pro Plan Activated! Loading...')}
                        </span>
                      </>
                    ) : isUpgrading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>{t('pro.guard.paywall.processing', 'Processing Upgrade...')}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-black" />
                        <span>{t('pro.pricing.cta_button', 'Get GitAscii Pro Lifetime')}</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-[#7a7a7a] leading-tight">
                    {t(
                      'pro.pricing.cta_footer_note',
                      'No recurring subscriptions. Instant unlock for @{username}.',
                      { username: username || 'your account' }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('pro.pricing.benefits_title', 'Everything included in your Lifetime License')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8a8a]">
              {t(
                'pro.pricing.benefits_subtitle',
                'Built for developers who take their GitHub presence and developer brand seriously.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PRO_PRICING_CONFIG.features.map((feat) => (
              <div
                key={feat.id}
                className="p-5 rounded-xl bg-[#111111] border border-white/[0.07] hover:border-white/15 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/5">
                      {getFeatureIcon(feat.id)}
                    </div>
                    {feat.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#a0a0a0]">
                        {feat.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#c5ff4a] transition-colors">
                    {t(feat.titleKey, feat.titleDefault)}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] leading-relaxed">
                    {t(feat.descKey, feat.descDefault)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('pro.pricing.comp_title', 'Free vs Pro Feature Comparison')}
            </h2>
            <p className="text-xs sm:text-sm text-[#8a8a8a]">
              {t(
                'pro.pricing.comp_sub',
                'See why upgrading to Lifetime Pro gives you complete control.'
              )}
            </p>
          </div>

          <div className="rounded-xl bg-[#0e0e0e] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[540px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3.5 px-5 font-semibold text-white">
                      {t('pro.pricing.table_feature', 'Feature')}
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-[#8a8a8a] text-center w-36">
                      {t('pro.pricing.table_free', 'GitAscii Free')}
                    </th>
                    <th className="py-3.5 px-5 font-semibold text-[#c5ff4a] text-center w-48 bg-[#c5ff4a]/[0.03]">
                      {t('pro.pricing.table_pro', 'GitAscii Pro (Lifetime)')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {PRO_PRICING_CONFIG.comparison.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3.5 px-5 font-sans font-medium text-white/90">
                        {t(item.featureKey, item.featureDefault)}
                      </td>
                      <td className="py-3.5 px-5 text-center text-[#7a7a7a]">
                        {typeof item.free === 'boolean' ? (
                          item.free ? (
                            <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-[#555] mx-auto" />
                          )
                        ) : (
                          item.free
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold text-white bg-[#c5ff4a]/[0.03]">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <Check className="w-4 h-4 text-[#c5ff4a] mx-auto" />
                          ) : (
                            <Minus className="w-4 h-4 text-[#555] mx-auto" />
                          )
                        ) : (
                          <span className="text-[#c5ff4a]">{item.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#8a8a8a] font-mono">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('pro.pricing.faq_badge', 'FAQ')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('pro.pricing.faq_title', 'Frequently Asked Questions')}
            </h2>
          </div>

          <div className="space-y-3">
            {PRO_PRICING_CONFIG.faqs.map((faq) => {
              const isOpen = openFaq === faq.id
              return (
                <div
                  key={faq.id}
                  className="rounded-xl bg-[#111111] border border-white/[0.07] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#c5ff4a] transition-colors cursor-pointer"
                  >
                    <span>{t(faq.questionKey, faq.questionDefault)}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8a8a8a] transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-180 text-[#c5ff4a]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs text-[#8a8a8a] leading-relaxed border-t border-white/5">
                      {t(faq.answerKey, faq.answerDefault)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="text-center pt-4 pb-8">
          <Link
            href={username ? `/${username}` : '/'}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#7a7a7a] hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            <span>{t('pro.guard.paywall.back_editor', '← Return to Free Editor')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { AlertTriangle, BarChart2, Github, Layers, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import { PRO_PRICING_CONFIG } from '../constants/pricing'
import { ProBadge } from './ProBadge'
import { ProPaywall } from './ProPaywall'
import { ProPaywallSkeleton } from './ProSkeleton'

export interface ProAuthGuardProps {
  children: React.ReactNode
}

interface UserSessionState {
  username?: string
  githubId?: number
  email?: string
  name?: string
  isPro?: boolean
  tier?: 'free' | 'pro'
}

export const ProAuthGuard: React.FC<ProAuthGuardProps> = ({ children }) => {
  const { t } = useI18n()
  const pathname = usePathname() || '/pro'
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<UserSessionState | null>(null)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)

  const checkAuth = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.SESSION, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        setSession(data.session || data)
      } else {
        setSession(null)
      }
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void checkAuth()
  }, [])

  const handleUpgradeToPro = async () => {
    try {
      setIsUpgrading(true)
      const res = await fetch(API_ENDPOINTS.PRO.SUBSCRIBE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        setUpgradeSuccess(true)
        setTimeout(async () => {
          await checkAuth()
          setIsUpgrading(false)
        }, 1200)
      } else {
        setIsUpgrading(false)
      }
    } catch (err) {
      console.error('Upgrade error:', err)
      setIsUpgrading(false)
    }
  }

  if (loading) {
    return <ProPaywallSkeleton />
  }

  if (!session || !session.username) {
    const loginUrl = `/api/auth/login?redirect_to=${encodeURIComponent(pathname)}`

    return (
      <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12 text-center select-none bg-[#070707]">
        <div className="max-w-lg w-full p-8 sm:p-9 rounded-2xl bg-[#0e0e0e] border border-white/10 shadow-2xl space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#c5ff4a]/10 border border-[#c5ff4a]/20 flex items-center justify-center text-[#c5ff4a]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">GitAscii Pro</h2>
              <ProBadge variant="lime">{t('pro.guard.workspace', 'WORKSPACE')}</ProBadge>
            </div>
            <p className="text-xs text-[#8a8a8a] leading-relaxed max-w-sm">
              {t(
                'pro.guard.unauth_desc',
                'Sign in with your GitHub account to access real-time analytics, widget error alerts, multi-profile management, and executive report exports.'
              )}
            </p>
          </div>

          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono">
            <span className="text-[#8a8a8a]">
              {t('pro.pricing.plan_lifetime_tag', 'LIFETIME ACCESS')}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-white">
              <span className="text-[10px] text-[#666] line-through">
                {PRO_PRICING_CONFIG.originalPriceFormatted}
              </span>
              <span className="text-[#c5ff4a]">{PRO_PRICING_CONFIG.priceFormatted}</span>
              <span className="text-[10px] text-[#888] font-normal font-sans">
                {t('pro.pricing.one_time_short', 'pay once')}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-left border-y border-white/5 py-4">
            <div className="flex items-start gap-2.5 text-xs text-white/90">
              <BarChart2 className="w-4 h-4 text-[#c5ff4a] flex-shrink-0 mt-0.5" />
              <span>
                <strong>{t('pro.guard.feat_analytics_title', 'Privacy-First Analytics:')}</strong>{' '}
                {t(
                  'pro.guard.feat_analytics_desc',
                  'Unique visitor metrics, referrers, and geography without invasive cookies.'
                )}
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-white/90">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{t('pro.guard.feat_errors_title', 'Widget Error Monitor:')}</strong>{' '}
                {t(
                  'pro.guard.feat_errors_desc',
                  'Instant alerts when external badges or widgets fail in your README.'
                )}
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-white/90">
              <Layers className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{t('pro.guard.feat_profiles_title', 'Multi-Profile Management:')}</strong>{' '}
                {t(
                  'pro.guard.feat_profiles_desc',
                  'Deploy and manage up to 10 distinct dynamic profiles.'
                )}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={loginUrl}
              prefetch={false}
              rel="nofollow"
              onClick={() => setIsLoginLoading(true)}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 text-xs font-bold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              {isLoginLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              <span>{t('pro.guard.connect_github', 'Connect with GitHub')}</span>
            </Link>
            <p className="text-[11px] text-[#7a7a7a]">
              {t('pro.guard.privacy_notice', 'LGPD & GDPR compliant. Zero invasive trackers.')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session.isPro && session.tier === 'free') {
    return (
      <ProPaywall
        username={session.username}
        isUpgrading={isUpgrading}
        upgradeSuccess={upgradeSuccess}
        onUpgrade={handleUpgradeToPro}
      />
    )
  }

  return <>{children}</>
}

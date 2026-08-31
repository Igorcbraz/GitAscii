'use client'

import { ArrowRight, RefreshCw, ShieldCheck, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import { OVERVIEW_REFRESH_INTERVAL } from '../../constants/overview'
import type { ProOverviewData } from '../../types'
import { AreaChart } from '../charts/AreaChart'
import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { OverviewActivityCard } from './OverviewActivityCard'
import { OverviewKpiStrip } from './OverviewKpiStrip'
import { OverviewProfilesCard } from './OverviewProfilesCard'
import { OverviewQuickInsights } from './OverviewQuickInsights'
import { OverviewDashboardSkeleton } from './OverviewSkeleton'

export const OverviewDashboard: React.FC = () => {
  const { t } = useI18n()
  const [data, setData] = useState<ProOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setRefreshing(true)
        const res = await fetch(API_ENDPOINTS.PRO.OVERVIEW())
        if (!res.ok) {
          throw new Error(t('pro.overview.error_load', 'Failed to load overview data'))
        }
        const json: ProOverviewData = await res.json()
        setData(json)
        setError(null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
        if (!isBackground) setRefreshing(false)
      }
    },
    [t]
  )

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchData(true)
    }, OVERVIEW_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return <OverviewDashboardSkeleton />
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.overview.title', 'Overview')}
        subtitle={t(
          'pro.overview.subtitle',
          'Unified telemetry, profile health, and operational activity across your GitAscii stack.'
        )}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-[#8a8a8a]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">
                {t('pro.overview.live_indicator', 'Edge Telemetry Live')}
              </span>
            </div>

            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title={t('pro.overview.refresh_title', 'Refresh dashboard metrics')}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
              />
            </button>

            <Link
              href="/pro/analytics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/90 hover:text-white transition-all"
            >
              <span>{t('pro.overview.analytics_btn', 'Analytics')}</span>
              <ArrowRight className="w-3 h-3 text-[#c5ff4a]" />
            </Link>
          </div>
        }
      />

      <div className="p-5 xl:p-7 space-y-6 w-full min-w-0 max-w-full">
        {error && (
          <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchData(false)}
              className="underline hover:text-rose-300 cursor-pointer"
            >
              {t('pro.overview.retry', 'Retry')}
            </button>
          </div>
        )}

        <OverviewKpiStrip data={data} />

        <OverviewQuickInsights data={data} />

        <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.06] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h2 className="text-xs font-semibold text-white tracking-tight">
                  {t('pro.overview.chart_title', 'Traffic & Engagement Trends')}
                </h2>
                <ProBadge variant="muted" size="sm">
                  {t('pro.overview.chart_badge', '30 Days')}
                </ProBadge>
              </div>
              <p className="text-[11px] text-[#666] mt-0.5">
                {t(
                  'pro.overview.chart_subtitle',
                  'Aggregated daily profile badge impressions, unique visitors, and cache volume.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {data?.avgDailyViews !== undefined && (
                <div className="text-[10px] font-mono text-[#8a8a8a] bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                  {t('pro.overview.avg_label', 'Avg:')}{' '}
                  <span className="text-white font-bold">
                    {data.avgDailyViews.toLocaleString()}
                    {t('pro.overview.per_day', '/day')}
                  </span>
                </div>
              )}
              <Link
                href="/pro/analytics"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c5ff4a] hover:underline"
              >
                <span>{t('pro.overview.deep_dive', 'Deep Dive')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="pt-0.5">
            <AreaChart
              data={data?.recentViewsChart || []}
              height={200}
              showUniques={true}
              showPreviousPeriod={true}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OverviewActivityCard data={data} />
          <OverviewProfilesCard data={data} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#666] pt-1 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong className="text-[#888]">
                {t('pro.overview.privacy_title', 'LGPD & GDPR Compliant:')}
              </strong>{' '}
              {t(
                'pro.overview.privacy_desc',
                'Cookieless telemetry with daily rotating SHA-256 HMAC salt hashes.'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] font-mono shrink-0 text-[#666]">
            <Link href="/pro/analytics" className="hover:text-white transition-colors">
              {t('pro.sidebar.nav.analytics', 'Analytics')}
            </Link>
            <span>•</span>
            <Link href="/pro/profiles" className="hover:text-white transition-colors">
              {t('pro.sidebar.nav.profiles', 'Profiles')}
            </Link>
            <span>•</span>
            <Link href="/pro/errors" className="hover:text-white transition-colors">
              {t('pro.sidebar.nav.errors', 'Widget Errors')}
            </Link>
            <span>•</span>
            <Link href="/pro/emails" className="hover:text-white transition-colors">
              {t('pro.sidebar.nav.emails', 'Email Logs')}
            </Link>
            <span>•</span>
            <Link href="/pro/reports" className="hover:text-white transition-colors">
              {t('pro.sidebar.nav.reports', 'Reports')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

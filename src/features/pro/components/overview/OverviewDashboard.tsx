'use client'

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ActivityEvent, ProOverviewData } from '../../types'
import { AreaChart } from '../charts/AreaChart'
import { CountryFlag } from '../CountryFlag'
import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProDashboardSkeleton } from '../ProSkeleton'
import { ProStatCard } from '../ProStatCard'

function formatRelativeTime(
  timestamp: string,
  t: (k: string, d?: string, v?: Record<string, string>) => string
): string {
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime()
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 30) return t('pro.time.just_now', 'Just now')
    if (seconds < 60) return t('pro.time.seconds_ago', '{s}s ago', { s: String(seconds) })
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return t('pro.time.minutes_ago', '{m}m ago', { m: String(minutes) })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('pro.time.hours_ago', '{h}h ago', { h: String(hours) })
    const days = Math.floor(hours / 24)
    if (days < 7) return t('pro.time.days_ago', '{d}d ago', { d: String(days) })
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return timestamp
  }
}

function getActivityIcon(type: ActivityEvent['type']) {
  switch (type) {
    case 'error_detected':
      return (
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      )
    case 'error_resolved':
      return (
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      )
    case 'email_sent':
      return (
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Mail className="w-3.5 h-3.5" />
        </div>
      )
    case 'view_spike':
      return (
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      )
    case 'profile_created':
    case 'profile_updated':
      return (
        <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
          <Layers className="w-3.5 h-3.5" />
        </div>
      )
    default:
      return (
        <div className="p-1.5 rounded-lg bg-white/5 text-[#8a8a8a] border border-white/10">
          <Clock className="w-3.5 h-3.5" />
        </div>
      )
  }
}

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
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <ProDashboardSkeleton />
      </div>
    )
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

      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchData(false)} className="underline hover:text-rose-300">
              {t('pro.overview.retry', 'Retry')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          <ProStatCard
            title={t('pro.kpi.total_views', 'Total Profile Views')}
            value={data?.totalViews.toLocaleString() || '0'}
            tooltipText={t(
              'pro.kpi.total_views_tooltip',
              'Aggregated profile badge renders and direct HTTP image requests (past 30 days).'
            )}
            trend={data?.viewsTrendPercent}
            trendLabel={t('pro.kpi.vs_past_period', 'vs past period')}
            icon={<Eye className="w-4 h-4" />}
            variant="lime"
          />
          <ProStatCard
            title={t('pro.kpi.unique_visitors', 'Unique Visitors')}
            value={data?.uniqueVisitors.toLocaleString() || '0'}
            tooltipText={t(
              'pro.kpi.unique_visitors_tooltip',
              'Estimated unique visitors computed via Redis HyperLogLog with daily salted hash rotation.'
            )}
            trend={data?.uniquesTrendPercent}
            trendLabel={t('pro.kpi.privacy_hashed', 'privacy-hashed')}
            icon={<Users className="w-4 h-4" />}
            variant="default"
          />
          <ProStatCard
            title={t('pro.kpi.cache_validation', 'Cache Validation (304)')}
            value={`${data?.cacheHitRatio ?? 98}%`}
            tooltipText={t(
              'pro.kpi.cache_validation_tooltip',
              'Ratio of HTTP 304 Not Modified validations vs full dynamic origin renders.'
            )}
            icon={<Cpu className="w-4 h-4" />}
            variant="default"
          />
          <ProStatCard
            title={t('pro.kpi.avg_render', 'Avg Server Render')}
            value={`${data?.avgLatencyMs ?? 24}ms`}
            tooltipText={t(
              'pro.kpi.avg_render_tooltip',
              'Average server execution and SVG synthesis response time at edge.'
            )}
            icon={<Zap className="w-4 h-4" />}
            variant="default"
          />
          <ProStatCard
            title={t('pro.kpi.widget_health', 'Widget Health')}
            value={data?.activeErrorsCount || 0}
            subValue={
              data?.activeErrorsCount === 0
                ? t('pro.kpi.health_optimal', 'All systems healthy')
                : t('pro.kpi.health_action_needed', 'Action needed')
            }
            tooltipText={t(
              'pro.kpi.widget_health_tooltip',
              'Active widget runtime errors and rendering exceptions requiring review.'
            )}
            icon={<AlertTriangle className="w-4 h-4" />}
            variant={data?.activeErrorsCount && data.activeErrorsCount > 0 ? 'rose' : 'default'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="p-2.5 px-3 rounded-xl bg-[#111111] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8a8a] text-[11px]">
              {t('pro.insights.peak_day', 'Peak Day:')}
            </span>
            <span className="text-white font-bold">{data?.peakDay?.day || 'Wednesday'}</span>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-[#111111] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8a8a] text-[11px]">
              {t('pro.insights.peak_hour', 'Peak Hour (UTC):')}
            </span>
            <span className="text-white font-bold">
              {String(data?.peakHour?.hour ?? 14).padStart(2, '0')}:00
            </span>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-[#111111] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8a8a] text-[11px]">
              {t('pro.insights.top_country', 'Top Country:')}
            </span>
            <span className="text-white font-bold flex items-center gap-1.5 truncate">
              {data?.topCountry ? (
                <>
                  <CountryFlag code={data.topCountry.code} size="sm" />
                  <span className="truncate">{data.topCountry.name}</span>
                </>
              ) : (
                'United States'
              )}
            </span>
          </div>
          <div className="p-2.5 px-3 rounded-xl bg-[#111111] border border-white/[0.07] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8a8a8a] text-[11px]">
              {t('pro.insights.top_referrer', 'Top Referrer:')}
            </span>
            <span className="text-white font-bold truncate max-w-[130px]">
              {data?.topSource || 'GitHub'}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-2.5">
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
              <p className="text-[11px] text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.overview.chart_subtitle',
                  'Aggregated daily profile badge impressions, unique visitors, and cache volume.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {data?.avgDailyViews !== undefined && (
                <div className="text-[10px] font-mono text-[#8a8a8a] bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-md">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h3 className="text-xs font-semibold text-white">
                    {t('pro.overview.recent_activity', 'Recent Activity')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#7a7a7a]">
                  {t('pro.overview.live_stream', 'Live Stream')}
                </span>
              </div>

              <div className="space-y-1.5">
                {data?.recentActivity && data.recentActivity.length > 0 ? (
                  data.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="shrink-0">{getActivityIcon(act.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-white truncate">{act.title}</p>
                          <span className="text-[10px] font-mono text-[#7a7a7a] shrink-0">
                            {formatRelativeTime(act.timestamp, t)}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8a8a8a] truncate">{act.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#8a8a8a] py-6 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                    {t('pro.overview.no_activity', 'No activity events recorded yet.')}
                  </div>
                )}
              </div>
            </div>

            {data?.activeErrorsCount && data.activeErrorsCount > 0 ? (
              <div className="pt-1.5">
                <Link
                  href="/pro/errors"
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-xs font-medium text-rose-300 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>
                    {t('pro.overview.review_errors', 'Review {count} active error(s)', {
                      count: String(data.activeErrorsCount),
                    })}
                  </span>
                </Link>
              </div>
            ) : null}
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h3 className="text-xs font-semibold text-white">
                    {t('pro.overview.active_profiles', 'Active Profiles')}
                  </h3>
                </div>
                <Link
                  href="/pro/profiles"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c5ff4a] hover:underline"
                >
                  <span>{t('pro.overview.manage_all', 'Manage All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1.5">
                {data?.topProfiles && data.topProfiles.length > 0 ? (
                  data.topProfiles.map((prof) => (
                    <div
                      key={prof.slug}
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {prof.name}
                          </span>
                          {prof.isDefault && (
                            <ProBadge variant="lime" size="sm">
                              {t('pro.common.default', 'Default')}
                            </ProBadge>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-[#7a7a7a] truncate">
                          /{prof.slug} • {prof.widgetsCount} {t('pro.common.widgets', 'widgets')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-mono font-medium text-white/90 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                          {prof.totalViews.toLocaleString()} {t('pro.common.views', 'views')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#8a8a8a] py-6 text-center bg-white/[0.01] rounded-lg border border-dashed border-white/5">
                    {t('pro.overview.no_profiles', 'No profiles configured yet.')}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1.5">
              <Link
                href="/pro/profiles"
                className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/90 transition-colors"
              >
                <Plus className="w-3 h-3 text-[#c5ff4a]" />
                <span>{t('pro.overview.create_profile', 'Create New Profile')}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#8a8a8a]">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>{t('pro.overview.privacy_title', 'LGPD & GDPR Compliant:')}</strong>{' '}
              {t(
                'pro.overview.privacy_desc',
                'Cookieless telemetry with daily rotating SHA-256 HMAC salt hashes.'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] font-mono shrink-0">
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

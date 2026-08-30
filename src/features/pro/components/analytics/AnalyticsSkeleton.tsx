'use client'

import {
  Activity,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  Download,
  Eye,
  Flame,
  Globe2,
  Info,
  Laptop,
  Layers,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const AnalyticsDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  const sections = [
    {
      id: 'overview',
      label: t('pro.analytics.section_overview', 'Overview'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'traffic',
      label: t('pro.analytics.section_traffic', 'Traffic & Trends'),
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      id: 'geography',
      label: t('pro.analytics.section_geography', 'Geography'),
      icon: <Globe2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'technology',
      label: t('pro.analytics.section_technology', 'Technology'),
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      id: 'sources',
      label: t('pro.analytics.section_sources', 'Sources'),
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: 'profiles',
      label: t('pro.analytics.section_profiles', 'Profiles'),
      icon: <Laptop className="w-3.5 h-3.5" />,
    },
    {
      id: 'activity',
      label: t('pro.analytics.section_activity', 'Live Telemetry'),
      icon: <Activity className="w-3.5 h-3.5" />,
      badge: t('pro.analytics.live_badge', 'LIVE'),
    },
  ]

  const timeRanges = [
    { id: '24h', label: t('pro.time.24h', 'Last 24h') },
    { id: '7d', label: t('pro.time.7d', '7 Days') },
    { id: '30d', label: t('pro.time.30d', '30 Days') },
    { id: '90d', label: t('pro.time.90d', '90 Days') },
    { id: 'all', label: t('pro.time.all', 'All Time') },
  ]

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a]">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Scope')}
            </span>
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c5ff4a]/60 animate-pulse" />
                <span className="text-[#ccc] font-medium text-xs">
                  {t('pro.analytics.all_profiles_combined', 'All Profiles Combined')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
            </div>
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.analytics.sections', 'Sections')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => {
                const isFirst = sec.id === 'overview'
                return (
                  <div
                    key={sec.id}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isFirst ? 'bg-white/[0.08] text-white font-medium' : 'text-[#777]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isFirst ? 'text-[#c5ff4a]' : 'text-[#666]'}>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </div>

                    {sec.badge && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-[#777] flex items-center justify-between">
          <span>{t('pro.analytics.retention', 'Retention')}</span>
          <span className="text-emerald-400">{t('pro.analytics.pro_retention', '90d Pro')}</span>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto h-screen flex flex-col min-w-0">
        <ProHeader
          title={t('pro.analytics.title', 'Analytics & Telemetry')}
          subtitle={t(
            'pro.analytics.subtitle',
            'Full-funnel, privacy-first observability for your published GitAscii README profiles.'
          )}
          center={
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
                {timeRanges.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                      r.id === '30d' ? 'bg-white/[0.08] text-white font-medium' : 'text-[#777]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="px-2.5 py-1 text-xs font-mono rounded-lg border bg-white/[0.08] border-white/[0.15] text-white font-medium">
                {t('pro.analytics.compare', 'Compare')}
              </div>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#8a8a8a]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5ff4a]" />
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-medium">
                <Download className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <span>{t('pro.analytics.export', 'Export')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8a8a8a]" />
              </div>
            </div>
          }
        />

        <div className="p-6 sm:p-8 space-y-8 max-w-[1700px] w-full mx-auto">
          <div className="lg:hidden space-y-3 pb-2 border-b border-white/5">
            <div className="md:hidden">
              <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
                <span className="text-[#ccc]">
                  {t('pro.analytics.all_profiles_combined', 'All Profiles Combined')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
                {timeRanges.map((r) => (
                  <span
                    key={r.id}
                    className={`px-2 py-1 text-xs font-mono rounded-md ${
                      r.id === '30d' ? 'bg-white/[0.08] text-white' : 'text-[#777]'
                    }`}
                  >
                    {r.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.overview.title', 'Overview')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <ProSkeleton className="h-4 w-36" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/[0.06] rounded overflow-hidden border border-white/[0.08]">
              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.kpi.total_requests', 'Total Image Requests')}
                  </span>
                  <div className="p-1 rounded bg-[#c5ff4a]/10 border border-[#c5ff4a]/20">
                    <Eye className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-24 bg-[#c5ff4a]/10" />
                <span className="text-[10px] text-[#777] block font-medium">
                  {t('pro.analytics.observed_30d', '30d observed')}
                </span>
              </div>

              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.kpi.unique_visitors', 'Est. Unique Sources')}
                  </span>
                  <div className="p-1 rounded bg-white/[0.04] border border-white/10">
                    <Users className="w-3.5 h-3.5 text-[#aaa]" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-20" />
                <span className="text-[10px] text-cyan-400/80 block font-medium">
                  {t('pro.analytics.hyperloglog_hashed', 'HyperLogLog Hashed')}
                </span>
              </div>

              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.kpi.cache_validation', 'Cache Validation (304)')}
                  </span>
                  <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-16" />
                <span className="text-[10px] text-[#777] block font-medium">
                  {t('pro.analytics.not_modified_304', '304 Not Modified')}
                </span>
              </div>

              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.kpi.avg_render', 'Avg. Server Latency')}
                  </span>
                  <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-16" />
                <span className="text-[10px] text-[#777] block font-medium">
                  {t('pro.analytics.edge_speed_sub30', '< 30ms Edge Speed')}
                </span>
              </div>

              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.analytics.recent_viewers', 'Requests (Last 30m)')}
                  </span>
                  <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-16" />
                <span className="text-[10px] text-emerald-400/80 block font-medium">
                  {t('pro.analytics.rolling_30m_window', 'Rolling 30m Window')}
                </span>
              </div>

              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.analytics.daily_avg_views', 'Daily Avg. Requests')}
                  </span>
                  <div className="p-1 rounded bg-white/[0.04] border border-white/10">
                    <TrendingUp className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  </div>
                </div>
                <ProSkeleton className="h-7 w-20" />
                <span className="text-[10px] text-[#777] block font-medium">
                  {t('pro.analytics.per_day_average', 'Per Day Average')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded overflow-hidden border border-white/[0.05]">
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.peak_day', 'Peak Day:')}
                </span>
                <ProSkeleton className="h-3.5 w-16" />
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.peak_hour', 'Peak Hour:')}
                </span>
                <ProSkeleton className="h-3.5 w-20" />
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.top_country', 'Top Country:')}
                </span>
                <div className="flex items-center gap-1.5">
                  <ProSkeleton className="w-4 h-3 rounded-xs" />
                  <ProSkeleton className="h-3.5 w-24" />
                </div>
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.top_referrer', 'Top Referrer:')}
                </span>
                <ProSkeleton className="h-3.5 w-20" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.trends.title', 'Traffic & Engagement Trends')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.trends.time_series', 'Time Series')}</ProBadge>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.trends.daily_volume', 'Daily Traffic Volume')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.trends.daily_volume_sub',
                      'Interactive multi-layer breakdown of profile views, unique visitors, cache hits, and proxy views.'
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <ProSkeleton className="h-5 w-14" />
                  <ProSkeleton className="h-5 w-16" />
                  <ProSkeleton className="h-5 w-16" />
                </div>
              </div>

              <div className="h-[180px] w-full rounded-lg bg-white/[0.02] border border-white/5 p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-x-0 top-8 border-b border-dashed border-white/[0.06]" />
                <div className="absolute inset-x-0 top-20 border-b border-dashed border-white/[0.06]" />
                <div className="absolute inset-x-0 top-32 border-b border-dashed border-white/[0.06]" />

                <div className="absolute inset-0 flex items-end px-2 pb-6 pointer-events-none opacity-30">
                  <svg
                    className="w-full h-28 overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 1000 200"
                  >
                    <defs>
                      <linearGradient id="skel-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#c5ff4a" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,140 Q150,80 300,120 T600,40 T900,90 L1000,60 L1000,200 L0,200 Z"
                      fill="url(#skel-grad)"
                    />
                    <path
                      d="M0,140 Q150,80 300,120 T600,40 T900,90 L1000,60"
                      fill="none"
                      stroke="#c5ff4a"
                      strokeWidth="2"
                      strokeOpacity="0.4"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[9px] font-mono text-[#555] pt-1 mt-auto border-t border-white/5 z-10">
                  {[...Array(6)].map((_, i) => (
                    <ProSkeleton key={i} className="h-2.5 w-10" />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#c5ff4a]" />
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.trends.matrix_title', '24x7 Weekly Activity Matrix')}
                  </h3>
                </div>
                <p className="text-xs text-[#8a8a8a]">
                  {t(
                    'pro.trends.matrix_sub',
                    'Audience density mapped by weekday and hour of day. Spot prime time slots for GitHub profile updates.'
                  )}
                </p>

                <div className="space-y-1.5 pt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
                    <div key={day} className="flex items-center gap-1.5">
                      <span className="w-7 text-[10px] font-mono text-[#666]">{day}</span>
                      <div className="flex-1 grid grid-cols-24 gap-1">
                        {[...Array(24)].map((_, h) => (
                          <div
                            key={h}
                            className="h-3.5 rounded-[2px] bg-white/[0.03] animate-pulse"
                            style={{
                              animationDelay: `${dIdx * 40 + h * 20}ms`,
                              opacity: 0.2 + ((dIdx + h) % 4) * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c5ff4a]" />
                    <h3 className="text-sm font-semibold text-white">
                      {t('pro.trends.today_pulse', "Today's Hourly Pulse")}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.trends.today_pulse_sub',
                      '24-hour volume split by Direct traffic vs Camo Proxy.'
                    )}
                  </p>
                </div>

                <div className="h-[180px] flex items-end gap-1 px-1 pt-4 pb-2 border-b border-white/5">
                  {[
                    25, 15, 10, 8, 12, 20, 45, 70, 95, 80, 65, 75, 88, 90, 82, 60, 50, 45, 55, 70,
                    60, 40, 30, 20,
                  ].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                      <div
                        className="w-full bg-[#c5ff4a]/20 rounded-t-[2px] animate-pulse"
                        style={{ height: `${val}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.geo.title', 'Geographic Reach')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.geo.heatmap_badge', 'Global Heatmap')}</ProBadge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.geo.intensity_title', 'Global Visitor Intensity')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.geo.intensity_sub',
                      'Vector 2D choropleth highlighting country traffic density. Hover over regions for granular stats.'
                    )}
                  </p>
                </div>

                <div className="h-[340px] rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <Globe2 className="w-24 h-24 text-white/[0.05] animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.geo.top_countries', 'Top Visitor Countries')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.geo.top_countries_sub', 'Ranked by volume and unique visitor shares.')}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <ProSkeleton className="w-5 h-3.5 rounded-sm" />
                        <ProSkeleton className="h-3 w-28" />
                      </div>
                      <ProSkeleton className="h-3 w-12" />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-xs font-semibold text-white block">
                    {t('pro.geo.continent_share', 'Continent Share')}
                  </span>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between">
                          <ProSkeleton className="h-3 w-20" />
                          <ProSkeleton className="h-3 w-8" />
                        </div>
                        <ProSkeleton className="h-1 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.technology.title', 'Technology & Platform Environment')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.technology.badge', 'Clients & Proxy')}</ProBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.technology.delivery_mode', 'Delivery Mode')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.technology.delivery_mode_sub',
                      'GitHub Camo Proxy vs Direct browser delivery.'
                    )}
                  </p>
                </div>

                <div className="h-[150px] flex items-center justify-center">
                  <div
                    className="w-28 h-28 rounded-full border-8 border-white/[0.05] border-t-[#c5ff4a]/40 border-r-purple-400/40 animate-spin"
                    style={{ animationDuration: '3s' }}
                  />
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <ProSkeleton className="h-3 w-16" />
                    <ProSkeleton className="h-3 w-24" />
                  </div>
                  <ProSkeleton className="h-2 w-full rounded-full" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.technology.os_title', 'Operating Systems')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.technology.os_sub', 'Visitor platform breakdown.')}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <ProSkeleton className="h-3 w-20" />
                        <ProSkeleton className="h-3 w-10" />
                      </div>
                      <ProSkeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.technology.browsers_title', 'Browsers & Locales')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.technology.browsers_sub', 'Client browsers and preferred languages.')}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <ProSkeleton className="h-3 w-24" />
                        <ProSkeleton className="h-3 w-10" />
                      </div>
                      <ProSkeleton className="h-1.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-xs font-semibold text-white block">
                    {t('pro.technology.pref_languages', 'Preferred Languages')}
                  </span>
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <ProSkeleton className="h-3 w-18" />
                        <ProSkeleton className="h-3 w-8" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.sources.title', 'Referral Sources & Channels')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.sources.badge', 'Inbound Traffic')}</ProBadge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.sources.top_referrers', 'Top Referrers')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.sources.top_referrers_sub',
                      'Where your README badge and profile views originate from.'
                    )}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <ProSkeleton className="w-4 h-4 rounded" />
                        <ProSkeleton className="h-3.5 w-40" />
                      </div>
                      <ProSkeleton className="h-3.5 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.sources.channel_dist', 'Channel Distribution')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.sources.channel_dist_sub', 'Categorized traffic channels.')}
                  </p>
                </div>

                <div className="h-[160px] flex items-center justify-center">
                  <div
                    className="w-32 h-32 rounded-full border-8 border-white/[0.05] border-t-emerald-400/40 border-r-cyan-400/40 animate-spin"
                    style={{ animationDuration: '4s' }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.profiles.perf_title', 'Profile Performance & Cache Efficiency')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.profiles.badge_multi', 'Multi-Profile')}</ProBadge>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 overflow-x-auto">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {t('pro.profiles.matrix_title', 'Profile Breakdown Matrix')}
                </h3>
                <p className="text-xs text-[#8a8a8a] mt-0.5">
                  {t(
                    'pro.profiles.matrix_sub',
                    'Comparative analytics across all configured GitAscii profiles.'
                  )}
                </p>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[#8a8a8a]">
                    <th className="pb-3 font-semibold">
                      {t('pro.table.profile_name', 'Profile Name')}
                    </th>
                    <th className="pb-3 font-semibold">{t('pro.table.views', 'Views')}</th>
                    <th className="pb-3 font-semibold">
                      {t('pro.table.unique_visitors', 'Unique Visitors')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.table.cache_hit_ratio', 'Cache Hit Ratio')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.table.avg_latency', 'Avg. Latency')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.table.portfolio_share', 'Portfolio Share')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-3.5">
                        <ProSkeleton className="h-4 w-32" />
                      </td>
                      <td className="py-3.5">
                        <ProSkeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3.5">
                        <ProSkeleton className="h-4 w-16" />
                      </td>
                      <td className="py-3.5">
                        <ProSkeleton className="h-4 w-12" />
                      </td>
                      <td className="py-3.5">
                        <ProSkeleton className="h-4 w-14" />
                      </td>
                      <td className="py-3.5">
                        <ProSkeleton className="h-2 w-28 rounded-full" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-6 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#c5ff4a]" />
                <div>
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>{t('pro.stream.title', 'Live Telemetry & Real-Time Stream')}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                      {t('pro.stream.stream_active', 'STREAM ACTIVE')}
                    </span>
                  </h2>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.stream.subtitle',
                      'Real-time edge ingestion stream, request pulse, and latency observability.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ProSkeleton className="h-8 w-32" />
                <ProSkeleton className="h-8 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: t('pro.stream.concurrency_label', 'Active Concurrency (30m)'),
                  icon: <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />,
                },
                {
                  label: t('pro.stream.render_latency_label', 'Edge Render Latency'),
                  icon: <Zap className="w-4 h-4 text-[#c5ff4a]" />,
                },
                {
                  label: t('pro.stream.ratio_label', 'Validation 304 Ratio'),
                  icon: <Cpu className="w-4 h-4 text-cyan-400" />,
                },
                {
                  label: t('pro.stream.node_health_label', 'Node Health'),
                  icon: <span className="w-2 h-2 rounded-full bg-emerald-400" />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#111] border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                    <span className="font-semibold uppercase tracking-wider">{item.label}</span>
                    {item.icon}
                  </div>
                  <ProSkeleton className="h-7 w-20" />
                  <ProSkeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.stream.feed_title', 'Live Event Stream Feed')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.stream.feed_sub',
                      'Anonymized, real-time incoming request telemetry across edge points.'
                    )}
                  </p>
                </div>
                <ProSkeleton className="h-4 w-32" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8a8a8a]">
                      <th className="pb-3 font-semibold">{t('pro.table.time', 'Time')}</th>
                      <th className="pb-3 font-semibold">{t('pro.table.profile', 'Profile')}</th>
                      <th className="pb-3 font-semibold">{t('pro.table.location', 'Location')}</th>
                      <th className="pb-3 font-semibold">
                        {t('pro.table.delivery_mode', 'Delivery Mode')}
                      </th>
                      <th className="pb-3 font-semibold">{t('pro.table.client', 'Client')}</th>
                      <th className="pb-3 font-semibold">{t('pro.table.status', 'Status')}</th>
                      <th className="pb-3 font-semibold">{t('pro.table.speed', 'Speed')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td className="py-3 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse" />
                          <ProSkeleton className="h-3 w-16" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-3.5 w-20" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-3.5 w-28" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-5 w-20 rounded" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-3 w-32" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-3.5 w-20" />
                        </td>
                        <td className="py-3">
                          <ProSkeleton className="h-3 w-12" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="space-y-3 pt-2 pb-4 border-t border-white/[0.06] text-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#666]">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-[#888]">
                    {t('pro.privacy.title', 'LGPD & GDPR Privacy-by-Design:')}{' '}
                  </strong>
                  {t(
                    'pro.privacy.desc',
                    '100% cookieless telemetry. Zero raw IP storage, daily rotated salted hashes with HyperLogLog, sanitized referrers, and coarse client metadata.'
                  )}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono whitespace-nowrap shrink-0">
                {t('pro.privacy.learn_how', 'Learn how')}
              </span>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-[#555] leading-relaxed">
              <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#777]">
                  {t(
                    'pro.notice.observed_vs_real_title',
                    'Observed HTTP Requests vs. Real Visitors:'
                  )}{' '}
                </strong>
                {t(
                  'pro.notice.observed_vs_real_desc',
                  'GitAscii renders dynamic SVGs via image tags. GitHub proxies requests through Camo (camo.githubusercontent.com) to protect visitor privacy and cache images. Metrics display verified server observations: GitHub proxy requests originate from GitHub edge servers, while direct requests (e.g. your portfolio) reflect individual clients.'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

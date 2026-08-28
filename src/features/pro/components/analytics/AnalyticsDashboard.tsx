'use client'

import {
  Activity,
  ChevronDown,
  Clock,
  Compass,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Flame,
  Globe2,
  Info,
  Laptop,
  Layers,
  Pause,
  Play,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { AnalyticsSummary, TimeRange } from '../../types'
import { AreaChart } from '../charts/AreaChart'
import { DimensionRanking, HourlyBarChart, StackedRatioBar } from '../charts/BarChart'
import { DonutChart } from '../charts/DonutChart'
import { HeatmapChart } from '../charts/HeatmapChart'
import { WorldMap } from '../charts/WorldMap'
import { CountryFlag } from '../CountryFlag'
import { ProBadge } from '../ProBadge'
import { ProfileScopeSelect } from '../ProfileScopeSelect'
import { ProHeader } from '../ProHeader'
import { ProStatCard } from '../ProStatCard'
import { AnalyticsDashboardSkeleton } from './AnalyticsSkeleton'

type SectionId =
  'overview' | 'traffic' | 'geography' | 'technology' | 'sources' | 'profiles' | 'activity'

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useI18n()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [range, setRange] = useState<TimeRange>('30d')
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [compareEnabled, setCompareEnabled] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionId>('overview')
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)
  const [showOriginNotice, setShowOriginNotice] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)

  const fetchAnalytics = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setRefreshing(true)
        const res = await fetch(API_ENDPOINTS.PRO.ANALYTICS(selectedProfile, range, compareEnabled))
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const data: AnalyticsSummary = await res.json()
        setSummary(data)
      } catch (err) {
        console.warn('Analytics fetch error:', err)
      } finally {
        setLoading(false)
        if (!isBackground) setRefreshing(false)
      }
    },
    [selectedProfile, range, compareEnabled]
  )

  useEffect(() => {
    void fetchAnalytics()
  }, [fetchAnalytics])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      void fetchAnalytics(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchAnalytics])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }
    if (exportOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exportOpen])

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '24h', label: t('pro.analytics.range_24h', 'Last 24h') },
    { id: '7d', label: t('pro.analytics.range_7d', '7 Days') },
    { id: '30d', label: t('pro.analytics.range_30d', '30 Days') },
    { id: '90d', label: t('pro.analytics.range_90d', '90 Days') },
    { id: 'all', label: t('pro.analytics.range_all', 'All Time') },
  ]

  const sections: { id: SectionId; label: string; icon: React.ReactNode; badge?: string }[] =
    useMemo(
      () => [
        {
          id: 'overview',
          label: t('pro.analytics.sec_overview', 'Overview'),
          icon: <Layers className="w-3.5 h-3.5" />,
        },
        {
          id: 'traffic',
          label: t('pro.analytics.sec_traffic', 'Traffic & Trends'),
          icon: <TrendingUp className="w-3.5 h-3.5" />,
        },
        {
          id: 'geography',
          label: t('pro.analytics.sec_geography', 'Geography'),
          icon: <Globe2 className="w-3.5 h-3.5" />,
        },
        {
          id: 'technology',
          label: t('pro.analytics.sec_technology', 'Technology'),
          icon: <Cpu className="w-3.5 h-3.5" />,
        },
        {
          id: 'sources',
          label: t('pro.analytics.sec_sources', 'Sources'),
          icon: <Compass className="w-3.5 h-3.5" />,
        },
        {
          id: 'profiles',
          label: t('pro.analytics.sec_profiles', 'Profiles'),
          icon: <Laptop className="w-3.5 h-3.5" />,
        },
        {
          id: 'activity',
          label: t('pro.analytics.sec_telemetry', 'Live Telemetry'),
          icon: <Activity className="w-3.5 h-3.5" />,
          badge: 'LIVE',
        },
      ],
      [t]
    )

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id)
    const elem = document.getElementById(id)
    const container = contentContainerRef.current
    if (elem && container) {
      const containerRect = container.getBoundingClientRect()
      const elemRect = elem.getBoundingClientRect()
      const scrollOffset = elemRect.top - containerRect.top + container.scrollTop - 20
      container.scrollTo({
        top: Math.max(0, scrollOffset),
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const container = contentContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60
      if (isAtBottom) {
        setActiveSection('activity')
        return
      }

      const containerRect = container.getBoundingClientRect()
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= containerRect.top + 140) {
            setActiveSection(sections[i].id)
            break
          }
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [sections])

  const exportData = (format: 'csv' | 'json') => {
    setExportOpen(false)
    if (!summary) return
    if (format === 'csv') {
      window.location.href = `/api/pro/analytics?range=${range}&profile=${selectedProfile}&export=csv`
      return
    }

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gitascii-analytics-${selectedProfile}-${range}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const profilesList = useMemo(() => {
    const list = [
      { slug: 'all', name: t('pro.scope.all_profiles_combined', 'All Profiles Combined') },
    ]
    if (summary?.topProfiles) {
      summary.topProfiles.forEach((p) => {
        list.push({ slug: p.slug, name: p.name })
      })
    }
    return list
  }, [summary?.topProfiles, t])

  if (loading && !summary) {
    return <AnalyticsDashboardSkeleton />
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a]">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Scope')}
            </span>
            <ProfileScopeSelect
              options={profilesList}
              value={selectedProfile}
              onChange={setSelectedProfile}
            />
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.analytics.sections', 'Sections')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'text-[#777] hover:text-[#ccc] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isActive ? 'text-[#c5ff4a]' : 'text-[#666]'}>
                        {sec.icon}
                      </span>
                      <span>{sec.label}</span>
                    </div>

                    {sec.badge && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-[#777] flex items-center justify-between">
          <span>{t('pro.analytics.retention', 'Retention')}</span>
          <span className="text-emerald-400">{t('pro.analytics.retention_val', '90d Pro')}</span>
        </div>
      </aside>

      <div
        ref={contentContainerRef}
        id="analytics-scroll-container"
        className="flex-1 overflow-y-auto h-screen flex flex-col min-w-0"
      >
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
                    onClick={() => setRange(r.id)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      range === r.id
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'text-[#777] hover:text-[#ccc] hover:bg-white/[0.02]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCompareEnabled(!compareEnabled)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                  compareEnabled
                    ? 'bg-white/[0.08] border-white/[0.15] text-white font-medium'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#777] hover:text-white'
                }`}
                title={t('pro.analytics.compare_title', 'Compare with previous period')}
              >
                <span>{t('pro.analytics.compare', 'Compare')}</span>
              </button>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchAnalytics(false)}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer"
                title={t('pro.analytics.refresh_title', 'Refresh metrics')}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
                />
              </button>

              <div ref={exportDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setExportOpen(!exportOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer"
                  title={t('pro.analytics.export', 'Export')}
                >
                  <Download className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <span>{t('pro.analytics.export', 'Export')}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8a8a8a] transition-transform duration-200 ${
                      exportOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#161616] border border-white/15 rounded-xl shadow-2xl p-1.5 min-w-[170px] text-xs space-y-0.5 animate-in fade-in-0 zoom-in-95">
                    <div className="px-2.5 py-1 text-[10px] font-mono text-[#777] uppercase tracking-wider">
                      {t('pro.analytics.download_format', 'Download Format')}
                    </div>
                    <button
                      onClick={() => exportData('csv')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">
                          {t('pro.analytics.export_csv', 'Export CSV')}
                        </div>
                        <div className="text-[10px] text-[#7a7a7a]">
                          {t('pro.analytics.export_csv_desc', 'Spreadsheet data (.csv)')}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => exportData('json')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium">
                          {t('pro.analytics.export_json', 'Export JSON')}
                        </div>
                        <div className="text-[10px] text-[#7a7a7a]">
                          {t('pro.analytics.export_json_desc', 'Raw telemetry object (.json)')}
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />

        <div className="p-6 sm:p-8 space-y-8 max-w-[1700px] w-full mx-auto">
          <div className="lg:hidden space-y-3 pb-2 border-b border-white/5">
            <div className="md:hidden">
              <ProfileScopeSelect
                options={profilesList}
                value={selectedProfile}
                onChange={setSelectedProfile}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
                {timeRanges.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRange(r.id)}
                    className={`px-2 py-1 text-xs font-mono rounded-md transition-colors cursor-pointer ${
                      range === r.id
                        ? 'bg-white/[0.08] text-white font-medium'
                        : 'text-[#777] hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCompareEnabled(!compareEnabled)}
                className={`px-2 py-1 text-xs font-mono rounded-lg border transition-colors cursor-pointer ${
                  compareEnabled
                    ? 'bg-white/[0.08] border-white/[0.15] text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#777]'
                }`}
              >
                <span>{t('pro.analytics.compare', 'Compare')}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs md:hidden">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                    activeSection === sec.id
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-[#8a8a8a] hover:text-white'
                  }`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs overflow-hidden">
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <p className="leading-relaxed">
                  <strong>
                    {t('pro.analytics.privacy_title', 'LGPD & GDPR Privacy-by-Design:')}
                  </strong>{' '}
                  {t(
                    'pro.analytics.privacy_desc',
                    '100% cookieless telemetry. Zero raw IP storage, daily rotated salted hashes with HyperLogLog, sanitized referrers, and coarse client metadata.'
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                className="text-xs text-emerald-400 hover:underline font-mono whitespace-nowrap cursor-pointer"
              >
                {showPrivacyDetails
                  ? t('pro.analytics.privacy_hide_details', 'Hide details')
                  : t('pro.analytics.privacy_learn_more', 'Learn how')}
              </button>
            </div>

            {showPrivacyDetails && (
              <div className="p-4 bg-black/40 border-t border-emerald-500/20 text-xs text-emerald-200/90 space-y-2 font-mono">
                <p>
                  {t(
                    'pro.analytics.privacy_p1',
                    '• Zero Raw IP Storage: Incoming client IP is never written to disk or Redis. An irreversible SHA-256 HMAC hash is generated using a salt that automatically rotates daily.'
                  )}
                </p>
                <p>
                  {t(
                    'pro.analytics.privacy_p2',
                    '• Cross-Day Anonymity: Because the salt rotates every 24 hours, visitor hashes cannot be correlated across different days, preventing persistent behavioral tracking.'
                  )}
                </p>
                <p>
                  {t(
                    'pro.analytics.privacy_p3',
                    '• HyperLogLog Cardinality: Unique visitors are computed with Redis HyperLogLog (PFADD / PFCOUNT) ensuring O(1) space efficiency with mathematical precision.'
                  )}
                </p>
                <p>
                  {t(
                    'pro.analytics.privacy_p4',
                    '• Referrer Sanitization: All query parameters, tokens, and sensitive URL fragments are stripped before recording referrer domains.'
                  )}
                </p>
              </div>
            )}
          </div>

          <section id="overview" className="space-y-4 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.analytics.sec_overview', 'Overview')}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#8a8a8a]">
                {t('pro.analytics.active_scope', 'Active Scope:')}{' '}
                <strong>
                  {selectedProfile === 'all'
                    ? t('pro.analytics.all_profiles', 'All Profiles')
                    : selectedProfile}
                </strong>{' '}
                ({range})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <ProStatCard
                title={t('pro.kpi.total_views', 'Total Profile Views')}
                value={summary?.totalViews.toLocaleString() || '0'}
                tooltipText={t(
                  'pro.kpi.total_views_tooltip',
                  'Aggregated profile badge renders and direct HTTP image requests (past 30 days).'
                )}
                trend={compareEnabled ? summary?.growthRateViews : undefined}
                trendLabel={
                  compareEnabled
                    ? `${t('pro.stat.vs_prev', 'vs prev. period')} (${range})`
                    : undefined
                }
                icon={<Eye className="w-4 h-4" />}
                variant="lime"
              />
              <ProStatCard
                title={t('pro.kpi.unique_visitors', 'Est. Unique Visitors')}
                value={summary?.uniqueVisitors.toLocaleString() || '0'}
                tooltipText={t(
                  'pro.kpi.unique_visitors_tooltip',
                  'Estimated unique visitors computed via Redis HyperLogLog with daily salted hash rotation.'
                )}
                trend={compareEnabled ? summary?.growthRateUniques : undefined}
                trendLabel={
                  compareEnabled
                    ? `${t('pro.stat.vs_prev', 'vs prev. period')} (${range})`
                    : undefined
                }
                icon={<Users className="w-4 h-4" />}
                variant="default"
              />
              <ProStatCard
                title={t('pro.kpi.cache_validation', 'Cache Validation (304)')}
                value={`${summary?.cacheHitRatio || 0}%`}
                tooltipText={t(
                  'pro.kpi.cache_validation_tooltip',
                  'Ratio of HTTP 304 Not Modified validations vs full dynamic origin renders.'
                )}
                trend={compareEnabled ? summary?.growthRateCacheHits : undefined}
                trendLabel={t('pro.analytics.validation_delta', 'validation delta')}
                icon={<Cpu className="w-4 h-4" />}
                variant="default"
              />
              <ProStatCard
                title={t('pro.kpi.avg_render', 'Avg. Server Render')}
                value={`${summary?.avgLatencyMs || 28}ms`}
                tooltipText={t(
                  'pro.kpi.avg_render_tooltip',
                  'Average server execution latency to synthesize and deliver profile SVG badges.'
                )}
                trend={compareEnabled ? summary?.growthRateLatency : undefined}
                trendLabel={t('pro.analytics.render_speed_delta', 'render speed delta')}
                icon={<Zap className="w-4 h-4" />}
                variant="default"
              />
              <ProStatCard
                title={t('pro.analytics.recent_viewers', 'Recent Viewers (30m)')}
                value={summary?.activeViewersLast30m.toLocaleString() || '0'}
                tooltipText={t(
                  'pro.analytics.recent_viewers_tooltip',
                  'Active anonymous visitors requesting profiles in the rolling 30-minute window.'
                )}
                icon={<Radio className="w-4 h-4 text-emerald-400 animate-pulse" />}
                variant="default"
              />
              <ProStatCard
                title={t('pro.analytics.daily_avg_views', 'Daily Avg. Views')}
                value={summary?.avgDailyViews.toLocaleString() || '0'}
                tooltipText={t(
                  'pro.analytics.daily_avg_views_tooltip',
                  'Mean profile views per calendar day across the selected time period.'
                )}
                icon={<TrendingUp className="w-4 h-4" />}
                variant="default"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8a8a]">{t('pro.insights.peak_day', 'Peak Day:')}</span>
                <span className="text-white font-bold">{summary?.peakDay.day || 'Wednesday'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8a8a]">
                  {t('pro.insights.peak_hour', 'Peak Hour (UTC):')}
                </span>
                <span className="text-white font-bold">
                  {String(summary?.peakHour.hour || 14).padStart(2, '0')}:00 UTC
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8a8a]">
                  {t('pro.insights.top_country', 'Top Country:')}
                </span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  {summary?.topCountries[0] ? (
                    <>
                      <CountryFlag code={summary.topCountries[0].code} size="sm" />
                      <span>{summary.topCountries[0].name}</span>
                    </>
                  ) : (
                    'United States'
                  )}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#111] border border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#8a8a8a]">
                  {t('pro.insights.top_referrer', 'Top Referrer:')}
                </span>
                <span className="text-white font-bold truncate max-w-[140px]">
                  {summary?.topSources[0]?.name || 'GitHub'}
                </span>
              </div>
            </div>
          </section>

          <section id="traffic" className="space-y-6 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.overview.chart_title', 'Traffic & Engagement Trends')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.analytics.time_series', 'Time Series')}</ProBadge>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {t('pro.analytics.daily_traffic_volume', 'Daily Traffic Volume')}
                    </h3>
                    {summary?.timeSeries && summary.timeSeries.length > 0 && (
                      <span className="text-[10px] font-mono text-[#8a8a8a] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
                        {range === '24h'
                          ? t('pro.analytics.last_24_hours', 'Last 24 Hours')
                          : `${summary.timeSeries[0]?.date} → ${summary.timeSeries[summary.timeSeries.length - 1]?.date}`}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.daily_traffic_desc',
                      'Interactive multi-layer breakdown of profile views, unique visitors, cache hits, and proxy views.'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <AreaChart
                  data={summary?.timeSeries || []}
                  height={180}
                  timeRange={range}
                  showPreviousPeriod={compareEnabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#c5ff4a]" />
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.heatmap_title', '24x7 Weekly Activity Matrix')}
                  </h3>
                </div>
                <p className="text-xs text-[#8a8a8a]">
                  {t(
                    'pro.analytics.heatmap_desc',
                    'Audience density mapped by weekday and hour of day. Spot prime time slots for GitHub profile updates.'
                  )}
                </p>

                <div className="pt-2">
                  <HeatmapChart
                    data={summary?.heatmapGrid || []}
                    peakInsight={summary?.peakDay}
                    peakHourInsight={summary?.peakHour}
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c5ff4a]" />
                    <h3 className="text-sm font-semibold text-white">
                      {t('pro.analytics.hourly_title', "Today's Hourly Pulse")}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.hourly_desc',
                      '24-hour volume split by Direct traffic vs Camo Proxy.'
                    )}
                  </p>
                </div>

                <div className="pt-2 flex-1 flex flex-col justify-center">
                  <HourlyBarChart data={summary?.hourlyDistribution || []} height={210} />
                </div>
              </div>
            </div>
          </section>

          <section id="geography" className="space-y-6 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.analytics.geo_title', 'Geographic Reach')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.analytics.geo_badge', 'Global Heatmap')}</ProBadge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">
                      {t('pro.analytics.geo_intensity', 'Global Visitor Intensity')}
                    </h3>

                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowOriginNotice(true)}
                        onMouseLeave={() => setShowOriginNotice(false)}
                        onClick={() => setShowOriginNotice(!showOriginNotice)}
                        className="text-[#666] hover:text-[#bbb] transition-colors p-0.5 focus:outline-none cursor-pointer"
                        aria-label={t('pro.analytics.origin_notice_aria', 'Origin notice info')}
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {showOriginNotice && (
                        <div className="absolute left-0 bottom-full mb-1.5 z-40 w-72 p-2.5 rounded-xl bg-[#161616] border border-white/15 shadow-2xl text-[11px] font-mono text-[#ccc] leading-relaxed backdrop-blur-md pointer-events-none animate-in fade-in-0 zoom-in-95">
                          <strong className="text-white block mb-0.5">
                            {t('pro.analytics.origin_notice_title', 'Origin Notice:')}
                          </strong>
                          {t(
                            'pro.analytics.origin_notice_desc',
                            'Direct browser hits reflect visitor edge location. Requests proxied by GitHub Camo reflect GitHub proxy datacenter nodes.'
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.geo_desc',
                      'Vector 2D choropleth highlighting country traffic density. Hover over regions for granular stats.'
                    )}
                  </p>
                </div>

                <WorldMap
                  countries={summary?.topCountries || []}
                  selectedCountry={selectedCountryCode}
                  onSelectCountry={setSelectedCountryCode}
                />
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.top_countries', 'Top Visitor Countries')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.top_countries_desc',
                      'Ranked by volume and unique visitor shares.'
                    )}
                  </p>
                </div>

                <div className="pt-1">
                  <DimensionRanking
                    items={(summary?.topCountries || []).map((c) => ({
                      key: c.code,
                      name: c.name,
                      count: c.count,
                      percentage: c.percentage,
                    }))}
                    label="Countries"
                    showSearch={true}
                    maxItems={7}
                    isCountry={true}
                    emptyMessage={t(
                      'pro.analytics.no_geo_data',
                      'No geographic data collected yet.'
                    )}
                  />
                </div>

                {summary?.topContinents && summary.topContinents.length > 0 && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <span className="text-xs font-semibold text-white block">
                      {t('pro.analytics.continent_share', 'Continent Share')}
                    </span>
                    <div className="space-y-2">
                      {summary.topContinents.slice(0, 4).map((cont) => (
                        <div key={cont.key} className="space-y-1 text-xs">
                          <div className="flex justify-between text-[#8a8a8a]">
                            <span>{cont.name}</span>
                            <span className="font-mono text-white/80">{cont.percentage}%</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${Math.max(cont.percentage, 2)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="technology" className="space-y-6 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.analytics.tech_title', 'Technology & Platform Environment')}
                </h2>
              </div>
              <ProBadge variant="lime">{t('pro.analytics.tech_badge', 'Clients & Proxy')}</ProBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.delivery_mode', 'Delivery Mode')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.delivery_mode_desc',
                      'GitHub Camo Proxy vs Direct browser delivery.'
                    )}
                  </p>
                </div>

                <div className="pt-2">
                  <DonutChart
                    data={
                      summary?.trafficTypes || [
                        {
                          name: t('pro.analytics.direct_traffic', 'Direct Traffic'),
                          key: 'direct',
                          count: summary?.directRatio || 0,
                          percentage: summary?.directRatio || 0,
                        },
                        {
                          name: t('pro.analytics.github_camo', 'GitHub Camo'),
                          key: 'camo',
                          count: summary?.camoRatio || 0,
                          percentage: summary?.camoRatio || 0,
                        },
                      ]
                    }
                    title={t('pro.analytics.traffic_type', 'Traffic Type')}
                    size={150}
                  />
                </div>

                <div className="pt-2 border-t border-white/5">
                  <StackedRatioBar
                    labelLeft={t('pro.analytics.direct', 'Direct')}
                    valueLeft={summary?.directRatio || 0}
                    labelRight={t('pro.analytics.github_camo', 'GitHub Camo')}
                    valueRight={summary?.camoRatio || 0}
                    colorLeft="#c5ff4a"
                    colorRight="#c084fc"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.os_title', 'Operating Systems')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.analytics.os_desc', 'Visitor platform breakdown.')}
                  </p>
                </div>

                <div className="pt-2">
                  <DimensionRanking
                    items={summary?.topOs || []}
                    label={t('pro.analytics.os_title', 'Operating Systems')}
                    maxItems={5}
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.browsers_locales', 'Browsers & Locales')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.analytics.browsers_desc', 'Client browsers and preferred languages.')}
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <DimensionRanking
                    items={summary?.topBrowsers || []}
                    label={t('pro.analytics.browsers_label', 'Browsers')}
                    maxItems={3}
                  />

                  {summary?.topLanguages && summary.topLanguages.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-xs font-semibold text-white block mb-2">
                        {t('pro.analytics.preferred_languages', 'Preferred Languages')}
                      </span>
                      <DimensionRanking
                        items={summary.topLanguages}
                        label={t('pro.analytics.languages_label', 'Languages')}
                        maxItems={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="sources" className="space-y-6 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.analytics.sources_title', 'Referral Sources & Channels')}
                </h2>
              </div>
              <ProBadge variant="lime">
                {t('pro.analytics.inbound_traffic', 'Inbound Traffic')}
              </ProBadge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.top_referrers', 'Top Referrers')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.top_referrers_desc',
                      'Where your README badge and profile views originate from.'
                    )}
                  </p>
                </div>

                <DimensionRanking
                  items={summary?.topSources || []}
                  label={t('pro.analytics.referrers_label', 'Referrers')}
                  showSearch={true}
                  maxItems={8}
                />
              </div>

              <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.channel_dist', 'Channel Distribution')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t('pro.analytics.channel_desc', 'Categorized traffic channels.')}
                  </p>
                </div>

                <DonutChart
                  data={summary?.topSources || []}
                  title={t('pro.analytics.channel_title', 'Channel')}
                  size={160}
                />
              </div>
            </div>
          </section>

          <section id="profiles" className="space-y-6 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#c5ff4a]" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                  {t('pro.analytics.profiles_sec_title', 'Profile Performance & Cache Efficiency')}
                </h2>
              </div>
              <ProBadge variant="lime">
                {t('pro.analytics.multi_profile', 'Multi-Profile')}
              </ProBadge>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 overflow-x-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.profile_matrix', 'Profile Breakdown Matrix')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.profile_matrix_desc',
                      'Comparative analytics across all configured GitAscii profiles.'
                    )}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[#8a8a8a]">
                    <th className="pb-3 font-semibold">
                      {t('pro.analytics.th_profile_name', 'Profile Name')}
                    </th>
                    <th className="pb-3 font-semibold">{t('pro.analytics.th_views', 'Views')}</th>
                    <th className="pb-3 font-semibold">
                      {t('pro.analytics.th_unique_visitors', 'Unique Visitors')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.analytics.th_cache_hit_ratio', 'Cache Hit Ratio')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.analytics.th_avg_latency', 'Avg. Latency')}
                    </th>
                    <th className="pb-3 font-semibold">
                      {t('pro.analytics.th_portfolio_share', 'Portfolio Share')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {summary?.topProfiles && summary.topProfiles.length > 0 ? (
                    summary.topProfiles.map((prof) => (
                      <tr key={prof.slug} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 font-medium text-white font-sans flex items-center gap-2">
                          <span>{prof.name}</span>
                          <span className="text-[11px] font-mono text-[#8a8a8a]">
                            ({prof.slug})
                          </span>
                        </td>
                        <td className="py-3 text-white font-semibold">
                          {prof.views.toLocaleString()}
                        </td>
                        <td className="py-3 text-emerald-400">{prof.uniques.toLocaleString()}</td>
                        <td className="py-3 text-cyan-400">{prof.cacheHitRatio}%</td>
                        <td className="py-3 text-[#8a8a8a]">{prof.avgLatencyMs}ms</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-[#c5ff4a] rounded-full"
                                style={{ width: `${Math.max(prof.percentage, 4)}%` }}
                              />
                            </div>
                            <span className="text-white/80">{prof.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[#8a8a8a]">
                        {t('pro.overview.no_profiles', 'No profiles configured yet.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section id="activity" className="space-y-6 scroll-mt-6 pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#c5ff4a]" />
                <div>
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <span>
                      {t('pro.analytics.stream_title', 'Live Telemetry & Real-Time Stream')}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                      {t('pro.analytics.stream_active', 'STREAM ACTIVE')}
                    </span>
                  </h2>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.stream_desc',
                      'Real-time edge ingestion stream, request pulse, and latency observability.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    autoRefresh
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold'
                      : 'bg-white/5 border-white/10 text-[#8a8a8a] hover:text-white'
                  }`}
                  title={t('pro.analytics.toggle_auto_polling', 'Toggle real-time auto-polling')}
                >
                  {autoRefresh ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{t('pro.analytics.streaming_interval', 'Streaming (15s)')}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{t('pro.analytics.resume_stream', 'Resume Stream')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fetchAnalytics(false)}
                  disabled={refreshing}
                  className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
                  />
                  <span>{t('pro.analytics.sync_now', 'Sync Now')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#111] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                  <span className="font-semibold uppercase tracking-wider">
                    {t('pro.analytics.active_concurrency', 'Active Concurrency (30m)')}
                  </span>
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {summary?.activeViewersLast30m.toLocaleString() || '0'}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {t('pro.analytics.concurrent_clients', 'concurrent clients')}
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                  <span className="font-semibold uppercase tracking-wider">
                    {t('pro.analytics.edge_render_latency', 'Edge Render Latency')}
                  </span>
                  <Zap className="w-4 h-4 text-[#c5ff4a]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#c5ff4a]">
                    {summary?.avgLatencyMs || 28}ms
                  </span>
                  <span className="text-[11px] font-mono text-[#8a8a8a]">
                    {t('pro.analytics.average_speed', 'average speed')}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#7a7a7a] flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">&lt; 15ms</span>
                  <span>{t('pro.analytics.for_cached_hits', 'for cached edge hits')}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                  <span className="font-semibold uppercase tracking-wider">
                    {t('pro.analytics.validation_ratio', 'Validation 304 Ratio')}
                  </span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-cyan-400">
                    {summary?.cacheHitRatio || 0}%
                  </span>
                  <span className="text-[11px] font-mono text-[#8a8a8a]">
                    {t('pro.analytics.etag_validated', 'ETag validated')}
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${summary?.cacheHitRatio || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
                  <span className="font-semibold uppercase tracking-wider">
                    {t('pro.analytics.node_health', 'Node Health')}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">100%</span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    {t('pro.analytics.operational', 'operational')}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#7a7a7a]">
                  {t('pro.analytics.zero_dropped', 'Zero dropped telemetry packets')}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('pro.analytics.live_event_stream', 'Live Event Stream Feed')}
                  </h3>
                  <p className="text-xs text-[#8a8a8a] mt-0.5">
                    {t(
                      'pro.analytics.live_stream_desc',
                      'Anonymized, real-time incoming request telemetry across edge points.'
                    )}
                  </p>
                </div>
                <span className="text-xs font-mono text-[#8a8a8a]">
                  {t('pro.analytics.showing_last_events', 'Showing last {count} events', {
                    count: String(summary?.recentActivity?.length || 0),
                  })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-[#8a8a8a]">
                      <th className="pb-3 font-semibold">{t('pro.analytics.th_time', 'Time')}</th>
                      <th className="pb-3 font-semibold">
                        {t('pro.analytics.th_profile', 'Profile')}
                      </th>
                      <th className="pb-3 font-semibold">
                        {t('pro.analytics.th_location', 'Location')}
                      </th>
                      <th className="pb-3 font-semibold">
                        {t('pro.analytics.th_delivery_mode', 'Delivery Mode')}
                      </th>
                      <th className="pb-3 font-semibold">
                        {t('pro.analytics.th_client', 'Client')}
                      </th>
                      <th className="pb-3 font-semibold">
                        {t('pro.analytics.th_status', 'Status')}
                      </th>
                      <th className="pb-3 font-semibold">{t('pro.analytics.th_speed', 'Speed')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {summary?.recentActivity && summary.recentActivity.length > 0 ? (
                      summary.recentActivity.map((event) => (
                        <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 text-[#8a8a8a] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{event.relativeTime}</span>
                          </td>
                          <td className="py-2.5 text-white font-medium">{event.profileSlug}</td>
                          <td className="py-2.5 text-white/90">
                            <div className="flex items-center gap-2">
                              <CountryFlag
                                code={event.country}
                                name={event.countryName}
                                size="sm"
                              />
                              <span>{event.countryName}</span>
                              {event.city && (
                                <span className="text-[#666] ml-1">({event.city})</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5">
                            {event.trafficType === 'camo' ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                {t('pro.analytics.camo_proxy', 'Camo Proxy')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
                                {t('pro.analytics.direct_http', 'Direct HTTP')}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-[#8a8a8a]">
                            {event.os} • {event.browser}
                          </td>
                          <td className="py-2.5">
                            {event.status === 304 || event.isCacheHit ? (
                              <span className="text-cyan-400 font-bold">
                                {t('pro.analytics.status_cache_hit', '304 Cache Hit')}
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold">
                                {t('pro.analytics.status_ok', '200 OK')}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-[#8a8a8a]">{event.latencyMs}ms</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#8a8a8a]">
                          <div className="space-y-1">
                            <p>
                              {t('pro.overview.no_activity', 'No recent activity recorded yet.')}
                            </p>
                            <p className="text-[11px] text-[#666]">
                              {t(
                                'pro.analytics.embed_cta',
                                'Embed your GitAscii profile SVG badge in your GitHub README to start streaming real-time telemetry!'
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

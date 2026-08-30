'use client'

import {
  ChevronDown,
  Cpu,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Layers,
  Radio,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { AnalyticsSummary, ProProfileRecord, TimeRange } from '../../types'
import {
  formatLocalizedCountry,
  formatLocalizedDay,
  formatUtcHourToLocal,
} from '../../utils/proFormatters'
import { CountryFlag } from '../CountryFlag'
import { ProHeader } from '../ProHeader'
import { AnalyticsGeoSection } from './AnalyticsGeoSection'
import { AnalyticsProfilesSection } from './AnalyticsProfilesSection'
import { AnalyticsSidebarNav, type SectionId } from './AnalyticsSidebarNav'
import { AnalyticsDashboardSkeleton } from './AnalyticsSkeleton'
import { AnalyticsTechSourcesSection } from './AnalyticsTechSourcesSection'
import { AnalyticsTelemetrySection } from './AnalyticsTelemetrySection'
import { AnalyticsTrafficSection } from './AnalyticsTrafficSection'

export const AnalyticsDashboard: React.FC = () => {
  const { t, language } = useI18n()
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [range, setRange] = useState<TimeRange>('30d')
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [compareEnabled, setCompareEnabled] = useState(true)
  const [activeSection, setActiveSection] = useState<SectionId>('overview')
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [feedPage, setFeedPage] = useState(1)
  const [feedPageSize, setFeedPageSize] = useState(10)
  const [profiles, setProfiles] = useState<ProProfileRecord[]>([])

  const exportDropdownRef = useRef<HTMLDivElement>(null)
  const contentContainerRef = useRef<HTMLDivElement>(null)

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch(API_ENDPOINTS.PRO.PROFILES)
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
      }
    } catch (err) {
      console.warn('Failed to fetch profiles for analytics:', err)
    }
  }, [])

  useEffect(() => {
    void fetchProfiles()
  }, [fetchProfiles])

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

  const exportData = (format: 'csv' | 'json') => {
    if (!summary) return
    const filename = `gitascii_analytics_${selectedProfile}_${range}_${new Date().toISOString().slice(0, 10)}.${format}`
    let content = ''
    let mime = 'text/plain'

    if (format === 'json') {
      content = JSON.stringify(summary, null, 2)
      mime = 'application/json'
    } else {
      const rows = [
        ['Date', 'Views', 'Unique Visitors', 'Cache Hits', 'Camo Proxy Views', 'Direct Views'],
        ...(summary.timeSeries || []).map((t) => [
          t.date,
          t.views,
          t.uniques,
          t.cacheHits || 0,
          t.camoViews || 0,
          t.directViews || 0,
        ]),
      ]
      content = rows.map((r) => r.join(',')).join('\n')
      mime = 'text/csv'
    }

    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
  }

  if (loading) {
    return <AnalyticsDashboardSkeleton />
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <AnalyticsSidebarNav
        activeSection={activeSection}
        onSelectSection={scrollToSection}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        profiles={profiles}
        activeLiveCount={summary?.requestsLast30m ?? summary?.activeViewersLast30m ?? 0}
      />

      <div
        ref={contentContainerRef}
        id="analytics-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden h-screen flex flex-col min-w-0 max-w-full"
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

        <div className="p-6 sm:p-8 space-y-8 max-w-[1700px] w-full mx-auto min-w-0 max-w-full overflow-x-hidden">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/[0.06] rounded overflow-hidden border border-white/[0.08]">
              <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#777]">
                    {t('pro.kpi.total_views', 'Total Image Requests')}
                  </span>
                  <div className="p-1 rounded bg-[#c5ff4a]/10 border border-[#c5ff4a]/20">
                    <Eye className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-[#c5ff4a] tracking-tight">
                  {(summary?.totalRequests ?? summary?.totalViews ?? 0).toLocaleString()}
                </p>
                {compareEnabled && summary?.growthRateViews !== undefined ? (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
                        summary.growthRateViews >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {summary.growthRateViews >= 0
                        ? `+${summary.growthRateViews}%`
                        : `${summary.growthRateViews}%`}
                    </span>
                    <span className="text-[#666]">{t('pro.stat.vs_prev', 'vs prev')}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#777] block font-medium">
                    {t('pro.analytics.observed_30d', '30d observed')}
                  </span>
                )}
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
                <p className="text-2xl font-bold font-mono text-white tracking-tight">
                  {(summary?.uniqueSources ?? summary?.uniqueVisitors ?? 0).toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
                  {`${summary?.cacheHitRatio || 0}%`}
                </p>
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
                <p className="text-2xl font-bold font-mono text-white tracking-tight">
                  {`${summary?.avgLatencyMs || 28}ms`}
                </p>
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
                <p className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {(
                    summary?.requestsLast30m ??
                    summary?.activeViewersLast30m ??
                    0
                  ).toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold font-mono text-white tracking-tight">
                  {(summary?.avgDailyRequests ?? summary?.avgDailyViews ?? 0).toLocaleString()}
                </p>
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
                <span className="text-white font-bold">
                  {formatLocalizedDay(summary?.peakDay.day, language)}
                </span>
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.peak_hour', 'Peak Hour:')}
                </span>
                <span className="text-white font-bold">
                  {formatUtcHourToLocal(summary?.peakHour.hour)}
                </span>
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.top_country', 'Top Country:')}
                </span>
                <span className="text-white font-bold flex items-center gap-1.5 truncate">
                  {summary?.topCountries[0] ? (
                    <>
                      <CountryFlag
                        code={summary.topCountries[0].code}
                        name={formatLocalizedCountry(
                          summary.topCountries[0].code,
                          summary.topCountries[0].name,
                          language,
                          t
                        )}
                        size="sm"
                      />
                      <span className="truncate">
                        {formatLocalizedCountry(
                          summary.topCountries[0].code,
                          summary.topCountries[0].name,
                          language,
                          t
                        )}
                      </span>
                    </>
                  ) : (
                    formatLocalizedCountry('US', 'United States', language, t)
                  )}
                </span>
              </div>
              <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#666] text-[11px]">
                  {t('pro.insights.top_referrer', 'Top Referrer:')}
                </span>
                <span className="text-white font-bold truncate max-w-[140px]">
                  {summary?.topSources[0]?.name || 'GitHub'}
                </span>
              </div>
            </div>
          </section>

          <AnalyticsTrafficSection
            summary={summary}
            range={range}
            compareEnabled={compareEnabled}
          />

          <AnalyticsGeoSection
            summary={summary}
            selectedCountryCode={selectedCountryCode}
            setSelectedCountryCode={setSelectedCountryCode}
          />

          <AnalyticsTechSourcesSection summary={summary} />

          <AnalyticsProfilesSection summary={summary} />

          <AnalyticsTelemetrySection
            summary={summary}
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            refreshing={refreshing}
            onFetchAnalytics={fetchAnalytics}
            feedPage={feedPage}
            setFeedPage={setFeedPage}
            feedPageSize={feedPageSize}
            setFeedPageSize={setFeedPageSize}
          />
        </div>
      </div>
    </div>
  )
}

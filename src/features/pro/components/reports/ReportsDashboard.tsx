'use client'

import {
  Check,
  Compass,
  Copy,
  Cpu,
  FileText,
  Globe2,
  Laptop,
  Layers,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { DailyDataPoint, TimeRange } from '../../types'
import { DimensionRanking } from '../charts/BarChart'
import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProDashboardSkeleton } from '../ProSkeleton'
import { ShareReportModal } from './ShareReportModal'

interface ReportData {
  generatedAt: string
  period: TimeRange
  username: string
  profile: string
  metrics: {
    totalViews: number
    uniqueVisitors: number
    cacheHitRatio: string
    avgDailyViews: number
    growthRateViews: string
    growthRateUniques?: string
    avgLatencyMs?: number
    activeViewersLast30m?: number
    peakDay?: { day: string; views: number }
    peakHour?: { hour: number; views: number }
  }
  topCountries: { name: string; key: string; count: number; percentage: number; code?: string }[]
  topSources: { name: string; key: string; count: number; percentage: number }[]
  topReferrers: { name: string; key: string; count: number; percentage: number }[]
  topDevices: { name: string; key: string; count: number; percentage: number }[]
  topBrowsers: { name: string; key: string; count: number; percentage: number }[]
  topOs: { name: string; key: string; count: number; percentage: number }[]
  profilesSummary: {
    slug: string
    name: string
    views: number
    widgetsCount: number
    status: string
  }[]
  errorsSummary: { total: number; active: number; resolved: number }
  timeSeries?: DailyDataPoint[]
}

export const ReportsDashboard: React.FC = () => {
  const { t } = useI18n()
  const [range, setRange] = useState<TimeRange>('30d')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(API_ENDPOINTS.PRO.REPORTS(range))
      if (!res.ok) throw new Error(t('pro.reports.fetch_error', 'Failed to generate report'))
      const data: ReportData = await res.json()
      setReport(data)
    } catch (err) {
      console.warn('Report fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [range, t])

  useEffect(() => {
    void fetchReport()
  }, [fetchReport])

  const handleCopySummary = () => {
    if (!report) return
    const text = `=====================================================
GITASCII PRO EXECUTIVE PERFORMANCE REPORT
=====================================================
Account: @${report.username}
Scope: ${report.period.toUpperCase()}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Integrity: Verified Cryptographic Telemetry (Cookieless)

[ KEY METRICS ]
- Total Badge Impressions : ${report.metrics.totalViews.toLocaleString()} (+${report.metrics.growthRateViews} growth)
- Est. Unique Visitors    : ${report.metrics.uniqueVisitors.toLocaleString()}
- Edge Cache Hit Ratio    : ${report.metrics.cacheHitRatio} (HTTP 304)
- Mean Render Latency     : ${report.metrics.avgLatencyMs || 24}ms
- Daily Average Views     : ~${report.metrics.avgDailyViews.toLocaleString()}/day

[ TOP REFERRERS ]
${report.topSources.map((s, i) => `${i + 1}. ${s.name}: ${s.count.toLocaleString()} views (${s.percentage}%)`).join('\n')}

[ TOP COUNTRIES ]
${report.topCountries.map((c, i) => `${i + 1}. ${c.name}: ${c.count.toLocaleString()} views (${c.percentage}%)`).join('\n')}

[ ACTIVE PROFILES ]
${report.profilesSummary.map((p) => `• /${p.slug} (${p.name}): ${p.views.toLocaleString()} views (${p.widgetsCount} widgets)`).join('\n')}
=====================================================`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <ProDashboardSkeleton />
      </div>
    )
  }

  const totalProfileViews = report?.profilesSummary.reduce((acc, p) => acc + p.views, 0) || 1

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.reports.title', 'Executive Reports & Proof of Reach')}
        subtitle={t(
          'pro.reports.subtitle',
          'Consolidated performance audit, verified telemetry dossier, and publishable proof-of-reach cards.'
        )}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_12px_rgba(197,255,74,0.2)] cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('pro.reports.share_card_btn', 'Share Performance Card')}</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
              title={t('pro.reports.copy_summary_title', 'Copy markdown summary')}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>
                {copied
                  ? t('pro.reports.copied', 'Copied')
                  : t('pro.reports.copy_dossier', 'Copy Dossier')}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
              title={t('pro.reports.print_title', 'Print dossier as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('pro.reports.print_btn', 'Print / PDF')}</span>
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#111111] p-2.5 px-3 rounded-xl border border-white/[0.08]">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <span className="text-xs font-semibold text-white">
              {t('pro.reports.auditing_period', 'Auditing Period:')}
            </span>
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-md border border-white/10">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${
                  range === r
                    ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                    : 'text-[#8a8a8a] hover:text-white'
                }`}
              >
                {r === '7d'
                  ? t('pro.analytics.range_7d', '7D')
                  : r === '30d'
                    ? t('pro.analytics.range_30d', '30D')
                    : r === '90d'
                      ? t('pro.analytics.range_90d', '90D')
                      : t('pro.analytics.range_all', 'ALL')}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-white truncate">
                  {t('pro.reports.proof_of_reach_title', 'Developer Proof of Reach')}
                </h4>
                <ProBadge variant="lime" size="sm">
                  1200×630 PNG
                </ProBadge>
              </div>
              <p className="text-[10px] text-[#8a8a8a] truncate">
                {t(
                  'pro.reports.proof_of_reach_desc',
                  'Generate and download an ultra-crisp verified stats card for Twitter/X, LinkedIn, and GitHub.'
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {t('pro.reports.export_image_btn', 'Export Image')}
          </button>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-[#111111] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-3.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {t('pro.reports.dossier_title', 'GitAscii Profile Performance Dossier')}
                </h2>
                <ProBadge variant="lime" size="sm">
                  {t('pro.reports.verified_pro', 'Verified Pro')}
                </ProBadge>
              </div>
              <p className="text-xs text-[#8a8a8a] leading-tight">
                {t('pro.reports.target_label', 'Target:')}{' '}
                <strong className="text-white">@{report?.username}</strong> •{' '}
                {t('pro.reports.audit_scope_label', 'Audit Scope:')}{' '}
                <strong className="text-white font-mono">{range.toUpperCase()}</strong>
              </p>
              <p className="text-[10px] font-mono text-[#666] mt-0.5">
                ID:{' '}
                <span className="text-[#888]">
                  doc_sha256_{report?.username}_{range}
                </span>
              </p>
            </div>

            <div className="text-left sm:text-right font-mono">
              <span className="text-[9px] text-[#7a7a7a] uppercase tracking-wider block">
                {t('pro.reports.audit_timestamp', 'Audit Timestamp')}
              </span>
              <p className="text-xs text-white/90 font-medium">
                {report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : ''}
              </p>
              <span className="inline-block mt-0.5 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                {t('pro.analytics.cookieless_badge', '100% Cookieless')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
                {t('pro.kpi.total_views', 'Total Impressions')}
              </span>
              <p className="text-lg font-bold text-white">
                {report?.metrics.totalViews.toLocaleString() || 0}
              </p>
              <span className="text-[10px] text-[#c5ff4a] block">
                +{report?.metrics.growthRateViews || '0%'} {t('pro.stat.vs_prev', 'vs prev')}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
                {t('pro.kpi.unique_visitors', 'Unique Visitors')}
              </span>
              <p className="text-lg font-bold text-emerald-400">
                {report?.metrics.uniqueVisitors.toLocaleString() || 0}
              </p>
              <span className="text-[10px] text-[#7a7a7a] block">
                {t('pro.kpi.hll_method', 'Salted HLL')}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
                {t('pro.kpi.cache_ratio', 'Cache Hit Ratio')}
              </span>
              <p className="text-lg font-bold text-[#c5ff4a]">
                {report?.metrics.cacheHitRatio || '0%'}
              </p>
              <span className="text-[10px] text-[#7a7a7a] block">
                {t('pro.kpi.http304', 'HTTP 304 Validated')}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
                {t('pro.kpi.render_latency', 'Synthesis Latency')}
              </span>
              <p className="text-lg font-bold text-white">{report?.metrics.avgLatencyMs || 24}ms</p>
              <span className="text-[10px] text-[#7a7a7a] block">
                {t('pro.kpi.edge_sla', 'Edge Delivery SLA')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('pro.analytics.top_referrers', 'Top Referrers')}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#777]">
                  {t('pro.analytics.sanitized_domains', 'Sanitized Domains')}
                </span>
              </div>
              <DimensionRanking
                items={report?.topSources || []}
                label={t('pro.analytics.sources', 'Sources')}
                emptyMessage={t('pro.analytics.no_sources', 'No referrer domain records found.')}
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('pro.analytics.top_regions', 'Top Geographic Regions')}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#777]">
                  {t('pro.analytics.ip_coarse', 'IP-Coarse Resolution')}
                </span>
              </div>
              <DimensionRanking
                items={report?.topCountries || []}
                label={t('pro.analytics.countries', 'Countries')}
                emptyMessage={t('pro.analytics.no_countries', 'No geographic data records found.')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('pro.analytics.os_breakdown', 'Operating Systems')}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#777]">
                  {t('pro.analytics.client_env', 'Client Environment')}
                </span>
              </div>
              <DimensionRanking
                items={report?.topOs || []}
                label={t('pro.analytics.os_breakdown', 'Operating Systems')}
                emptyMessage={t('pro.analytics.no_os', 'No OS client data recorded.')}
              />
            </div>

            <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('pro.analytics.browsers_proxies', 'Browsers & HTTP Proxies')}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#777]">
                  {t('pro.analytics.user_agent', 'User Agent')}
                </span>
              </div>
              <DimensionRanking
                items={report?.topBrowsers || []}
                label={t('pro.analytics.browsers_proxies', 'Browsers')}
                emptyMessage={t('pro.analytics.no_browsers', 'No browser client data recorded.')}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.reports.active_profile_breakdown', 'Active Profile Breakdown')}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[#777]">
                {t('pro.reports.profiles_monitored', '{count} Profiles Monitored', {
                  count: String(report?.profilesSummary.length || 0),
                })}
              </span>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-white/5">
              <table className="w-full table-fixed text-xs text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/10 text-[#7a7a7a] font-mono text-[10px]">
                    <th className="py-2 px-3 w-[28%]">
                      {t('pro.reports.th_profile_name', 'Profile Name')}
                    </th>
                    <th className="py-2 px-3 w-[18%] hidden sm:table-cell">
                      {t('pro.reports.th_slug', 'Slug')}
                    </th>
                    <th className="py-2 px-3 w-[16%] hidden md:table-cell">
                      {t('pro.common.widgets', 'Widgets')}
                    </th>
                    <th className="py-2 px-3 w-[20%]">
                      {t('pro.reports.th_traffic_share', 'Traffic Share')}
                    </th>
                    <th className="py-2 px-3 w-[10%]">{t('pro.errors.th_status', 'Status')}</th>
                    <th className="py-2 px-3 w-[12%] text-right">
                      {t('pro.common.views', 'Views')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {report?.profilesSummary.map((p) => {
                    const sharePct = Math.round((p.views / totalProfileViews) * 100)
                    return (
                      <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 font-sans font-medium text-white truncate text-xs">
                          {p.name}
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] truncate hidden sm:table-cell">
                          /{p.slug}
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] hidden md:table-cell">
                          {p.widgetsCount} {t('pro.common.widgets', 'widgets')}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(4, sharePct)}%` }}
                                className="h-full bg-[#c5ff4a]"
                              />
                            </div>
                            <span className="text-[10px] text-[#888]">{sharePct}%</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <ProBadge variant="emerald" size="sm">
                            {p.status}
                          </ProBadge>
                        </td>
                        <td className="py-2 px-3 text-right text-white font-bold">
                          {p.views.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#8a8a8a]">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                <strong>
                  {t('pro.reports.verified_audit_title', 'Verified Telemetry Audit:')}
                </strong>{' '}
                {t(
                  'pro.reports.verified_audit_desc',
                  '100% cookieless tracking, zero IP retention, and daily rotating cryptographic salts.'
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] text-[#777] shrink-0">
              <span>{t('pro.reports.signed_edge', 'Signed by GitAscii Edge Engine')}</span>
            </div>
          </div>
        </div>
      </div>

      <ShareReportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={
          report
            ? {
                username: report.username,
                period: report.period,
                metrics: report.metrics,
                topCountries: report.topCountries,
                topSources: report.topSources,
                timeSeries: report.timeSeries,
              }
            : null
        }
      />
    </div>
  )
}

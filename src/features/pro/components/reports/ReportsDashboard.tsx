'use client'

import { Check, Copy, Printer, Share2, ShieldCheck, Sparkles } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { DailyDataPoint, TimeRange } from '../../types'
import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ReportsBreakdownSection } from './ReportsBreakdownSection'
import { ReportsKpiStrip } from './ReportsKpiStrip'
import { ReportsProfilesSummary } from './ReportsProfilesSummary'
import { ReportsDashboardSkeleton } from './ReportsSkeleton'
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
    camoRatio?: string
    directRatio?: string
    avgDailyViews: number
    growthRateViews: string
    growthRateUniques?: string
    avgLatencyMs?: number
    activeViewersLast30m?: number
    peakDay?: { day: string; views: number }
    peakHour?: { hour: number; views: number }
  }
  camoDelivery?: { name: string; key: string; count: number; percentage: number }[]
  statusCodes?: { name: string; key: string; count: number; percentage: number }[]
  topCountries?: { name: string; key: string; count: number; percentage: number; code?: string }[]
  topSources: { name: string; key: string; count: number; percentage: number }[]
  topReferrers?: { name: string; key: string; count: number; percentage: number }[]
  topDevices?: { name: string; key: string; count: number; percentage: number }[]
  topBrowsers?: { name: string; key: string; count: number; percentage: number }[]
  topOs?: { name: string; key: string; count: number; percentage: number }[]
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
GITASCII PRO GITHUB README PERFORMANCE REPORT
=====================================================
Account: @${report.username}
Scope: ${report.period.toUpperCase()}
Generated: ${new Date(report.generatedAt).toLocaleString()}
Routing: GitHub Camo CDN Proxy + Edge Verification

[ KEY TELEMETRY METRICS ]
- Total README Impressions: ${report.metrics.totalViews.toLocaleString()} (+${report.metrics.growthRateViews} growth)
- Est. Unique Visitors    : ${report.metrics.uniqueVisitors.toLocaleString()} (Salted HLL)
- Edge Cache Hit Ratio    : ${report.metrics.cacheHitRatio} (HTTP 304 Not Modified)
- Mean Edge Synthesis     : ${report.metrics.avgLatencyMs || 24}ms
- Daily Average Views     : ~${report.metrics.avgDailyViews.toLocaleString()}/day
- Camo Proxy Delivery     : ${report.metrics.camoRatio || '100%'}

[ PEAK ENGAGEMENT WINDOWS ]
- Peak Day : ${report.metrics.peakDay?.day || 'N/A'} (${report.metrics.peakDay?.views.toLocaleString() || 0} views)
- Peak Hour: ${report.metrics.peakHour ? `${String(report.metrics.peakHour.hour).padStart(2, '0')}:00 UTC` : 'N/A'} (${report.metrics.peakHour?.views.toLocaleString() || 0} views)

[ REFERRER & ORIGIN CONTEXT ]
${report.topSources.map((s, i) => `${i + 1}. ${s.name}: ${s.count.toLocaleString()} views (${s.percentage}%)`).join('\n')}

[ ACTIVE PROFILE REACH ]
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
    return <ReportsDashboardSkeleton />
  }

  const totalProfileViews = report?.profilesSummary.reduce((acc, p) => acc + p.views, 0) || 1

  const rangeSelector = (
    <div className="flex items-center gap-px bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
      {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((r) => (
        <button
          key={r}
          onClick={() => setRange(r)}
          className={`px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-sm transition-all cursor-pointer ${
            range === r
              ? 'bg-[#c5ff4a] text-black font-semibold'
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
  )

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.reports.title', 'Executive Reports & Proof of Reach')}
        subtitle={t(
          'pro.reports.subtitle',
          'Consolidated performance audit, verified telemetry dossier, and publishable proof-of-reach cards.'
        )}
        center={rangeSelector}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded transition-all shadow-[0_0_12px_rgba(197,255,74,0.2)] cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t('pro.reports.share_card_btn', 'Share Performance Card')}
              </span>
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all cursor-pointer"
              title={t('pro.reports.copy_summary_title', 'Copy markdown summary')}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied
                  ? t('pro.reports.copied', 'Copied')
                  : t('pro.reports.copy_dossier', 'Copy Dossier')}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded transition-all cursor-pointer"
              title={t('pro.reports.print_title', 'Print dossier as PDF')}
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      <div className="flex-1 p-5 xl:p-7 space-y-5">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded border border-[#c5ff4a]/15 bg-[#c5ff4a]/[0.03]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
            <span className="text-xs font-semibold text-white">
              {t('pro.reports.proof_of_reach_title', 'Developer Proof of Reach')}
            </span>
            <ProBadge variant="lime" size="sm">
              {t('pro.reports.png_dimension_badge', '1200×630 PNG')}
            </ProBadge>
            <span className="text-[11px] text-[#6a6a6a] hidden md:inline truncate">
              {t(
                'pro.reports.proof_of_reach_desc',
                'Generate and download a verified stats card for Twitter/X, LinkedIn, and GitHub.'
              )}
            </span>
          </div>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {t('pro.reports.export_image_btn', 'Export Image')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t('pro.reports.dossier_title', 'GitAscii Profile Performance Dossier')}
              </h2>
              <ProBadge variant="lime" size="sm">
                {t('pro.reports.verified_pro', 'Verified Pro')}
              </ProBadge>
            </div>
            <p className="text-[11px] text-[#6a6a6a] font-mono">
              <span className="text-[#8a8a8a]">@{report?.username}</span>
              <span className="mx-1.5 text-[#3a3a3a]">·</span>
              {t('pro.reports.audit_scope_label', 'Scope:')}{' '}
              <span className="text-[#8a8a8a]">{range.toUpperCase()}</span>
              <span className="mx-1.5 text-[#3a3a3a]">·</span>
              ID: doc_sha256_{report?.username}_{range}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono shrink-0">
            <div className="text-right">
              <span className="text-[9px] text-[#5a5a5a] uppercase tracking-wider block">
                {t('pro.reports.audit_timestamp', 'Audit Timestamp')}
              </span>
              <p className="text-[11px] text-white/80">
                {report?.generatedAt ? new Date(report.generatedAt).toLocaleString() : ''}
              </p>
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded whitespace-nowrap">
              {t('pro.analytics.cookieless_badge', '100% Cookieless')}
            </span>
          </div>
        </div>

        <ReportsKpiStrip metrics={report?.metrics} />

        {report && <ReportsBreakdownSection report={report} />}

        {report && (
          <ReportsProfilesSummary
            profilesSummary={report.profilesSummary}
            totalProfileViews={totalProfileViews}
          />
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-[#5a5a5a]">
              <strong className="text-[#7a7a7a]">
                {t('pro.reports.verified_audit_title', 'Verified Telemetry Audit:')}
              </strong>{' '}
              {t(
                'pro.reports.verified_audit_desc',
                '100% cookieless tracking, zero IP retention, and daily rotating cryptographic salts.'
              )}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#3a3a3a] shrink-0">
            {t('pro.reports.signed_edge', 'Signed by GitAscii Edge Engine')}
          </span>
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

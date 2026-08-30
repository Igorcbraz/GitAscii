'use client'

import { Activity, Clock, Compass, Network } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { DimensionRanking, StackedRatioBar } from '../charts/BarChart'

interface ReportsBreakdownSectionProps {
  report: {
    metrics: {
      camoRatio?: string
      directRatio?: string
      peakDay?: { day: string; views: number }
      peakHour?: { hour: number; views: number }
    }
    camoDelivery?: { name: string; key: string; count: number; percentage: number }[]
    statusCodes?: { name: string; key: string; count: number; percentage: number }[]
    topSources: { name: string; key: string; count: number; percentage: number }[]
  }
}

export const ReportsBreakdownSection: React.FC<ReportsBreakdownSectionProps> = ({ report }) => {
  const { t } = useI18n()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.reports.delivery_channel', 'Delivery Channel & Routing')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#555]">
            {t('pro.reports.delivery_sub', 'GitHub Camo vs Direct Embeds')}
          </span>
        </div>
        <StackedRatioBar
          labelLeft={t('pro.reports.camo_label', 'GitHub Camo Proxy')}
          valueLeft={parseInt(report.metrics.camoRatio || '0', 10)}
          labelRight={t('pro.reports.direct_label', 'Direct HTTP Embeds')}
          valueRight={parseInt(report.metrics.directRatio || '0', 10)}
          colorLeft="#a855f7"
          colorRight="#c5ff4a"
        />
        <DimensionRanking
          items={report.camoDelivery || []}
          label={t('pro.reports.delivery_channel', 'Delivery Channel')}
          emptyMessage={t('pro.reports.no_sources', 'No delivery data records found.')}
        />
      </section>

      <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.reports.status_codes', 'HTTP Status Code Breakdown')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#555]">
            {t('pro.reports.status_codes_sub', 'Edge Response Health')}
          </span>
        </div>
        <DimensionRanking
          items={report.statusCodes || []}
          label={t('pro.reports.status_codes', 'Status Codes')}
          emptyMessage={t('pro.reports.no_status_codes', 'No HTTP status codes recorded.')}
        />
      </section>

      <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.reports.traffic_source_analysis', 'Origin & Traffic Breakdown')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#555]">
            {t('pro.reports.traffic_source_sub', 'Referrer Domains & Embed Context')}
          </span>
        </div>
        <DimensionRanking
          items={report.topSources || []}
          label={t('pro.analytics.sources', 'Sources')}
          emptyMessage={t('pro.reports.no_referrers', 'No referrer domain records found.')}
        />
      </section>

      <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.reports.peak_activity', 'Peak Engagement Windows')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#555]">
            {t('pro.reports.peak_activity_sub', 'Optimal GitHub Traffic Times')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="space-y-1">
            <span className="text-[9px] text-[#555] uppercase tracking-widest block">
              {t('pro.reports.peak_day', 'Peak Traffic Day')}
            </span>
            <p className="text-lg font-bold text-white">{report.metrics.peakDay?.day || '—'}</p>
            <span className="text-[10px] text-[#c5ff4a] block">
              {report.metrics.peakDay?.views.toLocaleString() || 0} {t('pro.common.views', 'views')}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-[#555] uppercase tracking-widest block">
              {t('pro.reports.peak_hour', 'Peak Hour Window')}
            </span>
            <p className="text-lg font-bold text-purple-400">
              {report.metrics.peakHour
                ? `${String(report.metrics.peakHour.hour).padStart(2, '0')}:00 UTC`
                : '—'}
            </p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {report.metrics.peakHour?.views.toLocaleString() || 0}{' '}
              {t('pro.common.views', 'views')}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[#5a5a5a] leading-relaxed border-t border-white/[0.04] pt-2.5">
          <span className="text-purple-400/70 font-semibold">
            {t('pro.reports.camo_explanation_title', 'GitHub Camo Telemetry Note:')}{' '}
          </span>
          {t(
            'pro.reports.camo_explanation_desc',
            'Requests through GitHub READMEs are routed via Camo proxy nodes. Metrics reflect verified image cache validations (ETag/304), delivery speed, and engagement intervals without invasive tracking.'
          )}
        </p>
      </section>
    </div>
  )
}

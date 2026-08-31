'use client'

import { Compass, Eye, Radio, Users } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary } from '../../types'
import { ProStatCard } from '../ProStatCard'

interface AnalyticsKpiStripProps {
  summary: AnalyticsSummary | null
  activeLiveCount: number
}

export const AnalyticsKpiStrip: React.FC<AnalyticsKpiStripProps> = ({
  summary,
  activeLiveCount,
}) => {
  const { t } = useI18n()

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`
    return num.toLocaleString()
  }

  const totalViews = summary?.totalRequests ?? summary?.totalViews ?? 0
  const uniqueVisitors = summary?.uniqueSources ?? summary?.uniqueVisitors ?? 0
  const directRate = summary?.directRatio ?? 100

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <ProStatCard
        title={t('pro.analytics.kpi_total_views', 'Total Views')}
        value={formatNumber(totalViews)}
        icon={<Eye className="w-4 h-4 text-[#c5ff4a]" />}
        trend={summary?.growthRateViews}
        trendLabel={t('pro.analytics.vs_previous', 'vs previous period')}
        variant="lime"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_unique_visitors', 'Unique Visitors')}
        value={formatNumber(uniqueVisitors)}
        icon={<Users className="w-4 h-4 text-cyan-400" />}
        trend={summary?.growthRateUniques}
        trendLabel={t('pro.analytics.anonymized_hashes', 'anonymized daily hashes')}
        variant="default"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_direct_rate', 'Direct Traffic')}
        value={`${directRate}%`}
        icon={<Compass className="w-4 h-4 text-indigo-400" />}
        trendLabel={t('pro.analytics.direct_github_embeds', 'direct GitHub embeds')}
        variant="default"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_active_now', 'Active Now (5m)')}
        value={String(activeLiveCount)}
        icon={<Radio className="w-4 h-4 text-emerald-400" />}
        trendLabel={t('pro.analytics.live_realtime_streams', 'real-time telemetry')}
        variant="default"
      />
    </div>
  )
}

'use client'

import { Activity, CalendarDays, GitBranch, ShieldCheck } from 'lucide-react'
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
  const todayRequests = summary?.requestsToday ?? summary?.viewsToday ?? 0
  const camoRate = summary?.camoRatio ?? 0
  const trackedProfiles = summary?.topProfiles?.filter((profile) => profile.views > 0).length ?? 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <ProStatCard
        title={t('pro.analytics.kpi_total_views', 'Badge Fetches')}
        value={formatNumber(totalViews)}
        icon={<Activity className="w-4 h-4 text-[#c5ff4a]" />}
        trend={summary?.growthRateViews}
        trendLabel={t('pro.analytics.vs_previous', 'vs previous period')}
        variant="lime"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_unique_visitors', 'Fetches Today')}
        value={formatNumber(todayRequests)}
        icon={<CalendarDays className="w-4 h-4 text-cyan-400" />}
        trendLabel={t('pro.analytics.anonymized_hashes', 'observed badge requests')}
        variant="default"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_direct_rate', 'GitHub Camo')}
        value={`${camoRate}%`}
        icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
        trendLabel={t('pro.analytics.direct_github_embeds', 'share of observed fetches')}
        variant="default"
      />

      <ProStatCard
        title={t('pro.analytics.kpi_active_now', 'Active Profiles')}
        value={String(trackedProfiles || activeLiveCount)}
        icon={<GitBranch className="w-4 h-4 text-emerald-400" />}
        trendLabel={t('pro.analytics.live_realtime_streams', 'profiles with badge fetches')}
        variant="default"
      />
    </div>
  )
}

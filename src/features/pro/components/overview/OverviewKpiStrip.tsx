'use client'

import { AlertTriangle, Cpu, Eye, Users, Zap } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProOverviewData } from '../../types'

interface OverviewKpiStripProps {
  data: ProOverviewData | null
}

export const OverviewKpiStrip: React.FC<OverviewKpiStripProps> = ({ data }) => {
  const { t } = useI18n()

  const totalReqs = data?.totalRequests ?? data?.totalViews ?? 0
  const uniqueSrcs = data?.uniqueSources ?? data?.uniqueVisitors ?? 0
  const activeErrors = data?.activeErrorsCount ?? 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
      <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">
            {t('pro.kpi.total_views', 'Total Image Requests')}
          </span>
          <Eye className="w-3.5 h-3.5 text-[#c5ff4a]" />
        </div>
        <p className="text-xl font-bold text-[#c5ff4a]">{totalReqs.toLocaleString()}</p>
        <div className="flex items-center gap-1.5 text-[10px]">
          {data?.viewsTrendPercent !== undefined && (
            <span className="text-emerald-400 font-semibold">+{data.viewsTrendPercent}%</span>
          )}
          <span className="text-[#555]">{t('pro.kpi.vs_past_period', 'vs past period')}</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">
            {t('pro.kpi.unique_visitors', 'Est. Unique Sources')}
          </span>
          <Users className="w-3.5 h-3.5 text-[#8a8a8a]" />
        </div>
        <p className="text-xl font-bold text-white">{uniqueSrcs.toLocaleString()}</p>
        <span className="text-[10px] text-[#555] block">
          {t('pro.kpi.privacy_hashed', 'privacy-hashed')}
        </span>
      </div>

      <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">
            {t('pro.kpi.cache_validation', 'Cache Validation (304)')}
          </span>
          <Cpu className="w-3.5 h-3.5 text-[#8a8a8a]" />
        </div>
        <p className="text-xl font-bold text-white">{`${data?.cacheHitRatio ?? 98}%`}</p>
        <span className="text-[10px] text-[#555] block">
          {t('pro.kpi.fast_edge_cache', 'Fast Edge Cache')}
        </span>
      </div>

      <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">
            {t('pro.kpi.avg_render', 'Avg Server Latency')}
          </span>
          <Zap className="w-3.5 h-3.5 text-[#8a8a8a]" />
        </div>
        <p className="text-xl font-bold text-white">{`${data?.avgLatencyMs ?? 24}ms`}</p>
        <span className="text-[10px] text-[#555] block">
          {t('pro.kpi.execution_time', 'Execution Time')}
        </span>
      </div>

      <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">
            {t('pro.kpi.widget_health', 'Widget Health')}
          </span>
          <AlertTriangle
            className={`w-3.5 h-3.5 ${activeErrors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
          />
        </div>
        <p
          className={`text-xl font-bold ${activeErrors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}
        >
          {activeErrors}
        </p>
        <span className="text-[10px] text-[#555] block truncate">
          {activeErrors === 0
            ? t('pro.kpi.health_optimal', 'All systems healthy')
            : t('pro.kpi.health_action_needed', 'Action needed')}
        </span>
      </div>
    </div>
  )
}

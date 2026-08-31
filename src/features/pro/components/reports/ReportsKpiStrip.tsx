'use client'

import React from 'react'

import { useI18n } from '@/i18n'

interface ReportsKpiStripProps {
  metrics?: {
    totalViews: number
    uniqueVisitors: number
    cacheHitRatio: string
    growthRateViews: string
    avgLatencyMs?: number
  }
}

export const ReportsKpiStrip: React.FC<ReportsKpiStripProps> = ({ metrics }) => {
  const { t } = useI18n()

  const items = [
    {
      label: t('pro.kpi.total_views', 'Total Impressions'),
      value: metrics?.totalViews.toLocaleString() ?? '0',
      sub: `+${metrics?.growthRateViews ?? '0%'} ${t('pro.stat.vs_prev', 'vs prev')}`,
      subColor: 'text-[#c5ff4a]',
    },
    {
      label: t('pro.kpi.unique_visitors', 'Unique Visitors'),
      value: metrics?.uniqueVisitors.toLocaleString() ?? '0',
      sub: t('pro.kpi.hll_method', 'Salted HLL'),
      subColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      label: t('pro.kpi.cache_ratio', 'Cache Hit Ratio'),
      value: metrics?.cacheHitRatio ?? '0%',
      sub: t('pro.kpi.http304', 'HTTP 304 Validated'),
      subColor: 'text-[#7a7a7a]',
      valueColor: 'text-[#c5ff4a]',
    },
    {
      label: t('pro.kpi.render_latency', 'Synthesis Latency'),
      value: `${metrics?.avgLatencyMs ?? 24}ms`,
      sub: t('pro.kpi.edge_sla', 'Edge Delivery SLA'),
      subColor: 'text-[#7a7a7a]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
      {items.map(({ label, value, sub, subColor, valueColor }) => (
        <div key={label} className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
          <p className={`text-xl font-bold ${valueColor ?? 'text-white'}`}>{value}</p>
          <span className={`text-[10px] block ${subColor}`}>{sub}</span>
        </div>
      ))}
    </div>
  )
}

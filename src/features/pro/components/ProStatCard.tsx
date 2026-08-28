'use client'

import { ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

export interface ProStatCardProps {
  title: string
  value: string | number
  subValue?: string
  tooltipText?: string
  trend?: number
  trendLabel?: string
  icon: React.ReactNode
  variant?: 'default' | 'lime' | 'rose' | 'amber'
  className?: string
}

export const ProStatCard: React.FC<ProStatCardProps> = ({
  title,
  value,
  subValue,
  tooltipText,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  className = '',
}) => {
  const { t } = useI18n()
  const [showTooltip, setShowTooltip] = useState(false)
  const description = tooltipText || subValue
  const resolvedTrendLabel = trendLabel || t('pro.stat.vs_prev', 'vs prev. period')

  const getTrendBadge = () => {
    if (trend === undefined || trend === null) {
      return (
        <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#777] bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/5">
          <Minus className="w-2.5 h-2.5 text-[#666]" />
          <span>{t('pro.stat.live', 'live')}</span>
        </div>
      )
    }

    if (trend > 0) {
      return (
        <div className="inline-flex items-center gap-0.5 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          <ArrowUpRight className="w-3 h-3" />
          <span>+{trend}%</span>
        </div>
      )
    }

    if (trend < 0) {
      return (
        <div className="inline-flex items-center gap-0.5 text-[11px] font-mono font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
          <ArrowDownRight className="w-3 h-3" />
          <span>{trend}%</span>
        </div>
      )
    }

    return (
      <div className="inline-flex items-center gap-0.5 text-[11px] font-mono text-[#8a8a8a] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </div>
    )
  }

  const iconAccent = {
    default: 'text-[#8a8a8a] group-hover:text-white',
    lime: 'text-[#c5ff4a]',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
  }

  return (
    <div
      className={`group relative p-4 rounded-xl bg-[#111111] border border-white/[0.07] hover:border-white/15 transition-all duration-200 flex flex-col justify-between h-[132px] ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a] truncate">
            {title}
          </span>
          {description && (
            <div className="relative flex items-center">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-[#555] hover:text-[#bbb] transition-colors p-0.5 focus:outline-none"
                aria-label={t('pro.stat.details_aria', 'Metric details')}
              >
                <Info className="w-3 h-3" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-1.5 z-40 w-48 p-2 rounded-lg bg-[#1c1c1c] border border-white/15 shadow-2xl text-[11px] font-mono text-[#ccc] leading-snug backdrop-blur-md pointer-events-none animate-in fade-in-0 zoom-in-95">
                  {description}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`p-1.5 rounded-lg bg-white/[0.03] border border-white/5 transition-colors flex-shrink-0 ${iconAccent[variant]}`}
        >
          {icon}
        </div>
      </div>

      <div className="my-auto py-0.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-white block truncate">
          {value}
        </span>
      </div>

      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between gap-1 text-[11px] font-mono text-[#7a7a7a]">
        <div className="flex items-center gap-1.5 min-w-0">
          {getTrendBadge()}
          <span className="truncate text-[10px] text-[#666]">
            {trend !== undefined && trend !== null
              ? resolvedTrendLabel
              : t('pro.stat.rolling_telemetry', 'rolling telemetry')}
          </span>
        </div>
      </div>
    </div>
  )
}

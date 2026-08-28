'use client'

import { Search, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { DimensionMetric, HourlyDataPoint } from '../../types/analytics'
import { CountryFlag } from '../CountryFlag'

export interface HourlyBarChartProps {
  data: HourlyDataPoint[]
  height?: number
  className?: string
}

export const HourlyBarChart: React.FC<HourlyBarChartProps> = ({
  data,
  height = 200,
  className = '',
}) => {
  const { t } = useI18n()
  const maxViews = Math.max(...data.map((d) => d.views), 1)
  const peakHour = data.reduce(
    (max, d) => (d.views > max.views ? d : max),
    data[0] || { hour: 0, views: 0, camoViews: 0, directViews: 0 }
  )

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8a8a] bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-lg">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#c5ff4a]" />
          <span>{t('pro.charts.peak_window', 'Peak Traffic Window:')}</span>
        </div>
        <span className="text-white font-bold">
          {String(peakHour.hour).padStart(2, '0')}:00 UTC ({peakHour.views}{' '}
          {t('pro.common.views', 'views')})
        </span>
      </div>

      <div className="relative pt-4 pb-1">
        <div className="absolute inset-0 pt-4 pb-6 flex flex-col justify-between pointer-events-none opacity-15">
          <div className="border-b border-dashed border-white w-full" />
          <div className="border-b border-dashed border-white w-full" />
          <div className="border-b border-dashed border-white w-full" />
        </div>

        <div style={{ height: `${height}px` }} className="flex items-end gap-1 px-1 relative z-10">
          {data.map((d) => {
            const heightPct = Math.max(4, (d.views / maxViews) * 100)
            const camoPct = d.views > 0 ? (d.camoViews / d.views) * 100 : 0
            const directPct = 100 - camoPct
            const isPeak = d.hour === peakHour.hour && d.views > 0

            return (
              <div
                key={d.hour}
                className="flex-1 flex flex-col items-center justify-end group h-full relative"
              >
                <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1c1c1c] text-white border border-white/15 text-[10px] font-mono px-2.5 py-1.5 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap z-30 space-y-0.5">
                  <div className="font-bold text-[#c5ff4a] flex items-center justify-between gap-2">
                    <span>{String(d.hour).padStart(2, '0')}:00 UTC</span>
                    <span>
                      {d.views} {t('pro.common.views', 'views')}
                    </span>
                  </div>
                  <div className="text-[#8a8a8a] text-[9px] flex gap-2">
                    <span className="text-[#c5ff4a]">
                      {t('pro.charts.direct_label', 'Direct:')} {d.directViews}
                    </span>
                    <span className="text-purple-400">
                      {t('pro.charts.camo_label', 'Camo:')} {d.camoViews}
                    </span>
                  </div>
                </div>

                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-sm overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:brightness-125 ${
                    isPeak ? 'ring-1 ring-[#c5ff4a]' : ''
                  }`}
                >
                  {d.views > 0 ? (
                    <>
                      <div
                        style={{ height: `${directPct}%` }}
                        className="w-full bg-[#c5ff4a]/85 transition-all"
                      />
                      <div
                        style={{ height: `${camoPct}%` }}
                        className="w-full bg-purple-400/85 transition-all"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-white/[0.04]" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-[#7a7a7a] px-1 border-t border-white/5 pt-1.5">
        <span>00h</span>
        <span>04h</span>
        <span>08h</span>
        <span>12h</span>
        <span>16h</span>
        <span>20h</span>
        <span>23h</span>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8a8a8a] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#c5ff4a]" />
          <span>{t('pro.charts.direct_traffic', 'Direct Traffic')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>{t('pro.charts.camo_proxy', 'GitHub Camo Proxy')}</span>
        </div>
      </div>
    </div>
  )
}

export interface DimensionRankingProps {
  items: DimensionMetric[]
  label: string
  emptyMessage?: string
  showSearch?: boolean
  maxItems?: number
  isCountry?: boolean
  className?: string
}

export const DimensionRanking: React.FC<DimensionRankingProps> = ({
  items,
  label,
  emptyMessage,
  showSearch = false,
  maxItems = 8,
  isCountry = false,
  className = '',
}) => {
  const { t } = useI18n()
  const effectiveEmptyMessage =
    emptyMessage || t('pro.charts.no_data_recorded', 'No data recorded yet')
  const [searchTerm, setSearchTerm] = useState('')
  const [expanded, setExpanded] = useState(false)

  const cleanName = (name: string) => {
    return name.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u27BF🌐]/g, '').trim()
  }

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayed = expanded ? filtered : filtered.slice(0, maxItems)

  if (!items || items.length === 0) {
    return <div className="text-xs text-[#8a8a8a] py-6 text-center">{effectiveEmptyMessage}</div>
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showSearch && items.length > 5 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777]" />
          <input
            type="text"
            placeholder={t('pro.charts.search_dim', 'Search {label}...', {
              label: label.toLowerCase(),
            })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#c5ff4a]/50"
          />
        </div>
      )}

      <div className="space-y-2.5">
        {displayed.map((item, idx) => {
          const isCountryItem = isCountry
          const displayName = cleanName(item.name)

          return (
            <div key={item.key || idx} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] text-[#7a7a7a] w-5 flex-shrink-0">
                    {idx + 1}.
                  </span>

                  {isCountryItem ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <CountryFlag code={item.key} name={displayName} size="sm" />
                      <span className="font-medium text-white/90 truncate group-hover:text-white transition-colors">
                        {displayName}
                      </span>
                    </div>
                  ) : (
                    <span className="font-medium text-white/90 truncate group-hover:text-white transition-colors">
                      {displayName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] flex-shrink-0">
                  <span className="text-white font-medium">{item.count.toLocaleString()}</span>
                  <span className="text-[#8a8a8a]">({item.percentage}%)</span>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#c5ff4a]/80 group-hover:bg-[#c5ff4a] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > maxItems && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center py-1.5 text-xs font-mono text-[#c5ff4a] hover:underline cursor-pointer pt-1"
        >
          {expanded
            ? t('pro.charts.show_fewer', 'Show fewer')
            : t('pro.charts.show_all_entries', 'Show all {count} entries', {
                count: String(filtered.length),
              })}
        </button>
      )}
    </div>
  )
}

export interface StackedRatioBarProps {
  labelLeft: string
  valueLeft: number
  labelRight: string
  valueRight: number
  colorLeft?: string
  colorRight?: string
  className?: string
}

export const StackedRatioBar: React.FC<StackedRatioBarProps> = ({
  labelLeft,
  valueLeft,
  labelRight,
  valueRight,
  colorLeft = '#c5ff4a',
  colorRight = '#a855f7',
  className = '',
}) => {
  const total = valueLeft + valueRight || 1
  const pctLeft = Math.round((valueLeft / total) * 100)
  const pctRight = 100 - pctLeft

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorLeft }} />
          <span className="text-white font-medium">{labelLeft}</span>
          <span className="text-[#8a8a8a]">({pctLeft}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#8a8a8a]">({pctRight}%)</span>
          <span className="text-white font-medium">{labelRight}</span>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorRight }} />
        </div>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5">
        <div
          style={{ width: `${pctLeft}%`, backgroundColor: colorLeft }}
          className="h-full transition-all duration-500"
        />
        <div
          style={{ width: `${pctRight}%`, backgroundColor: colorRight }}
          className="h-full transition-all duration-500"
        />
      </div>
    </div>
  )
}

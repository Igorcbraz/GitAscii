'use client'

import React, { useMemo, useState } from 'react'

import { useI18n } from '@/i18n'

import type { DailyDataPoint, TimeRange } from '../../types/analytics'

export interface AreaChartProps {
  data: DailyDataPoint[]
  height?: number
  timeRange?: TimeRange
  showUniques?: boolean
  showCacheHits?: boolean
  showCamo?: boolean
  showPreviousPeriod?: boolean
  className?: string
}

type MetricKey = 'views' | 'uniques' | 'cacheHits' | 'camoViews' | 'directViews'

function formatXAxisDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-').map(Number)
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`
    }
  } catch {}
  return dateStr.slice(5)
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 180,
  timeRange: _timeRange,
  showUniques = true,
  showCacheHits = false,
  showCamo = false,
  showPreviousPeriod = true,
  className = '',
}) => {
  const { t } = useI18n()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [activeSeries, setActiveSeries] = useState<Record<MetricKey, boolean>>({
    views: true,
    uniques: showUniques,
    cacheHits: showCacheHits,
    camoViews: showCamo,
    directViews: false,
  })

  const tickIndices = useMemo(() => {
    if (!data || data.length <= 1) return [0]
    if (data.length <= 7) return data.map((_, i) => i)
    const count = Math.min(6, data.length)
    const step = (data.length - 1) / (count - 1)
    const indices = new Set<number>()
    for (let i = 0; i < count; i++) {
      indices.add(Math.round(i * step))
    }
    return Array.from(indices).sort((a, b) => a - b)
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className={`flex items-center justify-center text-xs text-[#8a8a8a] bg-white/[0.02] rounded-xl border border-white/5 ${className}`}
      >
        {t(
          'pro.charts.no_timeseries_data',
          'No time-series telemetry data available for the selected period.'
        )}
      </div>
    )
  }

  const maxValues: number[] = [10]
  data.forEach((d) => {
    if (activeSeries.views) maxValues.push(d.views)
    if (activeSeries.uniques) maxValues.push(d.uniques)
    if (activeSeries.cacheHits) maxValues.push(d.cacheHits)
    if (activeSeries.camoViews) maxValues.push(d.camoViews)
    if (activeSeries.directViews) maxValues.push(d.directViews)
    if (showPreviousPeriod && d.previousPeriodViews) maxValues.push(d.previousPeriodViews)
  })
  const maxValue = Math.max(...maxValues)

  const paddingBottom = 22
  const paddingTop = 12
  const paddingLeft = 40
  const paddingRight = 12

  const width = 860
  const chartHeight = height - paddingBottom - paddingTop
  const chartWidth = width - paddingLeft - paddingRight

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2
    return paddingLeft + (index / (data.length - 1)) * chartWidth
  }

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxValue) * chartHeight
  }

  const makePath = (getter: (d: DailyDataPoint) => number) => {
    const points = data.map((d, i) => `${getX(i)},${getY(getter(d))}`).join(' ')
    return `M ${points}`
  }

  const makeAreaPath = (getter: (d: DailyDataPoint) => number) => {
    const points = data.map((d, i) => `${getX(i)},${getY(getter(d))}`).join(' ')
    return `M ${getX(0)},${getY(0)} L ${points} L ${getX(data.length - 1)},${getY(0)} Z`
  }

  const activePoint = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className={`relative w-full overflow-hidden space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSeries((s) => ({ ...s, views: !s.views }))}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer border ${
              activeSeries.views
                ? 'bg-[#c5ff4a]/15 border-[#c5ff4a]/40 text-[#c5ff4a]'
                : 'bg-white/5 border-white/5 text-[#666]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff4a]" />
            <span>{t('pro.common.views', 'Views')}</span>
          </button>

          <button
            onClick={() => setActiveSeries((s) => ({ ...s, uniques: !s.uniques }))}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer border ${
              activeSeries.uniques
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/5 text-[#666]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{t('pro.common.uniques', 'Uniques')}</span>
          </button>

          <button
            onClick={() => setActiveSeries((s) => ({ ...s, cacheHits: !s.cacheHits }))}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer border ${
              activeSeries.cacheHits
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border-white/5 text-[#666]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{t('pro.charts.validations_304', '304 Validations')}</span>
          </button>

          <button
            onClick={() => setActiveSeries((s) => ({ ...s, camoViews: !s.camoViews }))}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer border ${
              activeSeries.camoViews
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                : 'bg-white/5 border-white/5 text-[#666]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>{t('pro.charts.github_camo', 'GitHub Camo')}</span>
          </button>
        </div>

        {showPreviousPeriod && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#777]">
            <span className="w-3 h-0.5 bg-white/40 border-t border-dashed border-white/60" />
            <span>{t('pro.stat.prev_period', 'Prev. Period')}</span>
          </div>
        )}
      </div>

      {activePoint && hoverIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-[#1c1c1c]/95 border border-white/15 px-3 py-2 rounded-lg shadow-2xl backdrop-blur-md text-[11px] space-y-1"
          style={{
            left: `${Math.min(85, Math.max(15, (getX(hoverIndex) / width) * 100))}%`,
            top: '26px',
          }}
        >
          <div className="font-mono text-[#8a8a8a] text-[10px] border-b border-white/5 pb-0.5 flex items-center justify-between gap-2">
            <span>{formatXAxisDate(activePoint.date)}</span>
            <span className="text-[#666]">{activePoint.date}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5ff4a]" />
              <span className="text-white font-bold">
                {activePoint.views.toLocaleString()} {t('pro.common.views', 'views')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-300">
                {activePoint.uniques.toLocaleString()} {t('pro.common.uniques', 'uniques')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-cyan-300">
                {activePoint.cacheHits.toLocaleString()} {t('pro.charts.hits', 'hits')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-purple-300">
                {activePoint.camoViews.toLocaleString()} {t('pro.charts.camo', 'camo')}
              </span>
            </div>
          </div>
          {showPreviousPeriod && activePoint.previousPeriodViews !== undefined && (
            <div className="text-[9px] font-mono text-[#8a8a8a] pt-0.5 border-t border-white/5 flex items-center justify-between">
              <span>{t('pro.stat.prev_label', 'Prev:')}</span>
              <span className="text-white/80">
                {activePoint.previousPeriodViews.toLocaleString()} {t('pro.common.views', 'views')}
              </span>
            </div>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="proViewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.25" />
            <stop offset="95%" stopColor="#c5ff4a" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="proUniquesAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.18" />
            <stop offset="95%" stopColor="#34d399" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((pct, i) => {
          const y = paddingTop + chartHeight * (1 - pct)
          const val = Math.round(maxValue * pct)
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fill="#666"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                {val.toLocaleString()}
              </text>
            </g>
          )
        })}

        {showPreviousPeriod && (
          <path
            d={makePath((d) => d.previousPeriodViews || 0)}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
        )}

        {activeSeries.views && (
          <>
            <path d={makeAreaPath((d) => d.views)} fill="url(#proViewsAreaGradient)" />
            <path
              d={makePath((d) => d.views)}
              fill="none"
              stroke="#c5ff4a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {activeSeries.uniques && (
          <path
            d={makePath((d) => d.uniques)}
            fill="none"
            stroke="#34d399"
            strokeWidth="1.75"
            strokeDasharray="4 2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {activeSeries.cacheHits && (
          <path
            d={makePath((d) => d.cacheHits)}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        )}

        {activeSeries.camoViews && (
          <path
            d={makePath((d) => d.camoViews)}
            fill="none"
            stroke="#c084fc"
            strokeWidth="1.2"
            strokeDasharray="2 2"
            strokeLinecap="round"
          />
        )}

        {tickIndices.map((idx) => {
          const d = data[idx]
          if (!d) return null
          const x = getX(idx)
          const label = formatXAxisDate(d.date)
          const isFirst = idx === 0
          const isLast = idx === data.length - 1
          const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle'
          const xOffset = isFirst ? 2 : isLast ? -2 : 0

          return (
            <text
              key={idx}
              x={x + xOffset}
              y={height - 4}
              fill="#777"
              fontSize="9"
              fontFamily="monospace"
              textAnchor={textAnchor}
            >
              {label}
            </text>
          )
        })}

        {hoverIndex !== null && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={paddingTop + chartHeight}
              stroke="#c5ff4a"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {activeSeries.views && (
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].views)}
                r="3.5"
                fill="#c5ff4a"
                stroke="#000"
                strokeWidth="1.5"
              />
            )}
            {activeSeries.uniques && (
              <circle
                cx={getX(hoverIndex)}
                cy={getY(data[hoverIndex].uniques)}
                r="3"
                fill="#34d399"
                stroke="#000"
                strokeWidth="1.5"
              />
            )}
          </g>
        )}

        {data.map((_, i) => {
          const colWidth = chartWidth / data.length
          const x = getX(i) - colWidth / 2
          return (
            <rect
              key={i}
              x={x}
              y={0}
              width={colWidth}
              height={height}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          )
        })}
      </svg>
    </div>
  )
}

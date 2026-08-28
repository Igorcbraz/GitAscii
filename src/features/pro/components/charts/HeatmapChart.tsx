'use client'

import { Flame, Info } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { useI18n } from '@/i18n'

import type { WeekdayHourPoint } from '../../types/analytics'
import {
  formatLocalizedDay,
  formatUtcHourToLocal,
  getLocalizedDayLabels,
} from '../../utils/proFormatters'

export interface HeatmapChartProps {
  data: WeekdayHourPoint[]
  peakInsight?: { day: string; views: number }
  peakHourInsight?: { hour: number; views: number }
  className?: string
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  peakInsight,
  peakHourInsight: _peakHourInsight,
  className = '',
}) => {
  const { t, language } = useI18n()
  const [hoveredCell, setHoveredCell] = useState<WeekdayHourPoint | null>(null)

  const dayLabels = useMemo(() => getLocalizedDayLabels(language, 'short'), [language])
  const hourLabels = [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ]

  const cellMap = new Map<string, WeekdayHourPoint>()
  let maxViews = 0
  for (const point of data) {
    cellMap.set(`${point.day}_${point.hour}`, point)
    if (point.views > maxViews) maxViews = point.views
  }

  const getCellColor = (intensity: number, views: number) => {
    if (views === 0) return 'bg-white/[0.02] border border-white/[0.04]'
    if (intensity < 20) return 'bg-[#c5ff4a]/15 border border-[#c5ff4a]/25'
    if (intensity < 45) return 'bg-[#c5ff4a]/35 border border-[#c5ff4a]/45'
    if (intensity < 75) return 'bg-[#c5ff4a]/65 border border-[#c5ff4a]/75 shadow-sm'
    return 'bg-[#c5ff4a] border border-white/40 text-black font-bold'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#c5ff4a]/10 text-[#c5ff4a]">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span className="text-[#8a8a8a]">
            {t(
              'pro.charts.heatmap_desc',
              'Audience density mapped by weekday and hour of day. Spot prime time slots for GitHub profile updates.'
            )}
          </span>
        </div>

        {peakInsight && peakInsight.views > 0 && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
            <span>
              {t('pro.charts.heatmap_peak_day', 'Peak Day:')}{' '}
              <strong>{formatLocalizedDay(peakInsight.day, language)}</strong> (
              {peakInsight.views.toLocaleString()} {t('pro.common.views', 'views')})
            </span>
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto pb-2">
        {hoveredCell && (
          <div className="absolute top-0 right-0 z-20 pointer-events-none bg-[#1c1c1c] border border-white/20 px-3 py-1.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
            <span className="font-semibold text-[#c5ff4a]">
              {formatLocalizedDay(hoveredCell.day, language)} -{' '}
              {formatUtcHourToLocal(hoveredCell.hour)}:
            </span>
            <span className="font-mono text-white font-bold">
              {hoveredCell.views.toLocaleString()} {t('pro.common.views', 'views')}
            </span>
            <span className="text-[10px] text-[#8a8a8a]">({hoveredCell.intensity}% intensity)</span>
          </div>
        )}

        <div className="min-w-[680px] space-y-1.5 pt-6">
          <div className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 text-[10px] font-mono text-[#777] text-center">
            <div />
            {hourLabels.map((h, i) => (
              <div key={h} className={i % 3 === 0 ? 'text-white/80 font-medium' : 'text-[#777]'}>
                {i % 3 === 0 ? `${formatUtcHourToLocal(Number(h)).replace(':00', 'h')}` : ''}
              </div>
            ))}
          </div>

          {dayLabels.map((dayName, dayIndex) => {
            return (
              <div
                key={dayIndex}
                className="grid grid-cols-[40px_repeat(24,1fr)] gap-1 items-center"
              >
                <div className="text-[11px] font-mono text-[#8a8a8a] text-right pr-2 truncate">
                  {dayName}
                </div>

                {Array.from({ length: 24 }, (_, hour) => {
                  const cell = cellMap.get(`${dayIndex}_${hour}`) || {
                    day: dayIndex,
                    dayName,
                    hour,
                    views: 0,
                    intensity: 0,
                  }

                  const colorClass = getCellColor(cell.intensity, cell.views)
                  const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.hour === hour

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-6 rounded-[3px] transition-all duration-150 cursor-pointer flex items-center justify-center text-[9px] ${colorClass} ${
                        isHovered ? 'scale-110 z-10 !border-white' : ''
                      }`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#8a8a8a] pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-[#777]">
          <Info className="w-3 h-3" />
          <span>{t('pro.charts.local_time_note', 'All times converted to your local time')}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>{t('pro.charts.less', 'Less')}</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-[2px] bg-white/[0.03] border border-white/[0.08]" />
            <span className="w-3 h-3 rounded-[2px] bg-[#c5ff4a]/20 border border-[#c5ff4a]/30" />
            <span className="w-3 h-3 rounded-[2px] bg-[#c5ff4a]/45 border border-[#c5ff4a]/50" />
            <span className="w-3 h-3 rounded-[2px] bg-[#c5ff4a]/75 border border-[#c5ff4a]/80" />
            <span className="w-3 h-3 rounded-[2px] bg-[#c5ff4a] border border-white" />
          </div>
          <span>{t('pro.charts.more', 'More')}</span>
        </div>
      </div>
    </div>
  )
}

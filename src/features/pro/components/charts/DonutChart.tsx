'use client'

import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { DimensionMetric } from '../../types/analytics'

export interface DonutChartProps {
  data: DimensionMetric[]
  title?: string
  size?: number
  thickness?: number
  colors?: string[]
  className?: string
}

const DEFAULT_COLORS = ['#c5ff4a', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24', '#94a3b8']

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 180,
  thickness = 24,
  colors = DEFAULT_COLORS,
  className = '',
}) => {
  const { t } = useI18n()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const validData = data.filter((d) => d.count > 0)
  const total = validData.reduce((acc, d) => acc + d.count, 0)

  if (total === 0 || validData.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div
          style={{ width: size, height: size }}
          className="rounded-full border-4 border-white/5 flex items-center justify-center text-xs text-[#8a8a8a]"
        >
          {t('pro.charts.no_data', 'No data')}
        </div>
      </div>
    )
  }

  const radius = size / 2
  const innerRadius = radius - thickness
  const center = radius

  let accumulatedAngle = 0
  const slices = validData.map((item, index) => {
    const angle = (item.count / total) * 360
    const startAngle = accumulatedAngle
    const endAngle = accumulatedAngle + angle
    accumulatedAngle += angle

    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const ix1 = center + innerRadius * Math.cos(endRad)
    const iy1 = center + innerRadius * Math.sin(endRad)
    const ix2 = center + innerRadius * Math.cos(startRad)
    const iy2 = center + innerRadius * Math.sin(startRad)

    const largeArc = angle > 180 ? 1 : 0

    let path = ''
    if (angle >= 359.9) {
      path = `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius} M ${center},${center - innerRadius} A ${innerRadius},${innerRadius} 0 1,0 ${center},${center + innerRadius} A ${innerRadius},${innerRadius} 0 1,0 ${center},${center - innerRadius} Z`
    } else {
      path = `M ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} L ${ix1},${iy1} A ${innerRadius},${innerRadius} 0 ${largeArc},0 ${ix2},${iy2} Z`
    }

    const color = colors[index % colors.length]
    return { item, path, color, index, startAngle, endAngle }
  })

  const activeItem = hoveredIndex !== null ? validData[hoveredIndex] : validData[0]
  const activePct = activeItem ? Math.round((activeItem.count / total) * 100) : 0

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none"
        >
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index
            return (
              <path
                key={slice.index}
                d={slice.path}
                fill={slice.color}
                opacity={hoveredIndex === null || isHovered ? 1 : 0.4}
                className="transition-all duration-200 cursor-pointer origin-center"
                style={{
                  transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: `${center}px ${center}px`,
                }}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          <span className="text-xl font-bold font-mono text-white tracking-tight leading-none">
            {activePct}%
          </span>
          <span className="text-[11px] font-medium text-[#8a8a8a] truncate max-w-[90px] mt-1">
            {activeItem?.name || title}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 min-w-[140px] w-full">
        {validData.slice(0, 5).map((item, idx) => {
          const color = colors[idx % colors.length]
          const isHovered = hoveredIndex === idx
          return (
            <div
              key={item.key || idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHovered ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white/90 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#8a8a8a] flex-shrink-0">
                <span>{item.count.toLocaleString()}</span>
                <span className="text-white/70 font-semibold">{item.percentage}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

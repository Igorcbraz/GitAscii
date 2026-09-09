'use client'

import React from 'react'

export interface StrobiTetherProps {
  startX: number
  startY: number
  endX: number
  endY: number
  active: boolean
  label?: string
}

export function StrobiTether({ startX, startY, endX, endY, active, label }: StrobiTetherProps) {
  if (!active) return null

  const dx = endX - startX
  const dy = endY - startY
  const dist = Math.hypot(dx, dy)

  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2 + Math.min(60, dist * 0.18)

  const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-[190] overflow-visible w-full h-full"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="tether-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="tether-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#c5ff4a" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <path
        d={pathData}
        fill="none"
        stroke="#c5ff4a"
        strokeWidth="3.5"
        strokeOpacity="0.3"
        filter="url(#tether-glow)"
      />

      <path
        d={pathData}
        fill="none"
        stroke="url(#tether-grad)"
        strokeWidth="1.8"
        strokeDasharray="4 4"
        className="animate-pulse"
      />

      <circle
        cx={endX}
        cy={endY}
        r="8"
        fill="none"
        stroke="#c5ff4a"
        strokeWidth="2"
        className="animate-ping"
      />
      <circle cx={endX} cy={endY} r="3" fill="#ffffff" />

      {label && (
        <text
          x={endX + 14}
          y={endY + 4}
          fill="#c5ff4a"
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {label}
        </text>
      )}
    </svg>
  )
}

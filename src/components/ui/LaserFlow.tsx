'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface LaserFlowProps {
  className?: string
  color?: string
  secondaryColor?: string
  duration?: number
  size?: number
  borderWidth?: number
}

export function LaserFlow({
  className,
  color = '#c5ff4a',
  secondaryColor = 'rgba(197, 255, 74, 0)',
  duration = 6,
  borderWidth = 1.5,
}: LaserFlowProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] z-0',
        className
      )}
      style={
        {
          '--laser-color': color,
          '--laser-secondary': secondaryColor,
          '--laser-duration': `${duration}s`,
          '--laser-border-width': `${borderWidth}px`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <style>{`
        @keyframes laser-beam-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        className="absolute -inset-[150%] opacity-85"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${secondaryColor} 0deg, ${secondaryColor} 60deg, ${color} 110deg, ${secondaryColor} 170deg, ${secondaryColor} 360deg)`,
          animation: `laser-beam-spin var(--laser-duration) linear infinite`,
          filter: 'blur(1px)',
        }}
      />
      <div
        className="absolute inset-[var(--laser-border-width)] bg-carbon rounded-[inherit]"
        style={{ zIndex: 1 }}
      />
    </div>
  )
}

export default LaserFlow

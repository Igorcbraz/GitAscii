'use client'

import React from 'react'

export interface StrobiShadowProps {
  size: number
  elevation: number
  squashX?: number
}

export const StrobiShadow = React.memo(function StrobiShadow({
  size,
  elevation,
  squashX = 1,
}: StrobiShadowProps) {
  const elevationFactor = Math.max(0, Math.min(1, elevation / 60))
  const shadowScaleX = (1 - elevationFactor * 0.35) * squashX
  const shadowScaleY = 1 - elevationFactor * 0.45
  const shadowOpacity = Math.max(0.12, 0.45 * (1 - elevationFactor * 0.65))
  const shadowBlur = 3 + elevationFactor * 8

  const width = size * 0.78 * shadowScaleX
  const height = size * 0.22 * shadowScaleY

  return (
    <div
      className="absolute pointer-events-none -z-10 flex items-center justify-center transition-opacity"
      style={{
        width: `${size}px`,
        bottom: `-${size * 0.12}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 72%)',
          opacity: shadowOpacity,
          filter: `blur(${shadowBlur}px)`,
          transform: 'translateZ(0)',
        }}
      />
    </div>
  )
})

'use client'

import React from 'react'

export interface MarqueeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface CanvasMarqueeProps {
  marquee: MarqueeState | null
}

export function CanvasMarquee({ marquee }: CanvasMarqueeProps) {
  if (!marquee) return null

  return (
    <div
      className="absolute bg-signal-lime/20 border border-signal-lime z-50 pointer-events-none"
      style={{
        left: Math.min(marquee.startX, marquee.currentX),
        top: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
      }}
    />
  )
}

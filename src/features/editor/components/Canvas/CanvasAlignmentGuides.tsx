'use client'

import React from 'react'

import type { AlignmentGuide, SpacingGuide } from '../../utils/smartGuides'

export type { AlignmentGuide, SpacingGuide }

interface CanvasAlignmentGuidesProps {
  guides: AlignmentGuide[]
  spacingGuides?: SpacingGuide[]
}

export const CanvasAlignmentGuides = React.memo(function CanvasAlignmentGuides({
  guides,
  spacingGuides = [],
}: CanvasAlignmentGuidesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {guides.map((guide, idx) => {
        if (guide.x !== undefined) {
          return (
            <div
              key={`v-guide-${idx}`}
              className="absolute top-0 bottom-0 w-px bg-signal-lime/85 shadow-[0_0_5px_rgba(197,255,74,0.9)] pointer-events-none"
              style={{ left: guide.x }}
            />
          )
        }
        if (guide.y !== undefined) {
          return (
            <div
              key={`h-guide-${idx}`}
              className="absolute left-0 right-0 h-px bg-signal-lime/85 shadow-[0_0_5px_rgba(197,255,74,0.9)] pointer-events-none"
              style={{ top: guide.y }}
            />
          )
        }
        return null
      })}

      {spacingGuides.map((guide) => {
        if (guide.axis === 'vertical') {
          const top = Math.min(guide.start.y, guide.end.y)
          const height = Math.abs(guide.end.y - guide.start.y)
          const left = guide.start.x
          const centerY = top + height / 2

          if (height < 2) return null

          return (
            <div
              key={guide.id}
              className="absolute pointer-events-none"
              style={{ left, top, height }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-signal-lime/90 shadow-[0_0_4px_rgba(197,255,74,0.8)]" />

              <div className="absolute top-0 left-0 w-3 -translate-x-1/2 h-[1.5px] bg-signal-lime" />
              <div className="absolute bottom-0 left-0 w-3 -translate-x-1/2 h-[1.5px] bg-signal-lime" />

              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"
                style={{ top: centerY - top }}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-[3px] font-jetbrains-mono text-caption font-bold leading-none tracking-tight shadow-md border ${
                    guide.isEqualSpacing
                      ? 'bg-signal-lime text-black border-signal-lime shadow-[0_0_8px_rgba(197,255,74,0.6)]'
                      : 'bg-void-black/95 text-signal-lime border-signal-lime/70 backdrop-blur-xs'
                  }`}
                >
                  {guide.distance}px
                </span>
              </div>
            </div>
          )
        }

        if (guide.axis === 'horizontal') {
          const left = Math.min(guide.start.x, guide.end.x)
          const width = Math.abs(guide.end.x - guide.start.x)
          const top = guide.start.y
          const centerX = left + width / 2

          if (width < 2) return null

          return (
            <div
              key={guide.id}
              className="absolute pointer-events-none"
              style={{ left, top, width }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-signal-lime/90 shadow-[0_0_4px_rgba(197,255,74,0.8)]" />

              <div className="absolute left-0 top-0 h-3 -translate-y-1/2 w-[1.5px] bg-signal-lime" />
              <div className="absolute right-0 top-0 h-3 -translate-y-1/2 w-[1.5px] bg-signal-lime" />

              <div
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-10"
                style={{ left: centerX - left }}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-[3px] font-jetbrains-mono text-caption font-bold leading-none tracking-tight shadow-md border ${
                    guide.isEqualSpacing
                      ? 'bg-signal-lime text-black border-signal-lime shadow-[0_0_8px_rgba(197,255,74,0.6)]'
                      : 'bg-void-black/95 text-signal-lime border-signal-lime/70 backdrop-blur-xs'
                  }`}
                >
                  {guide.distance}px
                </span>
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
})

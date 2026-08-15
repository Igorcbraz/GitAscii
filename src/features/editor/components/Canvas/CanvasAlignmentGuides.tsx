'use client'

import React from 'react'

export interface AlignmentGuide {
  x?: number
  y?: number
}

interface CanvasAlignmentGuidesProps {
  guides: AlignmentGuide[]
}

export function CanvasAlignmentGuides({ guides }: CanvasAlignmentGuidesProps) {
  return (
    <>
      {guides.map((guide, idx) => {
        if (guide.x !== undefined) {
          return (
            <div
              key={`v-guide-${idx}`}
              className="absolute top-0 bottom-0 w-px bg-signal-lime/80 shadow-[0_0_4px_rgba(197,255,74,0.8)] pointer-events-none z-50"
              style={{ left: guide.x }}
            />
          )
        }
        if (guide.y !== undefined) {
          return (
            <div
              key={`h-guide-${idx}`}
              className="absolute left-0 right-0 h-px bg-signal-lime/80 shadow-[0_0_4px_rgba(197,255,74,0.8)] pointer-events-none z-50"
              style={{ top: guide.y }}
            />
          )
        }
        return null
      })}
    </>
  )
}

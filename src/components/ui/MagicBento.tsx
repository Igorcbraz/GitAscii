'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface MagicBentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glowColor?: string
  borderColor?: string
}

export function MagicBentoCard({
  children,
  className,
  glowColor = 'rgba(197, 255, 74, 0.08)',
  borderColor = 'rgba(197, 255, 74, 0.35)',
  ...props
}: MagicBentoCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        'relative bg-onyx border border-graphite rounded-none overflow-hidden transition-colors duration-200 group [contain:paint]',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), ${glowColor}, transparent 70%)`,
        }}
      />

      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 border"
        style={{
          borderColor,
          maskImage: `radial-gradient(150px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), black, transparent)`,
        }}
      />

      <div className="absolute top-2 left-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/30 transition-colors">
        +
      </div>
      <div className="absolute top-2 right-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/30 transition-colors">
        +
      </div>
      <div className="absolute bottom-2 left-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/30 transition-colors">
        +
      </div>
      <div className="absolute bottom-2 right-2 text-graphite/40 font-mono text-[8px] pointer-events-none select-none group-hover:text-signal-lime/30 transition-colors">
        +
      </div>

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}

export default MagicBentoCard

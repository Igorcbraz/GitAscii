'use client'

import React from 'react'

import { cn } from '@/lib/utils'

interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  disabled?: boolean
  speed?: number
  className?: string
}

export function ShinyText({
  children,
  disabled = false,
  speed = 4,
  className,
  ...props
}: ShinyTextProps) {
  return (
    <span
      className={cn(
        'inline-block text-transparent bg-clip-text',
        disabled
          ? 'text-chalk'
          : 'bg-linear-to-r from-bone via-signal-lime to-bone bg-[length:200%_100%] animate-[shine_var(--speed)_linear_infinite]',
        className
      )}
      style={
        {
          '--speed': `${speed}s`,
          backgroundImage: disabled
            ? undefined
            : 'linear-gradient(120deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.95) 25%, #c5ff4a 50%, rgba(255, 255, 255, 0.95) 75%, rgba(255, 255, 255, 0.5) 100%)',
          backgroundSize: '200% 100%',
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  )
}

export default ShinyText

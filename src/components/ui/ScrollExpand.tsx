'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

interface ScrollExpandProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function ScrollExpand({ children, className, innerClassName }: ScrollExpandProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasReducedMotion, setHasReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setHasReducedMotion(mq.matches)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.75, 0.95, 1])
  const y = useTransform(scrollYProgress, [0, 1], [24, 0])

  if (hasReducedMotion) {
    return (
      <div ref={containerRef} className={className}>
        <div className={innerClassName}>{children}</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <motion.div
        style={{ scale, opacity, y }}
        className={cn('w-full transition-shadow duration-500', innerClassName)}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default ScrollExpand

'use client'

import React, { useEffect, useRef, useState } from 'react'

export interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  className?: string
  formatter?: (val: number) => string
}

export function AnimatedCounter({
  value,
  duration = 2.2,
  delay = 0,
  prefix = '',
  suffix = '+',
  className = '',
  formatter,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = useState<number>(0)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          startAnimation()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()

    function startAnimation() {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mediaQuery.matches) {
        setDisplayValue(value)
        return
      }

      let startTimestamp: number | null = null
      const durationMs = duration * 1000
      let animationFrame: number | undefined

      const easeOutExpo = (x: number): number => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
      }

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / durationMs, 1)
        const easedProgress = easeOutExpo(progress)

        const currentVal = Math.round(easedProgress * value)
        setDisplayValue(currentVal)

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step)
        } else {
          setDisplayValue(value)
        }
      }

      const timeoutId = setTimeout(() => {
        animationFrame = requestAnimationFrame(step)
      }, delay * 1000)

      return () => {
        clearTimeout(timeoutId)
        if (animationFrame) {
          cancelAnimationFrame(animationFrame)
        }
      }
    }
  }, [value, duration, delay])

  const formatted = formatter ? formatter(displayValue) : displayValue.toLocaleString('en-US')

  return (
    <span ref={ref} className={`tabular-nums inline-block tracking-tight ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

'use client'

import React, { ReactNode, useEffect, useRef, useState } from 'react'

export function DeferredWrapper({
  children,
  minHeight = '500px',
}: {
  children: ReactNode
  minHeight?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        const trigger = () => {
          setReady(true)
        }

        if ('requestIdleCallback' in window) {
          ;(window as any).requestIdleCallback(trigger, { timeout: 2000 })
        } else {
          setTimeout(trigger, 1000)
        }

        observer.disconnect()
      },
      { rootMargin: '1000px 0px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{ready ? children : <div style={{ minHeight }} aria-hidden="true" />}</div>
}

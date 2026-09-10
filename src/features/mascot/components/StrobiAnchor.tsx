'use client'

import React, { useEffect, useRef } from 'react'

import { useStrobiContext } from '../core/StrobiContext'
import type { AnchorConfig, StrobiAnchorId } from '../core/types'

export interface StrobiAnchorProps extends Omit<AnchorConfig, 'element'> {
  id: StrobiAnchorId
  className?: string
  children?: React.ReactNode

  defaultAnchor?: boolean
}

export function StrobiAnchor({
  id,
  className,
  children,
  defaultAnchor,
  offsetX,
  offsetY,
  align = 'center',
  scale = 1,
  size = 80,
  scene,
  restingMood,
  float = true,
  bounce,
  accessory,
}: StrobiAnchorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDefaultHandled = useRef(false)
  const { registry, controller } = useStrobiContext()

  useEffect(() => {
    if (!containerRef.current) return

    const unregister = registry.register({
      id,
      element: containerRef.current,
      offsetX,
      offsetY,
      align,
      scale,
      size,
      scene,
      restingMood,
      float,
      bounce,
      accessory,
    })

    if (defaultAnchor && !isDefaultHandled.current) {
      isDefaultHandled.current = true
      controller.goTo(id, { immediate: true })
    }

    return () => {
      unregister()
    }
  }, [
    id,
    registry,
    offsetX,
    offsetY,
    align,
    scale,
    size,
    scene,
    restingMood,
    float,
    bounce,
    accessory,
    defaultAnchor,
    controller,
  ])

  return (
    <div
      ref={containerRef}
      data-strobi-anchor={id}
      className={`relative pointer-events-none ${className ?? ''}`}
      style={{
        width: typeof size === 'number' ? `${size * scale}px` : undefined,
        height: typeof size === 'number' ? `${size * scale}px` : undefined,
      }}
    >
      {children}
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'

import { useStrobiContext } from '../core/StrobiContext'
import type { AnchorConfig, StrobiAnchorId } from '../core/types'

export function useStrobiAnchor<T extends HTMLElement = HTMLDivElement>(
  id: StrobiAnchorId,
  config: Omit<AnchorConfig, 'id' | 'element'> = {}
) {
  const ref = useRef<T | null>(null)
  const { registry } = useStrobiContext()
  const configRef = useRef(config)
  configRef.current = config

  const { offsetX, offsetY, align, scale, size, scene, restingMood, float } = config

  useEffect(() => {
    if (!ref.current) return

    const unregister = registry.register({
      id,
      element: ref.current,
      ...configRef.current,
    })

    return () => {
      unregister()
    }
  }, [id, registry, offsetX, offsetY, align, scale, size, scene, restingMood, float])

  return ref
}

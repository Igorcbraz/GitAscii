'use client'

import { Plus } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import { useI18n } from '@/i18n'

import { useWidgetDragStore } from '../../store/widgetDragStore'

interface CanvasDropGhostProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  zoom: number
}

export function CanvasDropGhost({ containerRef, zoom }: CanvasDropGhostProps) {
  const { t } = useI18n()
  const isDragging = useWidgetDragStore((state) => state.isDragging)
  const draggingWidget = useWidgetDragStore((state) => state.draggingWidget)
  const ghostRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isDragging || !draggingWidget) {
      if (ghostRef.current) {
        ghostRef.current.style.display = 'none'
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    const updateGhost = (clientX: number, clientY: number) => {
      if (!ghostRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()

      const rawX = (clientX - rect.left) / zoom
      const rawY = (clientY - rect.top) / zoom

      const wWidth = draggingWidget.width || 800
      const wHeight = draggingWidget.height || 120
      const clampedX = Math.max(0, Math.min(800 - wWidth, Math.round(rawX)))
      const clampedY = Math.max(0, Math.round(rawY))

      ghostRef.current.style.display = 'flex'
      ghostRef.current.style.width = `${wWidth}px`
      ghostRef.current.style.height = `${wHeight}px`
      ghostRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`
      rafRef.current = null
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.clientX !== 0 || e.clientY !== 0) {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => updateGhost(e.clientX, e.clientY))
        }
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      const rect = container.getBoundingClientRect()
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        if (ghostRef.current) {
          ghostRef.current.style.display = 'none'
        }
      }
    }

    container.addEventListener('dragover', handleDragOver)
    container.addEventListener('dragleave', handleDragLeave)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      container.removeEventListener('dragover', handleDragOver)
      container.removeEventListener('dragleave', handleDragLeave)
    }
  }, [isDragging, draggingWidget, zoom, containerRef])

  if (!isDragging || !draggingWidget) return null

  return (
    <div
      ref={ghostRef}
      style={{
        display: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        willChange: 'transform',
        zIndex: 90,
      }}
      className="pointer-events-none rounded-xs border-2 border-dashed border-signal-lime bg-signal-lime/10 shadow-[0_0_25px_rgba(197,255,74,0.35)] items-center justify-center transition-opacity duration-100"
    >
      <div className="px-3 py-1 rounded-xs bg-void-black/95 border border-signal-lime text-signal-lime font-jetbrains-mono text-[10px] font-bold tracking-wider uppercase shadow-xl flex items-center gap-1.5">
        <Plus size={11} strokeWidth={3} />
        <span>
          {t('editor.canvas.drop_here', 'DROP HERE')} ({draggingWidget.width}×
          {draggingWidget.height})
        </span>
      </div>
    </div>
  )
}

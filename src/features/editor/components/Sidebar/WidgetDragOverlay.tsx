'use client'

import { Layers, Move } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

import { useI18n } from '@/i18n'

import { useWidgetDragStore } from '../../store/widgetDragStore'

export function WidgetDragOverlay() {
  const { t } = useI18n()
  const isDragging = useWidgetDragStore((state) => state.isDragging)
  const draggingWidget = useWidgetDragStore((state) => state.draggingWidget)
  const endDrag = useWidgetDragStore((state) => state.endDrag)
  const overlayRef = useRef<HTMLDivElement>(null)
  const posRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isDragging) return

    const updatePosition = () => {
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate3d(${posRef.current.x + 14}px, ${posRef.current.y + 14}px, 0) rotate(2deg) scale(1.02)`
      }
      rafRef.current = null
    }

    const scheduleUpdate = (x: number, y: number) => {
      posRef.current = { x, y }
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updatePosition)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (e.clientX !== 0 || e.clientY !== 0) {
        scheduleUpdate(e.clientX, e.clientY)
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      scheduleUpdate(e.clientX, e.clientY)
    }

    const handleEnd = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      endDrag()
    }

    window.addEventListener('dragover', handleDragOver, { passive: false })
    window.addEventListener('dragend', handleEnd)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerup', handleEnd)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragend', handleEnd)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handleEnd)
    }
  }, [isDragging, endDrag])

  if (!isDragging || !draggingWidget) {
    return null
  }

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: 'translate3d(-9999px, -9999px, 0)',
        willChange: 'transform',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
      className="transition-none"
    >
      <div className="flex flex-col gap-1.5 p-3 min-w-[220px] max-w-[280px] bg-carbon/95 border-2 border-signal-lime/80 rounded-sm shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(197,255,74,0.3)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-[2px] bg-signal-lime text-black font-inter-tight font-bold text-[9px] uppercase tracking-wider">
            <Move size={9} strokeWidth={3} />
            <span>{t('editor.sidebar.drop_on_canvas', 'DROP ON CANVAS')}</span>
          </div>
          <span className="font-jetbrains-mono text-[9px] text-ash/80">
            {draggingWidget.width}×{draggingWidget.height}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          <div className="p-1.5 rounded-xs bg-void-black border border-graphite text-signal-lime">
            <Layers size={13} />
          </div>
          <div className="min-w-0">
            <span className="font-inter-tight font-semibold text-[12px] text-white truncate block">
              {draggingWidget.name}
            </span>
            <span className="font-jetbrains-mono text-[9.5px] text-signal-lime/80">
              #{draggingWidget.widgetId}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

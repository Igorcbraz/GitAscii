'use client'

import { Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface CanvasStatusBarProps {
  showInfo?: boolean
}

export function CanvasStatusBar({ showInfo = true }: CanvasStatusBarProps) {
  const { t } = useI18n()

  const zoom = useEditorStore((state) => state.zoom)
  const setZoom = useEditorStore((state) => state.setZoom)
  const widgetCount = useEditorStore((state) => state.config?.widgets?.length ?? 0)
  const selCount = useEditorStore((state) => state.selectedInstanceIds.length)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const canUndo = useEditorStore((state) => state.canUndo)
  const canRedo = useEditorStore((state) => state.canRedo)

  const zoomPct = Math.round(zoom * 100)

  const stepDown = () => setZoom(Math.max(0.5, zoom - 0.1))
  const stepUp = () => setZoom(Math.min(1.5, zoom + 0.1))
  const resetZoom = () => setZoom(1)

  return (
    <div
      id="tour-status-bar"
      className="flex h-9 w-full bg-void-black border-t border-graphite px-3 items-center justify-between text-eyebrow font-inter-tight text-ash select-none z-10"
    >
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title={`${t('editor.statusbar.undo')} (Ctrl+Z)`}
          data-testid="statusbar-undo"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-chalk disabled:text-fog disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Undo2 size={13} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title={`${t('editor.statusbar.redo')} (Ctrl+Y)`}
          data-testid="statusbar-redo"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-chalk disabled:text-fog disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Redo2 size={13} />
        </button>

        {showInfo && (
          <>
            <div className="w-px h-3 bg-graphite mx-1.5" />
            <span>
              {widgetCount}{' '}
              {widgetCount !== 1 ? t('editor.statusbar.widgets') : t('editor.statusbar.widget')}
            </span>
            {selCount > 0 && (
              <span className="text-signal-lime ml-2 font-medium">
                · {selCount} {t('editor.statusbar.selected')}
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={stepDown}
          title={t('editor.statusbar.zoom_out')}
          data-testid="statusbar-zoom-out"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <Minus size={13} />
        </button>

        <span
          data-testid="statusbar-zoom-level"
          className="w-11 text-center font-mono font-medium text-chalk text-caption"
        >
          {zoomPct}%
        </span>

        <button
          onClick={stepUp}
          title={t('editor.statusbar.zoom_in')}
          data-testid="statusbar-zoom-in"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <Plus size={13} />
        </button>

        <button
          onClick={resetZoom}
          title={t('editor.statusbar.zoom_reset')}
          data-testid="statusbar-zoom-reset"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-chalk transition-colors cursor-pointer ml-0.5"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  )
}

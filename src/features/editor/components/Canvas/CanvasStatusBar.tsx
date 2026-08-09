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
  const { zoom, setZoom, config, selectedInstanceIds, undo, redo, canUndo, canRedo } =
    useEditorStore()

  const zoomPct = Math.round(zoom * 100)
  const widgetCount = config?.widgets?.length ?? 0
  const selCount = selectedInstanceIds?.length ?? 0

  const stepDown = () => setZoom(Math.max(0.5, zoom - 0.1))
  const stepUp = () => setZoom(Math.min(1.5, zoom + 0.1))
  const resetZoom = () => setZoom(1)

  return (
    <div className="hidden lg:flex h-8 w-full bg-void-black border-t border-graphite px-3 items-center justify-between text-eyebrow font-inter-tight text-fog shrink-0 select-none z-10">
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          title={t('editor.statusbar.undo')}
          data-testid="statusbar-undo"
          className="p-1 rounded-xs hover:bg-graphite hover:text-chalk disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Undo2 size={12} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          title={t('editor.statusbar.redo')}
          data-testid="statusbar-redo"
          className="p-1 rounded-xs hover:bg-graphite hover:text-chalk disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Redo2 size={12} />
        </button>

        {showInfo && (
          <>
            <div className="w-px h-3 bg-graphite mx-1.5" />
            <span>
              {widgetCount}{' '}
              {widgetCount !== 1 ? t('editor.statusbar.widgets') : t('editor.statusbar.widget')}
            </span>
            {selCount > 0 && (
              <span className="text-signal-lime ml-2">
                · {selCount} {t('editor.statusbar.selected')}
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={stepDown}
          title={t('editor.statusbar.zoom_out')}
          data-testid="statusbar-zoom-out"
          className="p-1 rounded-xs hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <Minus size={12} />
        </button>

        <button
          onClick={resetZoom}
          title={t('editor.statusbar.zoom_reset')}
          data-testid="statusbar-zoom-reset"
          className="min-w-11.5 text-center text-fog hover:text-chalk hover:bg-graphite rounded-xs px-1.5 py-0.5 transition-colors cursor-pointer font-jetbrains-mono"
        >
          {zoomPct}%
        </button>

        <button
          onClick={stepUp}
          title={t('editor.statusbar.zoom_in')}
          data-testid="statusbar-zoom-in"
          className="p-1 rounded-xs hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <Plus size={12} />
        </button>

        <div className="w-px h-3 bg-graphite mx-1" />

        <button
          onClick={resetZoom}
          title={t('editor.statusbar.zoom_reset')}
          data-testid="statusbar-zoom-fit"
          className="p-1 rounded-xs hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <RotateCcw size={11} />
        </button>
      </div>
    </div>
  )
}

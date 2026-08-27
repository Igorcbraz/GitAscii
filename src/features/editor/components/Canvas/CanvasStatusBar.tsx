'use client'

import { Check, ChevronUp, Grid, Maximize2, Minus, Plus, Redo2, RotateCcw, Undo2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { GRID_MODE_OPTIONS } from '@/constants'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'
import { calculateFitZoom, getCanvasContainerWidth } from '../../utils/canvasZoom'

interface CanvasStatusBarProps {
  showInfo?: boolean
}

export function CanvasStatusBar({ showInfo = true }: CanvasStatusBarProps) {
  const { t } = useI18n()

  const zoom = useEditorStore((state) => state.zoom)
  const setZoom = useEditorStore((state) => state.setZoom)
  const showGrid = useEditorStore((state) => state.showGrid)
  const gridMode = useEditorStore((state) => state.gridMode)
  const setGridMode = useEditorStore((state) => state.setGridMode)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const widgetCount = useEditorStore((state) => state.config?.widgets?.length ?? 0)
  const selCount = useEditorStore((state) => state.selectedInstanceIds.length)
  const undo = useEditorStore((state) => state.undo)
  const redo = useEditorStore((state) => state.redo)
  const canUndo = useEditorStore((state) => state.canUndo)
  const canRedo = useEditorStore((state) => state.canRedo)

  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false)
  const gridMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gridMenuRef.current && !gridMenuRef.current.contains(e.target as Node)) {
        setIsGridMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const zoomPct = Math.round(zoom * 100)

  const stepDown = () => setZoom(Math.max(0.25, zoom - 0.1))
  const stepUp = () => setZoom(Math.min(1.5, zoom + 0.1))
  const resetZoom = () => setZoom(1)
  const fitZoom = () => {
    const width = getCanvasContainerWidth()
    setZoom(calculateFitZoom(width))
  }

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
        <div className="relative" ref={gridMenuRef}>
          <div className="flex items-center">
            <button
              onClick={toggleGrid}
              title={
                showGrid
                  ? t('editor.statusbar.grid_hide', 'Ocultar grade (Grid)')
                  : t('editor.statusbar.grid_show', 'Exibir grade de alinhamento (Grid)')
              }
              data-testid="statusbar-grid-toggle"
              className={`p-1 rounded-l-xs transition-colors cursor-pointer ${
                showGrid
                  ? 'bg-signal-lime/20 text-signal-lime border-l border-t border-b border-signal-lime/40'
                  : 'text-ash hover:bg-graphite hover:text-chalk'
              }`}
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setIsGridMenuOpen(!isGridMenuOpen)}
              title={t('editor.statusbar.grid_options', 'Opções de Alinhamento e Grade')}
              data-testid="statusbar-grid-menu-btn"
              className={`p-1 rounded-r-xs transition-colors cursor-pointer mr-1 ${
                showGrid
                  ? 'bg-signal-lime/20 text-signal-lime border-r border-t border-b border-signal-lime/40'
                  : 'text-ash hover:bg-graphite hover:text-chalk'
              }`}
            >
              <ChevronUp
                size={11}
                className={`transition-transform duration-150 ${isGridMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {isGridMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-carbon border border-graphite rounded-xs shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
              <div className="text-caption font-semibold uppercase tracking-wider text-ash px-2 py-1 border-b border-graphite/50 mb-1 flex items-center justify-between">
                <span>{t('editor.grid.options_title', 'Modo de Alinhamento')}</span>
                {showGrid && (
                  <span className="text-[10px] text-signal-lime font-mono">
                    {t('editor.grid.status_active', 'ATIVO')}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {GRID_MODE_OPTIONS.map((opt) => {
                  const isCurrent = showGrid && gridMode === opt.id
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setGridMode(opt.id)
                        setIsGridMenuOpen(false)
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-signal-lime/15 text-signal-lime border border-signal-lime/30'
                          : 'text-ash hover:text-chalk hover:bg-graphite'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={13} className={isCurrent ? 'text-signal-lime' : 'text-ash'} />
                        <div>
                          <div className="text-eyebrow font-medium leading-tight text-chalk">
                            {t(opt.labelKey, opt.defaultLabel)}
                          </div>
                          <div className="text-[10px] text-ash/80 leading-tight mt-0.5">
                            {t(opt.descKey, opt.defaultDesc)}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check size={12} className="text-signal-lime shrink-0" />}
                    </button>
                  )
                })}

                <div className="pt-1 mt-1 border-t border-graphite/50">
                  <button
                    type="button"
                    onClick={() => {
                      setGridMode('off')
                      setIsGridMenuOpen(false)
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-xs text-eyebrow font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      !showGrid
                        ? 'text-ash/60 bg-graphite/40'
                        : 'text-ash hover:text-red-400 hover:bg-graphite'
                    }`}
                  >
                    <span>{t('editor.grid.turn_off', 'Desligar Grade & Guias')}</span>
                    {!showGrid && <Check size={12} className="text-ash/60" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={fitZoom}
          title={t('editor.statusbar.zoom_fit', 'Ajustar à tela')}
          data-testid="statusbar-zoom-fit"
          className="p-1 rounded-xs text-ash hover:bg-graphite hover:text-signal-lime transition-colors cursor-pointer mr-0.5"
        >
          <Maximize2 size={12} />
        </button>

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

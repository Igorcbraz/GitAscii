'use client'

import {
  Check,
  Copy,
  Download,
  Loader2,
  LogIn,
  LogOut,
  Redo2,
  Save,
  Undo2,
  User,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import { APP_URL } from '../../../../constants'
import { useEditorStore } from '../../store/editorStore'
import { CopyGuideModal } from './CopyGuideModal'
import { ExportGuideModal } from './ExportGuideModal'

export function EditorToolbar() {
  const { t } = useI18n()
  const {
    config,
    githubData,
    zoom,
    setZoom,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    saveToServer,
    session,
  } = useEditorStore()

  const [currentOrigin, setCurrentOrigin] = useState(APP_URL)
  const [copied, setCopied] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showExportGuide, setShowExportGuide] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin)
    }
  }, [])

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      await saveToServer()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus((prev) => (prev === 'error' ? 'idle' : prev)), 3000)
    }
  }

  const handleExport = () => {
    if (!config) return
    try {
      const exportData = {
        widgets: config.widgets,
        globalStyles: config.globalStyles,
        templateId: config.templateId,
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gitascii_layout_${config.username}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const skipGuide =
        typeof window !== 'undefined' &&
        localStorage.getItem('gitascii_skip_export_guide') === 'true'
      if (!skipGuide) {
        setShowExportGuide(true)
      }
    } catch (err) {
      console.error('Failed to export layout:', err)
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo) {
            e.preventDefault()
            redo()
          }
        } else {
          if (canUndo) {
            e.preventDefault()
            undo()
          }
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        if (canRedo) {
          e.preventDefault()
          redo()
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        useEditorStore.getState().copyWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        useEditorStore.getState().pasteWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'x') {
        e.preventDefault()
        useEditorStore.getState().cutWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (config) {
          useEditorStore.getState().setSelection(config.widgets.map((w) => w.instanceId))
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        useEditorStore.getState().copyWidgets()
        useEditorStore.getState().pasteWidgets()
        return
      }

      if (cmdOrCtrl && e.key === '[') {
        e.preventDefault()
        const ids = useEditorStore.getState().selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => useEditorStore.getState().moveWidgetLayer(id, 'down'))
        }
        return
      }

      if (cmdOrCtrl && e.key === ']') {
        e.preventDefault()
        const ids = useEditorStore.getState().selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => useEditorStore.getState().moveWidgetLayer(id, 'up'))
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        const ids = useEditorStore.getState().selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => useEditorStore.getState().toggleWidgetLock(id))
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = useEditorStore.getState().selectedInstanceIds
        if (ids && ids.length > 0) {
          e.preventDefault()
          useEditorStore.getState().removeWidgets(ids)
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        selectWidget(null)
        return
      }

      const selectedIds = useEditorStore.getState().selectedInstanceIds
      if (selectedIds && selectedIds.length > 0 && config) {
        const step = e.shiftKey ? 10 : 2

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault()
          const deltas = selectedIds
            .map((id) => {
              const widget = config.widgets.find((w) => w.instanceId === id)
              if (!widget || widget.locked) return null

              let nx = widget.position.x
              let ny = widget.position.y
              if (e.key === 'ArrowUp') ny = Math.max(0, ny - step)
              else if (e.key === 'ArrowDown') ny += step
              else if (e.key === 'ArrowLeft') nx = Math.max(0, nx - step)
              else if (e.key === 'ArrowRight') nx = Math.min(800 - widget.size.width, nx + step)

              return { instanceId: id, position: { x: nx, y: ny } }
            })
            .filter((d): d is { instanceId: string; position: { x: number; y: number } } =>
              Boolean(d)
            )

          if (deltas.length > 0) {
            useEditorStore.getState().updateWidgetPositions(deltas, true)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    config,
  ])

  React.useEffect(() => {
    const handleOpenExportGuide = () => {
      setShowExportGuide(true)
    }
    window.addEventListener('openExportGuide', handleOpenExportGuide)
    return () => window.removeEventListener('openExportGuide', handleOpenExportGuide)
  }, [])

  if (!config || !githubData) return null

  const username = config.username
  const profileSlug = config.profileSlug
  const isOwner = !!(session && session.username.toLowerCase() === username.toLowerCase())

  const embedUrl =
    profileSlug === 'default'
      ? `${currentOrigin}/api/${username}`
      : `${currentOrigin}/api/${username}/${profileSlug}`

  const embedCode = `![Widget](${embedUrl})`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)

    const skipGuide =
      typeof window !== 'undefined' && localStorage.getItem('gitascii_skip_copy_guide') === 'true'
    if (!skipGuide) {
      setShowGuide(true)
    }

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="relative h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-inter-tight text-[16px] font-medium text-chalk">Git</span>
          <span className="font-pt-serif text-[16px] font-light italic text-signal-lime">
            Ascii
          </span>
        </Link>

        <div className="h-4 w-px bg-graphite" />

        <div className="flex items-center gap-3 z-10">
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/${session.username}`}
                className="inline-flex items-center gap-1.5 rounded-sm border border-signal-lime/30 bg-onyx px-3.5 py-2 font-inter-tight text-label font-medium text-signal-lime transition-all duration-300 hover:border-signal-lime hover:shadow-[0_0_8px_rgba(197,255,74,0.2)] hover:bg-onyx/80"
              >
                <User className="size-3.5" />
                <span>@{session.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-sm border border-graphite hover:border-red-500/50 hover:bg-red-500/10 text-ash hover:text-red-400 transition-all duration-300 cursor-pointer"
                title="Sair"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <a
              href={`/api/auth/login?redirect_to=/${username}`}
              onClick={() => setIsLoginLoading(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-signal-lime px-4 py-1.5 font-inter-tight text-label font-bold text-black transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:brightness-110 cursor-pointer"
            >
              {isLoginLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              <span>LOGIN</span>
            </a>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-onyx border border-graphite rounded-sm p-1">
        <button
          onClick={undo}
          data-testid="undo-btn"
          disabled={!canUndo}
          title={t('editor.toolbar.undo', 'Undo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Undo2 size={16} />
        </button>

        <button
          onClick={redo}
          data-testid="redo-btn"
          disabled={!canRedo}
          title={t('editor.toolbar.redo', 'Redo')}
          className="p-1.5 rounded-xs hover:bg-graphite disabled:opacity-30 disabled:hover:bg-transparent text-chalk transition-colors cursor-pointer"
        >
          <Redo2 size={16} />
        </button>

        <div className="h-4 w-px bg-graphite mx-1" />

        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          data-testid="zoom-out-btn"
          title={t('editor.toolbar.zoom_out', 'Zoom Out')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomOut size={16} />
        </button>

        <span className="font-jetbrains-mono text-eyebrow text-ash px-2">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          data-testid="zoom-in-btn"
          title={t('editor.toolbar.zoom_in', 'Zoom In')}
          className="p-1.5 rounded-xs hover:bg-graphite text-chalk transition-colors cursor-pointer"
        >
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        {isOwner && (
          <button
            onClick={handleSave}
            data-testid="save-profile-btn"
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-signal-lime text-black glow-lime'
                : saveStatus === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-onyx text-chalk border border-graphite hover:bg-graphite hover:text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            <span>
              {saveStatus === 'saving'
                ? t('common.saving', 'Saving...')
                : saveStatus === 'saved'
                  ? t('common.saved', 'Saved!')
                  : saveStatus === 'error'
                    ? t('common.error', 'Error!')
                    : t('common.save_profile', 'Save Profile')}
            </span>
          </button>
        )}

        {isOwner ? (
          <button
            onClick={handleCopyCode}
            data-testid="copy-code-btn"
            className="flex items-center gap-1.5 bg-signal-lime text-black px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider glow-lime hover:brightness-110 transition-all cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>
              {copied ? t('common.copied', 'Copied!') : t('common.copy_code', 'Copy Code')}
            </span>
          </button>
        ) : (
          <button
            onClick={handleExport}
            data-testid="export-layout-btn"
            className="flex items-center gap-1.5 bg-signal-lime text-black px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider glow-lime hover:brightness-110 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>{t('common.export_layout', 'Export Layout')}</span>
          </button>
        )}
      </div>

      <CopyGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        username={username}
        embedCode={embedCode}
      />

      <ExportGuideModal
        isOpen={showExportGuide}
        onClose={() => setShowExportGuide(false)}
        username={username}
        onDownload={handleExport}
        embedCode={embedCode}
      />
    </header>
  )
}

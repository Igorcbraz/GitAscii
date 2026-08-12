'use client'

import {
  Check,
  Command,
  Download,
  Github,
  Loader2,
  LogIn,
  LogOut,
  Search,
  User,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import { APP_URL } from '../../../../constants'
import { useEditorStore } from '../../store/editorStore'
import { CommandPalette } from '../CommandPalette/CommandPalette'
import { ExportGuideModal } from './ExportGuideModal'

export function EditorToolbar() {
  const { t } = useI18n()
  const {
    config,
    githubData,
    selectedInstanceId,
    removeWidget,
    selectWidget,
    updateWidgetPosition,
    duplicateWidget,
    session,
  } = useEditorStore()

  const [currentOrigin, setCurrentOrigin] = useState(APP_URL)
  const [showExportGuide, setShowExportGuide] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commitStatus, setCommitStatus] = useState<'idle' | 'committing' | 'success' | 'error'>(
    'idle'
  )
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
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((open) => !open)
        return
      }

      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (useEditorStore.getState().canRedo) {
            e.preventDefault()
            useEditorStore.getState().redo()
          }
        } else {
          if (useEditorStore.getState().canUndo) {
            e.preventDefault()
            useEditorStore.getState().undo()
          }
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        if (useEditorStore.getState().canRedo) {
          e.preventDefault()
          useEditorStore.getState().redo()
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
  const profileSlug = config.profileSlug || 'default'
  const viewerUsername = session?.username || username

  const embedUrl =
    profileSlug === 'default'
      ? `${currentOrigin}/api/${viewerUsername}`
      : `${currentOrigin}/api/${viewerUsername}/${profileSlug}`

  const embedCode = `<a href="${currentOrigin}">
  <img
    src="${embedUrl}"
    alt="GitAscii Widget"
    width="100%"
  />
</a>`

  const handleCommitToGithub = async () => {
    if (!session) {
      setCommitStatus('committing')
      window.location.href = `/api/auth/login?redirect_to=/${username}`
      return
    }

    setCommitStatus('committing')
    const currentViewerEmbedUrl =
      profileSlug === 'default'
        ? `${currentOrigin}/api/${session.username}`
        : `${currentOrigin}/api/${session.username}/${profileSlug}`

    const v = Date.now()
    const urlWithCacheBust = currentViewerEmbedUrl.includes('?')
      ? `${currentViewerEmbedUrl}&v=${v}`
      : `${currentViewerEmbedUrl}?v=${v}`
    const finalEmbedCode = `<a href="${currentOrigin}">
  <img
    src="${urlWithCacheBust}"
    alt="GitAscii Widget"
    width="100%"
  />
</a>`

    const exportData = {
      username: session.username,
      widgets: config.widgets,
      globalStyles: config.globalStyles,
      templateId: config.templateId,
      profileSlug,
    }

    try {
      const res = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embedCode: finalEmbedCode, exportData }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'not_installed' && data.installUrl) {
          const urlObj = new URL(data.installUrl)
          urlObj.searchParams.set('state', username)
          window.location.href = urlObj.toString()
          return
        }
        throw new Error(data.error || 'Failed to commit')
      }

      setCommitStatus('success')
      setTimeout(() => setCommitStatus('idle'), 2000)
    } catch (e) {
      console.error(e)
      setCommitStatus('error')
      setTimeout(() => setCommitStatus('idle'), 3000)
    }
  }

  const renderUpdateReadmeButton = () => (
    <button
      onClick={handleCommitToGithub}
      data-testid="commit-github-btn"
      disabled={commitStatus === 'committing'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer ${
        commitStatus === 'success'
          ? 'bg-signal-lime text-black glow-lime'
          : commitStatus === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-signal-lime text-black glow-lime hover:brightness-110'
      }`}
    >
      {commitStatus === 'committing' ? (
        <Loader2 size={14} className="animate-spin" />
      ) : commitStatus === 'success' ? (
        <Check size={14} />
      ) : (
        <Github size={14} />
      )}
      <span className="hidden sm:inline">
        {commitStatus === 'committing'
          ? t('common.committing', 'Committing...')
          : commitStatus === 'success'
            ? t('common.committed', 'Committed!')
            : commitStatus === 'error'
              ? t('common.error', 'Error!')
              : t('common.update_readme', 'Update README')}
      </span>
    </button>
  )

  return (
    <header className="relative h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-60">
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
                <span className="hidden sm:inline">@{session.username}</span>
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

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          data-testid="command-palette-btn"
          title="Busca Global (Ctrl+K)"
          className="flex items-center gap-2.5 w-70 xl:w-90 px-3 py-1.5 rounded-sm bg-onyx border border-graphite/70 hover:border-graphite text-ash hover:text-chalk transition-all duration-200 cursor-pointer group"
        >
          <Search size={13} className="shrink-0 text-fog" />
          <span className="font-inter-tight text-note text-fog flex-1 text-left">
            Pesquisar widgets, templates...
          </span>
          <kbd className="flex items-center gap-0.5 bg-void-black border border-graphite/50 text-fog text-caption px-1.5 py-0.5 rounded-xs font-inter-tight shrink-0">
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleExport}
          data-testid="export-layout-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer bg-onyx text-chalk border border-graphite hover:bg-graphite hover:text-white"
        >
          <Download size={14} />
          <span className="hidden sm:inline">{t('common.export_layout', 'Export Layout')}</span>
        </button>
        {renderUpdateReadmeButton()}
      </div>

      <ExportGuideModal
        isOpen={showExportGuide}
        onClose={() => setShowExportGuide(false)}
        username={username}
        onDownload={handleExport}
        embedCode={embedCode}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommit={handleCommitToGithub}
        onExport={handleExport}
        commitStatus={commitStatus}
      />
    </header>
  )
}

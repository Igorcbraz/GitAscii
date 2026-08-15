'use client'

import {
  Check,
  Command,
  Download,
  Github,
  Info,
  Loader2,
  LogIn,
  LogOut,
  Search,
  User,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { safeStorage } from '@/utils/storage'

import { APP_URL } from '../../../../constants'
import { useEditorStore } from '../../store/editorStore'
import { CommandPalette } from '../CommandPalette/CommandPalette'
import { ExportGuideModal } from './ExportGuideModal'

export function EditorToolbar() {
  const { t } = useI18n()

  const username = useEditorStore((state) => state.config?.username)
  const profileSlug = useEditorStore((state) => state.config?.profileSlug || 'default')
  const hasData = useEditorStore((state) => Boolean(state.config && state.githubData))
  const session = useEditorStore((state) => state.session)

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
      } else {
        console.warn('Logout endpoint returned non-ok status:', res.status)
      }
    } catch (e) {
      console.error('Failed to log out:', e)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin)
    }
  }, [])

  const handleExport = useCallback(() => {
    const currentConfig = useEditorStore.getState().config
    if (!currentConfig) return
    try {
      const exportData = {
        widgets: currentConfig.widgets,
        globalStyles: currentConfig.globalStyles,
        templateId: currentConfig.templateId,
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download =
        profileSlug && profileSlug !== 'default'
          ? `gitascii_${profileSlug.toLowerCase()}.json`
          : 'gitascii.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const skipGuide = safeStorage.getItem('gitascii_skip_export_guide') === 'true'
      if (!skipGuide) {
        setShowExportGuide(true)
      }
    } catch (err) {
      console.error('Failed to export layout:', err)
    }
  }, [profileSlug])

  useEffect(() => {
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

      const store = useEditorStore.getState()

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (store.canRedo) {
            e.preventDefault()
            store.redo()
          }
        } else {
          if (store.canUndo) {
            e.preventDefault()
            store.undo()
          }
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        if (store.canRedo) {
          e.preventDefault()
          store.redo()
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        store.copyWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        store.pasteWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'x') {
        e.preventDefault()
        store.cutWidgets()
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        if (store.config) {
          store.setSelection(store.config.widgets.map((w) => w.instanceId))
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        store.copyWidgets()
        store.pasteWidgets()
        return
      }

      if (cmdOrCtrl && e.key === '[') {
        e.preventDefault()
        const ids = store.selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => store.moveWidgetLayer(id, 'down'))
        }
        return
      }

      if (cmdOrCtrl && e.key === ']') {
        e.preventDefault()
        const ids = store.selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => store.moveWidgetLayer(id, 'up'))
        }
        return
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        const ids = store.selectedInstanceIds
        if (ids && ids.length > 0) {
          ids.forEach((id) => store.toggleWidgetLock(id))
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const ids = store.selectedInstanceIds
        if (ids && ids.length > 0) {
          e.preventDefault()
          store.removeWidgets(ids)
        }
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        store.selectWidget(null)
        return
      }

      const selectedIds = store.selectedInstanceIds
      const currentConfig = store.config
      if (selectedIds && selectedIds.length > 0 && currentConfig) {
        const step = e.shiftKey ? 10 : 2

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault()
          const deltas = selectedIds
            .map((id) => {
              const widget = currentConfig.widgets.find((w) => w.instanceId === id)
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
            store.updateWidgetPositions(deltas, true)
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const handleOpenExportGuide = () => {
      setShowExportGuide(true)
    }
    window.addEventListener('openExportGuide', handleOpenExportGuide)
    return () => window.removeEventListener('openExportGuide', handleOpenExportGuide)
  }, [])

  if (!hasData || !username) return null

  const viewerUsername = session?.username || username

  const v = Date.now()
  const currentViewerEmbedUrl =
    profileSlug === 'default'
      ? `${currentOrigin}/api/${viewerUsername}`
      : `${currentOrigin}/api/${viewerUsername}/${profileSlug}`

  const urlWithCacheBust = currentViewerEmbedUrl.includes('?')
    ? `${currentViewerEmbedUrl}&v=${v}`
    : `${currentViewerEmbedUrl}?v=${v}`

  const embedCode = `<a href="${currentOrigin}">
  <img
    src="${urlWithCacheBust}"
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

    const currentConfig = useEditorStore.getState().config
    if (!currentConfig) return

    const exportData = {
      username: session.username,
      widgets: currentConfig.widgets,
      globalStyles: currentConfig.globalStyles,
      templateId: currentConfig.templateId,
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
          ? t('editor.toolbar.updating', 'Atualizando...')
          : commitStatus === 'success'
            ? t('editor.toolbar.updated', 'Atualizado!')
            : commitStatus === 'error'
              ? t('editor.toolbar.error', 'Erro ao salvar')
              : t('editor.toolbar.update_readme', 'Update README')}
      </span>
    </button>
  )

  return (
    <header className="relative h-14 w-full bg-void-black border-b border-graphite px-4 flex items-center justify-between text-chalk shrink-0 z-60">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-5 h-5 bg-signal-lime flex items-center justify-center font-mono font-bold text-xs text-black">
            G
          </div>
          <span className="font-mono text-base font-semibold text-white tracking-tight">
            GitAscii
          </span>
        </Link>

        <div className="h-4 w-px bg-graphite hidden sm:block" />

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
                title={t('editor.toolbar.logout', 'Sair da conta')}
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsLoginLoading(true)
                window.location.href = `/api/auth/login?redirect_to=/${username}`
              }}
              disabled={isLoginLoading}
              className="inline-flex items-center gap-2 rounded-sm bg-signal-lime px-4 py-1.5 font-inter-tight text-label font-bold text-black transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.98] hover:shadow-[0_0_12px_rgba(197,255,74,0.4)] hover:brightness-110 cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
            >
              {isLoginLoading ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              <span>{t('editor.toolbar.login_github', 'LOGIN')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          data-testid="command-palette-btn"
          id="tour-global-search"
          title="Busca Global (Ctrl+K)"
          className="flex items-center gap-2.5 w-70 xl:w-90 px-3 py-1.5 rounded-sm bg-onyx border border-graphite/70 hover:border-graphite text-ash hover:text-chalk transition-all duration-200 cursor-pointer group"
        >
          <Search size={13} className="shrink-0 text-fog" />
          <span className="font-inter-tight text-note text-fog flex-1 text-left">
            {t('editor.toolbar.search_commands', 'Pesquisar widgets, templates...')}
          </span>
          <kbd className="flex items-center gap-0.5 bg-void-black border border-graphite/50 text-fog text-caption px-1.5 py-0.5 rounded-xs font-inter-tight shrink-0">
            <Command size={9} />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3" id="tour-export-buttons">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('gitascii:start-tour'))}
          title={t('editor.toolbar.tour', 'Ver Tutorial')}
          className="p-1.5 rounded-[4px] text-ash hover:bg-graphite hover:text-chalk transition-colors cursor-pointer"
        >
          <Info size={14} />
        </button>
        <button
          onClick={handleExport}
          data-testid="export-layout-btn"
          title={t('editor.toolbar.export_json', 'Exportar Layout (JSON)')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-all cursor-pointer bg-onyx text-chalk border border-graphite hover:bg-graphite hover:text-white"
        >
          <Download size={14} />
          <span className="hidden sm:inline">{t('editor.toolbar.export', 'Export Layout')}</span>
        </button>
        {renderUpdateReadmeButton()}
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onCommit={handleCommitToGithub}
        onExport={handleExport}
        commitStatus={commitStatus}
      />
      <ExportGuideModal
        isOpen={showExportGuide}
        onClose={() => setShowExportGuide(false)}
        username={username}
        profileSlug={profileSlug}
        onDownload={handleExport}
        embedCode={embedCode}
      />
    </header>
  )
}

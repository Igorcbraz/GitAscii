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
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'

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
      }
    } catch (e) {
      console.error(e)
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
      link.download = `gitascii_layout_${currentConfig.username}.json`
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
  }, [])

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
    <header className="h-14 border-b border-graphite bg-void-black flex items-center justify-between px-4 z-20 shrink-0">
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

        <div className="hidden sm:flex items-center gap-2 text-note font-inter-tight text-ash">
          <span>@{username}</span>
          {profileSlug !== 'default' && (
            <>
              <span className="text-graphite">/</span>
              <span className="text-signal-lime font-medium">#{profileSlug}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xs bg-onyx border border-graphite text-ash hover:text-chalk hover:border-slate transition-colors text-note font-inter-tight cursor-pointer"
        >
          <Search size={13} />
          <span>{t('editor.toolbar.search_commands', 'Comandos')}</span>
          <kbd className="px-1.5 py-0.5 bg-graphite/60 rounded-xs text-[10px] font-mono text-fog border border-graphite/40">
            <Command size={10} className="inline mr-0.5" />K
          </kbd>
        </button>

        <button
          onClick={handleExport}
          title={t('editor.toolbar.export_json', 'Exportar Layout (JSON)')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs bg-onyx border border-graphite text-ash hover:text-chalk hover:border-slate transition-colors text-note font-inter-tight cursor-pointer"
        >
          <Download size={13} />
          <span className="hidden lg:inline">{t('editor.toolbar.export', 'Exportar')}</span>
        </button>

        <button
          onClick={() => setShowExportGuide(true)}
          className="px-3 py-1.5 border border-graphite hover:border-slate text-chalk rounded-sm font-inter-tight font-medium text-note uppercase tracking-wider transition-colors cursor-pointer"
        >
          {t('editor.toolbar.embed', 'Embed')}
        </button>

        {renderUpdateReadmeButton()}

        <div className="h-4 w-px bg-graphite hidden sm:block mx-1" />

        {session ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/${session.username}`}
              className="flex items-center gap-1.5 px-2 py-1 bg-onyx border border-graphite rounded-xs text-ash hover:text-chalk hover:border-slate transition-colors text-note font-inter-tight"
            >
              <User size={13} className="text-signal-lime" />
              <span className="hidden sm:inline font-mono">@{session.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              title={t('editor.toolbar.logout', 'Sair da conta')}
              className="p-1.5 rounded-xs text-ash hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsLoginLoading(true)
              window.location.href = `/api/auth/login?redirect_to=/${username}`
            }}
            disabled={isLoginLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#24292F] hover:bg-[#24292F]/80 text-white rounded-sm font-inter-tight font-medium text-note transition-colors cursor-pointer disabled:opacity-60"
          >
            {isLoginLoading ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
            <span className="hidden sm:inline">
              {t('editor.toolbar.login_github', 'Login GitHub')}
            </span>
          </button>
        )}
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
        onDownload={handleExport}
        embedCode={embedCode}
      />
    </header>
  )
}

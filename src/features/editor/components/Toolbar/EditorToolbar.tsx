'use client'

import {
  Check,
  ChevronDown,
  Command,
  Download,
  Github,
  Info,
  Loader2,
  LogIn,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { UserMenuDropdown } from '@/components/ui/UserMenuDropdown'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { safeStorage } from '@/utils/storage'

import { APP_URL } from '../../../../constants'
import { useEditorStore } from '../../store/editorStore'
import { useViewModeStore } from '../../store/viewModeStore'
import { CommandPalette } from '../CommandPalette/CommandPalette'
import { ExportGuideModal } from './ExportGuideModal'
import { GuestLoginModal } from './GuestLoginModal'
import { ProfileSwitcher } from './ProfileSwitcher'
import { StarPromptModal } from './StarPromptModal'
import { ViewModeToggle } from './ViewModeToggle'

interface EditorToolbarProps {
  embedded?: boolean
  username?: string
  profileSlug?: string
}

export function EditorToolbar({
  embedded = false,
  username: propUsername,
  profileSlug: propProfileSlug = 'default',
}: EditorToolbarProps) {
  const { t } = useI18n()

  const storeUsername = useEditorStore((state) => state.config?.username)
  const storeProfileSlug = useEditorStore((state) => state.config?.profileSlug)
  const username = propUsername || storeUsername
  const profileSlug = propProfileSlug || storeProfileSlug || 'default'
  const hasData = useEditorStore((state) => Boolean(state.config && state.githubData))
  const session = useEditorStore((state) => state.session)
  const isDirty = useEditorStore((state) => state.isDirty)
  const markClean = useEditorStore((state) => state.markClean)
  const triggerPreviewNudge = useViewModeStore((state) => state.triggerPreviewNudge)
  const showPreviewNudge = useViewModeStore((state) => state.showPreviewNudge)

  const [currentOrigin, setCurrentOrigin] = useState(APP_URL)
  const [showExportGuide, setShowExportGuide] = useState(false)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [showStarPrompt, setShowStarPrompt] = useState(false)
  const [starPromptSource, setStarPromptSource] = useState<'export' | 'commit'>('export')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [commitStatus, setCommitStatus] = useState<'idle' | 'committing' | 'success' | 'error'>(
    'idle'
  )
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [showDevDropdown, setShowDevDropdown] = useState(false)
  const isDev = process.env.NODE_ENV === 'development'

  const handleFakeCommit = useCallback(() => {
    setShowDevDropdown(false)
    setCommitStatus('committing')
    setTimeout(() => {
      setCommitStatus('success')
      setTimeout(() => setCommitStatus('idle'), 2500)
      setTimeout(() => triggerPreviewNudge(), 800)
    }, 1200)
  }, [triggerPreviewNudge])

  const triggerStarPromptIfNeeded = useCallback((source: 'export' | 'commit') => {
    const hasStarred = safeStorage.getItem('gitascii_has_starred') === 'true'
    if (!hasStarred) {
      setStarPromptSource(source)
      setShowStarPrompt(true)
    }
  }, [])

  const handleExportFinished = useCallback(() => {
    if (!session) {
      const hasBeenPrompted = safeStorage.getItem('gitascii_guest_export_prompted') === 'true'
      if (!hasBeenPrompted) {
        setShowGuestModal(true)
        return
      }
    }
    triggerStarPromptIfNeeded('export')
  }, [session, triggerStarPromptIfNeeded])

  useEffect(() => {
    if (session?.username) {
      fetch(API_ENDPOINTS.GITHUB.STAR)
        .then((res) => res.json())
        .then((data) => {
          if (data?.starred) {
            safeStorage.setItem('gitascii_has_starred', 'true')
          }
        })
        .catch(() => {})
    }
  }, [session?.username])

  const handleLogout = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' })
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

      setShowExportGuide(true)
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
      window.location.href = API_ENDPOINTS.AUTH.LOGIN(`/${username}`)
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
      const res = await fetch(API_ENDPOINTS.GITHUB.COMMIT, {
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

      markClean()
      setCommitStatus('success')
      setTimeout(() => setCommitStatus('idle'), 2500)
      setTimeout(() => {
        triggerPreviewNudge()
      }, 800)
      setTimeout(() => {
        triggerStarPromptIfNeeded('commit')
      }, 600)
    } catch (e) {
      console.error(e)
      setCommitStatus('error')
      setTimeout(() => setCommitStatus('idle'), 3000)
    }
  }

  const renderUpdateReadmeButton = () => {
    const isCommitDisabled = commitStatus === 'committing' || (!isDirty && commitStatus === 'idle')
    const buttonTitle =
      !isDirty && commitStatus === 'idle'
        ? t('editor.toolbar.no_changes_title', 'README is up to date (no pending changes)')
        : undefined

    const baseLabel =
      commitStatus === 'committing'
        ? t('editor.toolbar.updating', 'Updating...')
        : commitStatus === 'success'
          ? t('editor.toolbar.updated', 'Updated!')
          : commitStatus === 'error'
            ? t('editor.toolbar.error', 'Failed to save')
            : t('editor.toolbar.update_readme', 'Update README')

    const baseIcon =
      commitStatus === 'committing' ? (
        <Loader2 size={12} className="animate-spin" />
      ) : commitStatus === 'success' ? (
        <Check size={12} />
      ) : (
        <Github size={12} />
      )

    const btnClass = `flex items-center gap-1.5 px-2.5 h-[30px] font-inter-tight font-medium text-[10px] uppercase tracking-[0.08em] transition-all ${
      commitStatus === 'success'
        ? 'bg-signal-lime text-black glow-lime'
        : commitStatus === 'error'
          ? 'bg-red-500 text-white'
          : isCommitDisabled
            ? 'bg-graphite/60 text-ash/60 border border-graphite/60 opacity-60 cursor-not-allowed'
            : 'bg-signal-lime text-black glow-lime hover:brightness-110 cursor-pointer'
    }`

    if (!isDev) {
      return (
        <button
          onClick={handleCommitToGithub}
          data-testid="commit-github-btn"
          disabled={isCommitDisabled}
          title={buttonTitle}
          className={`${btnClass} rounded-sm`}
        >
          {baseIcon}
          <span className="hidden sm:inline">{baseLabel}</span>
        </button>
      )
    }

    return (
      <div
        className="relative flex items-stretch"
        data-testid="commit-github-btn"
        title={buttonTitle}
      >
        <button
          onClick={handleCommitToGithub}
          disabled={isCommitDisabled}
          className={`${btnClass} rounded-l-sm border-r border-black/20`}
          title={buttonTitle || t('editor.toolbar.dev_commit_real_title', 'Real commit to GitHub')}
        >
          {baseIcon}
          <span className="hidden sm:inline">{baseLabel}</span>
        </button>

        <button
          onClick={() => setShowDevDropdown((v) => !v)}
          disabled={commitStatus === 'committing'}
          className={`${btnClass} px-1.5 rounded-r-sm`}
          title={t('editor.toolbar.dev_options_title', 'Dev options')}
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${showDevDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {showDevDropdown && (
          <div className="absolute top-full right-0 mt-1.5 z-[400] min-w-[200px] bg-carbon border border-graphite rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-3 py-1.5 border-b border-graphite flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-signal-lime uppercase tracking-widest">
                {t('editor.toolbar.dev_mode_badge', 'DEV MODE')}
              </span>
            </div>

            <button
              onClick={() => {
                setShowDevDropdown(false)
                handleCommitToGithub()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-note font-inter-tight text-white hover:bg-graphite transition-colors cursor-pointer"
            >
              <Github size={13} className="text-ash shrink-0" />
              <div>
                <div className="font-medium leading-tight">
                  {t('editor.toolbar.dev_real_commit', 'Real commit')}
                </div>
                <div className="text-caption text-ash leading-tight">
                  {t('editor.toolbar.dev_real_commit_desc', 'Sends directly to GitHub')}
                </div>
              </div>
            </button>

            <button
              onClick={handleFakeCommit}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-note font-inter-tight text-white hover:bg-graphite transition-colors cursor-pointer border-t border-graphite/50"
            >
              <Check size={13} className="text-signal-lime shrink-0" />
              <div>
                <div className="font-medium leading-tight">
                  {t('editor.toolbar.dev_fake_commit', 'Mock commit')}
                </div>
                <div className="text-caption text-ash leading-tight">
                  {t(
                    'editor.toolbar.dev_fake_commit_desc',
                    'Simulates success · tests preview nudge'
                  )}
                </div>
              </div>
            </button>
          </div>
        )}

        {showDevDropdown && (
          <div className="fixed inset-0 z-[399]" onClick={() => setShowDevDropdown(false)} />
        )}
      </div>
    )
  }

  return (
    <header
      className={`relative h-14 w-full bg-void-black border-b border-graphite/60 flex items-center text-chalk shrink-0 transition-[z-index] ${
        showPreviewNudge ? 'z-[9995]' : 'z-60'
      }`}
    >
      <div className="flex items-center h-full pl-3 pr-2 gap-0 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 pr-3 mr-1 hover:opacity-80 transition-opacity shrink-0"
        >
          <div className="w-5 h-5 bg-signal-lime flex items-center justify-center font-mono font-bold text-xs text-black shrink-0">
            G
          </div>
          <span className="font-mono text-[13px] font-semibold text-white tracking-tight hidden sm:block">
            GitAscii
          </span>
        </Link>

        <span className="h-5 w-px bg-graphite/80 shrink-0" />

        <div className="flex items-center gap-1 px-2">
          <LanguageSelector align="left" />
          <ViewModeToggle />
        </div>

        {!embedded && <span className="h-5 w-px bg-graphite/80 shrink-0" />}

        {!embedded && (
          <div className="flex items-center pl-2 z-10">
            {session ? (
              <UserMenuDropdown username={session.username} align="left" onLogout={handleLogout} />
            ) : (
              <button
                onClick={() => {
                  setIsLoginLoading(true)
                  window.location.href = API_ENDPOINTS.AUTH.LOGIN(`/${username}`)
                }}
                disabled={isLoginLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-graphite/60 bg-onyx px-3 h-[30px] w-[116px] font-inter-tight text-[11px] font-medium text-white transition-all duration-200 hover:border-graphite hover:shadow-[0_0_12px_rgba(197,255,74,0.12)] active:scale-[0.98] group cursor-pointer disabled:opacity-60 disabled:hover:scale-100 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-signal-lime/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {isLoginLoading ? (
                  <span className="w-3 h-3 border-[1.5px] border-signal-lime border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <LogIn className="size-3 text-signal-lime group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
                )}
                <span className="font-inter-tight font-medium text-white tracking-wide z-10">
                  Log
                  <span className="font-pt-serif italic text-signal-lime ml-0.5 font-light text-[13px]">
                    in
                  </span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1.5">
        <button
          onClick={embedded ? undefined : () => setCommandPaletteOpen(true)}
          disabled={embedded}
          data-testid="command-palette-btn"
          id="tour-global-search"
          title={
            embedded
              ? t('editor.toolbar.search_commands', 'Search widgets, templates...')
              : t('editor.toolbar.search_shortcut', 'Global Search (Ctrl+K)')
          }
          className={`flex items-center gap-2 w-64 xl:w-80 px-2.5 h-[30px] rounded-sm bg-onyx border border-graphite/60 text-ash transition-all duration-200 ${
            embedded
              ? 'opacity-60 cursor-not-allowed'
              : 'hover:border-graphite hover:bg-carbon/60 hover:text-chalk cursor-pointer group'
          }`}
        >
          <Search size={12} className="shrink-0 text-fog/80" />
          <span className="font-inter-tight text-[11px] text-fog/80 flex-1 text-left">
            {t('editor.toolbar.search_commands', 'Search widgets, templates...')}
          </span>
          <kbd className="flex items-center gap-0.5 bg-void-black border border-graphite/40 text-fog/60 text-[9px] px-1.5 py-0.5 rounded-[2px] font-inter-tight shrink-0 leading-none">
            <Command size={8} />K
          </kbd>
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('gitascii:start-tour'))}
          title={t('editor.toolbar.tour', 'Take Tour')}
          className="h-[30px] w-[30px] flex items-center justify-center text-ash/70 hover:text-signal-lime hover:bg-graphite/40 rounded-sm transition-all duration-150 cursor-pointer"
        >
          <Info size={13} />
        </button>
      </div>

      {!embedded ? (
        <div className="flex items-center h-full ml-auto pr-3 pl-2 gap-2" id="tour-export-buttons">
          <ProfileSwitcher username={username} currentProfileSlug={profileSlug} />
          <span className="h-5 w-px bg-graphite/80 shrink-0" />

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              data-testid="export-layout-btn"
              title={t('editor.toolbar.export_json', 'Export Layout (JSON)')}
              className="flex items-center gap-1.5 px-2.5 h-[30px] rounded-sm font-inter-tight font-medium text-[10px] uppercase tracking-[0.08em] transition-all duration-150 cursor-pointer bg-onyx text-ash border border-graphite/60 hover:border-graphite hover:bg-graphite/60 hover:text-chalk"
            >
              <Download size={12} />
              <span className="hidden sm:inline">
                {t('editor.toolbar.export', 'Export Layout')}
              </span>
            </button>
            {renderUpdateReadmeButton()}
          </div>
        </div>
      ) : (
        <div className="flex items-center ml-auto pr-3 gap-2">
          <div className="px-2.5 py-1 bg-signal-lime/10 border border-signal-lime/30 text-signal-lime font-jetbrains-mono text-[9px] uppercase tracking-[0.12em] hidden sm:flex items-center gap-1.5 rounded-[2px]">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-lime animate-pulse" />
            <span>Interactive Demo</span>
          </div>
        </div>
      )}

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
        onFinished={handleExportFinished}
      />
      <GuestLoginModal
        isOpen={showGuestModal}
        onClose={() => {
          setShowGuestModal(false)
          triggerStarPromptIfNeeded('export')
        }}
        username={username}
      />
      <StarPromptModal
        isOpen={showStarPrompt}
        onClose={() => setShowStarPrompt(false)}
        source={starPromptSource}
      />
    </header>
  )
}

'use client'

import { Cloud } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../../store/editorStore'

interface SharedDraft {
  revision: number
  config: SavedConfiguration
  canUndo: boolean
  canRedo: boolean
}

export function CloudDraftControls({ username, slug }: { username: string; slug: string }) {
  const { t } = useI18n()
  const session = useEditorStore((state) => state.session)
  const [draft, setDraft] = useState<SharedDraft | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [replace, setReplace] = useState(false)
  const generation = useRef(0)
  const details = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    generation.current++
    setDraft(null)
    setReplace(false)
    setMessage('')
    setBusy(false)
    if (details.current && new URLSearchParams(window.location.search).get('shared') === '1') {
      details.current.open = true
      setReplace(true)
    }
  }, [username, slug, session?.username])
  const run = async (operation: 'inspect' | 'save' | 'load' | 'undo' | 'redo') => {
    const current = generation.current
    setBusy(true)
    setFailed(false)
    setMessage('')
    try {
      let response: Response
      if (operation === 'inspect' || operation === 'load') {
        response = await fetch(`/api/editor/draft?slug=${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        })
      } else {
        const config = useEditorStore.getState().config
        if (!config || !draft) return
        const change =
          operation === 'save'
            ? {
                layout: {
                  widgets: config.widgets,
                  globalStyles: config.globalStyles,
                  templateId: config.templateId,
                },
              }
            : { history: operation }
        response = await fetch('/api/editor/draft', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, expectedRevision: draft.revision, ...change }),
        })
      }
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 409)
          throw new Error(
            t(
              'automation.draft.conflict',
              'The shared draft changed. Load it before saving again. Your local changes are still here.'
            )
          )
        throw new Error(
          t(
            'automation.draft.error',
            'Could not access the shared draft. Try again; your local changes are safe.'
          )
        )
      }
      if (current !== generation.current) return
      const next = data as SharedDraft
      setDraft(next)
      if (operation === 'load' || operation === 'undo' || operation === 'redo') {
        useEditorStore
          .getState()
          .importLayout(next.config.widgets, next.config.globalStyles, next.config.templateId)
        setReplace(false)
        setMessage(
          t(
            'automation.draft.loaded',
            'Shared draft loaded. Review it in the editor before publishing.'
          )
        )
      } else if (operation === 'save')
        setMessage(
          t('automation.draft.saved', 'Saved. Your assistant can now read this shared draft.')
        )
    } catch (error) {
      if (current === generation.current) {
        setFailed(true)
        setMessage(
          error instanceof Error
            ? error.message
            : t('automation.draft.error', 'Could not access the shared draft.')
        )
      }
    } finally {
      if (current === generation.current) setBusy(false)
    }
  }
  if (session?.username.toLowerCase() !== username.toLowerCase()) return null
  const buttonClass =
    'rounded border border-graphite px-3 py-2 text-sm hover:border-signal-lime disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-signal-lime'
  return (
    <details
      ref={details}
      className="fixed bottom-14 right-3 z-50 sm:relative sm:bottom-auto sm:right-auto"
      onToggle={(event) => {
        if (event.currentTarget.open && !draft && !busy) void run('inspect')
      }}
    >
      <summary
        className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-sm border border-graphite bg-void-black px-3 text-xs text-chalk focus-visible:outline-2 focus-visible:outline-signal-lime sm:h-[30px] sm:px-2"
        title={t('automation.draft.title', 'Shared draft')}
      >
        <Cloud size={14} aria-hidden="true" />
        <span className="hidden lg:inline">{t('automation.draft.title', 'Shared draft')}</span>
      </summary>
      <div className="fixed right-3 top-16 z-50 mt-2 max-h-[calc(100dvh-8rem)] w-80 max-w-[85vw] space-y-4 overflow-y-auto rounded border border-graphite bg-void-black p-4 text-chalk shadow-xl sm:absolute sm:right-0 sm:top-full">
        <p className="text-sm text-ash">
          {t(
            'automation.draft.description',
            'Share a draft between your browser and assistant. This does not publish to GitHub.'
          )}
        </p>
        {draft && (
          <p className="text-xs text-ash">
            {t('automation.draft.revision', 'Shared revision')}: {draft.revision}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy || !draft}
            className={buttonClass}
            onClick={() => void run('save')}
          >
            {t('automation.draft.save', 'Save browser draft')}
          </button>
          <button disabled={busy} className={buttonClass} onClick={() => setReplace(true)}>
            {t('automation.draft.load', 'Load shared draft')}
          </button>
          <button
            disabled={busy || !draft?.canUndo}
            className={buttonClass}
            onClick={() => void run('undo')}
          >
            {t('automation.draft.undo', 'Undo shared change')}
          </button>
          <button
            disabled={busy || !draft?.canRedo}
            className={buttonClass}
            onClick={() => void run('redo')}
          >
            {t('automation.draft.redo', 'Redo shared change')}
          </button>
        </div>
        {replace && (
          <div className="space-y-3 border-t border-graphite pt-3">
            <p className="text-sm">
              {t(
                'automation.draft.replace_note',
                'Load the shared layout into this editor? You can undo this local replacement with the editor’s Undo command.'
              )}
            </p>
            <button className={buttonClass} disabled={busy} onClick={() => void run('load')}>
              {t('automation.draft.confirm_load', 'Load into editor')}
            </button>
          </div>
        )}
        <p role={failed ? 'alert' : 'status'} className="text-sm">
          {busy ? t('automation.loading', 'Loading…') : message}
        </p>
        {failed && !draft && (
          <button className={buttonClass} disabled={busy} onClick={() => void run('inspect')}>
            {t('automation.retry', 'Try again')}
          </button>
        )}
        <Link
          href="/settings/connections"
          className="block text-sm text-signal-lime underline underline-offset-4"
        >
          {t('automation.connections.title', 'Connected apps')}
        </Link>
        {draft && (
          <div className="flex gap-4 text-sm text-signal-lime">
            <a
              href={`/api/editor/export?slug=${encodeURIComponent(slug)}&format=json`}
              className="underline"
            >
              {t('automation.draft.export_json', 'Download shared JSON')}
            </a>
            <a
              href={`/api/editor/export?slug=${encodeURIComponent(slug)}&format=svg`}
              className="underline"
            >
              {t('automation.draft.export_svg', 'Download shared SVG')}
            </a>
          </div>
        )}
      </div>
    </details>
  )
}

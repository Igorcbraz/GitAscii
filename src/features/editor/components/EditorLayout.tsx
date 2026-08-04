'use client'

import { AlertCircle, Grid, Monitor, Sliders } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { generateBestProfile } from '@/engine/generate/profileAnalyzer'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../store/editorStore'
import { SVGCanvas } from './Canvas/SVGCanvas'
import { PropertiesPanel } from './Properties/PropertiesPanel'
import { WidgetLibrary } from './Sidebar/WidgetLibrary'
import { EditorToolbar } from './Toolbar/EditorToolbar'

interface EditorLayoutProps {
  username: string
  profileSlug?: string
  autoGenerate?: boolean
}

export function EditorLayout({
  username,
  profileSlug = 'default',
  autoGenerate = false,
}: EditorLayoutProps) {
  const { initEditor, config, setSession, session, activeMobilePanel, setActiveMobilePanel } =
    useEditorStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)

        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (isMounted) {
              setSession(sessionData.session || null)
            }
          }
        } catch (e) {
          console.warn('Failed to fetch session', e)
        }

        const res = await fetch(`/api/github/${username}`)
        if (!res.ok) {
          let errMsg = 'Failed to fetch GitHub profile'
          try {
            const errJson = await res.json()
            errMsg = errJson.error || errMsg
          } catch {
            errMsg = (await res.text()) || errMsg
          }
          throw new Error(errMsg)
        }
        const data: NormalizedGitHubData = await res.json()

        let initialConfig: SavedConfiguration

        const storageKey = `gitascii_${data.user.id}_${profileSlug}`
        const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

        if (savedDraft) {
          try {
            initialConfig = JSON.parse(savedDraft)
          } catch {
            initialConfig = autoGenerate
              ? generateBestProfile(data)
              : createConfiguration(data.user.id, data.user.login, 'terminal', profileSlug)
          }
        } else if (autoGenerate) {
          initialConfig = generateBestProfile(data)
        } else {
          initialConfig = createConfiguration(
            data.user.id,
            data.user.login,
            'terminal',
            profileSlug,
            profileSlug === 'default' ? 'Default' : profileSlug.toUpperCase()
          )
        }

        if (isMounted) {
          initEditor(initialConfig, data)
          setLoading(false)
          if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            useEditorStore.getState().setZoom(0.4)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load profile')
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [username, profileSlug, autoGenerate, initEditor, setSession])

  const { t } = useI18n()

  if (loading) {
    return (
      <div className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight">
        <div className="w-8 h-8 border-2 border-signal-lime border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-label uppercase tracking-[0.2em] text-ash">
          {t('editor.fetching_data', '[ FETCHING GITHUB DATA ]')}
        </span>
        <span className="text-body text-chalk font-medium mt-1">@{username}</span>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="h-screen w-screen bg-carbon flex flex-col items-center justify-center text-chalk font-inter-tight">
        <span className="text-label uppercase tracking-[0.2em] text-red-400 mb-2">
          {t('editor.error_fetching', '[ ERROR ]')}
        </span>
        <h2 className="text-subheading font-pt-serif font-light text-chalk mb-4">{error}</h2>
        <Link
          href="/"
          className="px-4 py-2 bg-signal-lime text-black font-medium text-label rounded-sm glow-lime"
        >
          {t('editor.return_home', 'Return to Home')}
        </Link>
      </div>
    )
  }

  const isOwner = session && session.username.toLowerCase() === username.toLowerCase()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-carbon">
      <EditorToolbar />
      {!isOwner && (
        <div className="bg-onyx border-b border-graphite px-4 py-2 flex items-center justify-between text-note text-ash font-inter-tight select-none">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-signal-lime shrink-0" />
            <span className="text-eyebrow leading-none">
              {session ? (
                <>
                  Você está logado como <strong className="text-white">@{session.username}</strong>,
                  mas editando o perfil de <strong className="text-white">@{username}</strong>. Suas
                  alterações não serão salvas no servidor.
                </>
              ) : (
                <>
                  Você está no{' '}
                  <strong className="text-signal-lime font-medium">Modo Lite (Self-Hosted)</strong>.
                  Para salvar no servidor, faça login. Ou baixe o arquivo de layout e envie para o
                  seu repositório GitHub.
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openExportGuide'))}
              className="flex items-center gap-1 text-caption text-ash hover:text-white transition-colors cursor-pointer"
            >
              Ver Tutorial
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div
            className={`${activeMobilePanel === 'widgets' ? 'flex' : 'hidden'} lg:flex w-full lg:w-auto h-full`}
          >
            <WidgetLibrary />
          </div>
          <div
            className={`${activeMobilePanel === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 h-full relative overflow-hidden`}
          >
            <SVGCanvas />
          </div>
          <div
            className={`${activeMobilePanel === 'properties' ? 'flex' : 'hidden'} lg:flex w-full lg:w-auto h-full`}
          >
            <PropertiesPanel />
          </div>
        </div>
        <div className="lg:hidden flex border-t border-graphite bg-void-black shrink-0 pb-safe z-50">
          <button
            onClick={() => setActiveMobilePanel('widgets')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              activeMobilePanel === 'widgets' ? 'text-signal-lime' : 'text-ash'
            }`}
          >
            <Grid size={20} className="mb-1" />
            {t('editor.mobile.widgets', 'Widgets')}
          </button>
          <button
            onClick={() => setActiveMobilePanel('canvas')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              activeMobilePanel === 'canvas' ? 'text-signal-lime' : 'text-ash'
            }`}
          >
            <Monitor size={20} className="mb-1" />
            {t('editor.mobile.canvas', 'Canvas')}
          </button>
          <button
            onClick={() => setActiveMobilePanel('properties')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium uppercase tracking-wider transition-colors ${
              activeMobilePanel === 'properties' ? 'text-signal-lime' : 'text-ash'
            }`}
          >
            <Sliders size={20} className="mb-1" />
            {t('editor.mobile.props', 'Props')}
          </button>
        </div>
      </div>
    </div>
  )
}

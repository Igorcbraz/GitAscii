'use client'

import {
  AlertCircle,
  ArrowRight,
  FileCode2,
  Grid,
  Monitor,
  Sliders,
  Sparkles,
  Terminal,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import KineticGrid from '@/components/ui/kinetic-grid'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { generateBestProfile } from '@/engine/generate/profileAnalyzer'
import { importReadme } from '@/engine/import/readmeImporter'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'

import { useEditorStore } from '../store/editorStore'
import { SVGCanvas } from './Canvas/SVGCanvas'
import { EditorLoadingScreen, LoadStep } from './EditorLoadingScreen'
import { PropertiesPanel } from './Properties/PropertiesPanel'
import { WidgetLibrary } from './Sidebar/WidgetLibrary'
import { EditorToolbar } from './Toolbar/EditorToolbar'

interface EditorLayoutProps {
  username: string
  profileSlug?: string
  autoGenerate?: boolean
}

const INITIAL_STEPS: LoadStep[] = [
  { id: 'session', label: 'Verificando sessão', status: 'pending' },
  { id: 'github', label: 'Buscando dados do GitHub', status: 'pending' },
  { id: 'profile', label: 'Analisando perfil', status: 'pending' },
  { id: 'editor', label: 'Inicializando editor', status: 'pending' },
]

export function EditorLayout({
  username,
  profileSlug = 'default',
  autoGenerate = false,
}: EditorLayoutProps) {
  const { initEditor, config, setSession, session, activeMobilePanel, setActiveMobilePanel } =
    useEditorStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [githubData, setGithubData] = useState<NormalizedGitHubData | null>(null)

  const [steps, setSteps] = useState<LoadStep[]>(INITIAL_STEPS)

  const setStep = useCallback((id: string, status: LoadStep['status'], detail?: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, detail: detail ?? s.detail } : s))
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setSteps(INITIAL_STEPS)

        setStep('session', 'active')
        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (isMounted) {
              setSession(sessionData.session || null)
              setStep(
                'session',
                'done',
                sessionData.session ? `@${sessionData.session.username}` : 'Não autenticado'
              )
            }
          } else {
            setStep('session', 'done', 'Não autenticado')
          }
        } catch (e) {
          console.warn('Failed to fetch session', e)
          setStep('session', 'done', 'Não autenticado')
        }

        setStep('github', 'active', `api.github.com/users/${username}`)
        const res = await fetch(`/api/github/${username}`)
        if (!res.ok) {
          let errMsg = 'Failed to fetch GitHub profile'
          try {
            const errJson = await res.json()
            errMsg = errJson.error || errMsg
          } catch {
            errMsg = (await res.text()) || errMsg
          }
          setStep('github', 'error', errMsg)
          throw new Error(errMsg)
        }
        const data: NormalizedGitHubData = await res.json()
        setStep(
          'github',
          'done',
          `${data.repos?.length ?? 0} repos · ${data.user?.followers ?? 0} followers`
        )

        setStep('profile', 'active')
        let initialConfig: SavedConfiguration | null = null

        const storageKey = `gitascii_${data.user.id}_${profileSlug}`
        const savedDraft = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null

        if (savedDraft) {
          try {
            initialConfig = JSON.parse(savedDraft)
            setStep('profile', 'done', 'Rascunho salvo encontrado')
          } catch {
            initialConfig = autoGenerate ? generateBestProfile(data) : null
            setStep(
              'profile',
              'done',
              autoGenerate ? 'Gerado automaticamente' : 'Sem configuração prévia'
            )
          }
        } else if (autoGenerate) {
          initialConfig = generateBestProfile(data)
          setStep('profile', 'done', 'Perfil gerado automaticamente')
        } else {
          initialConfig = null
          setStep('profile', 'done', 'Aguardando escolha de template')
        }

        setStep('editor', 'active')
        await new Promise((r) => setTimeout(r, 260))

        if (isMounted) {
          setStep('editor', 'done', 'Pronto')
          await new Promise((r) => setTimeout(r, 180))

          if (initialConfig) {
            initEditor(initialConfig, data)
            setLoading(false)
          } else {
            setGithubData(data)
            setShowOnboarding(true)
            setLoading(false)
          }
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
  }, [username, profileSlug, autoGenerate, initEditor, setSession, setStep])

  const { t } = useI18n()

  if (loading) {
    return <EditorLoadingScreen username={username} steps={steps} />
  }

  if (showOnboarding && githubData) {
    return (
      <div className="fixed inset-0 bg-carbon overflow-hidden font-inter-tight">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <KineticGrid className="absolute inset-0 w-full h-full pointer-events-auto" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,6,0.88)_0%,rgba(6,6,6,0.55)_55%,rgba(6,6,6,0.15)_100%)] pointer-events-none" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both delay-100 mb-8">
              <span className="flex items-center gap-2 font-inter-tight text-eyebrow font-medium uppercase tracking-[0.22em] text-ash">
                <Terminal size={11} className="text-signal-lime shrink-0" />[ GITASCII · NOVO PERFIL
                ]
              </span>
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-250 font-pt-serif font-light text-white text-4xl md:text-[52px] leading-heading tracking-[-1.2px] text-center mb-4">
              Como deseja <span className="italic text-signal-lime">começar,</span>{' '}
              <span className="text-white/80">@{username}?</span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-350 font-inter-tight text-body leading-body text-ash text-center max-w-md mb-10">
              Escolha como montar seu README. Você poderá personalizar tudo depois.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-500 flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const config = importReadme(githubData)
                  initEditor(config, githubData)
                  setShowOnboarding(false)
                }}
                className="group relative w-full flex items-center gap-5 px-6 py-5 bg-signal-lime text-black rounded-sm shadow-[0_0_20px_rgba(197,255,74,0.3)] hover:shadow-[0_0_32px_rgba(197,255,74,0.55)] hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer text-left"
              >
                <div className="shrink-0 w-10 h-10 bg-black/15 rounded-sm flex items-center justify-center">
                  <FileCode2 size={20} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-inter-tight font-semibold text-body leading-tight tracking-[0.01em] mb-0.5">
                    Importar do meu README atual
                  </div>
                  <div className="font-inter-tight text-note text-black/60 leading-snug">
                    Lê seu README do GitHub e converte para o editor
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-black/50 group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>

              <button
                onClick={() => {
                  const config = generateBestProfile(githubData)
                  initEditor(config, githubData)
                  setShowOnboarding(false)
                }}
                className="group relative w-full flex items-center gap-5 px-6 py-5 bg-onyx border border-graphite hover:border-signal-lime/40 hover:bg-iron rounded-sm transition-all duration-300 cursor-pointer text-left"
              >
                <div className="shrink-0 w-10 h-10 bg-graphite rounded-sm flex items-center justify-center group-hover:bg-signal-lime/10 transition-colors duration-300">
                  <Sparkles
                    size={20}
                    className="text-ash group-hover:text-signal-lime transition-colors duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-inter-tight font-semibold text-body text-white leading-tight tracking-[0.01em] mb-0.5">
                    Começar com um Template
                  </div>
                  <div className="font-inter-tight text-note text-ash leading-snug">
                    Layouts prontos pensados para diferentes tipos de perfil
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-fog group-hover:text-signal-lime group-hover:translate-x-1 transition-all duration-300"
                />
              </button>

              <button
                onClick={() => {
                  const config = createConfiguration(
                    githubData.user.id,
                    githubData.user.login,
                    'blank',
                    profileSlug,
                    profileSlug === 'default' ? 'Default' : profileSlug.toUpperCase()
                  )
                  initEditor(config, githubData)
                  setShowOnboarding(false)
                }}
                className="group relative w-full flex items-center gap-5 px-6 py-4 bg-void-black border border-graphite/60 hover:border-graphite rounded-sm transition-all duration-300 cursor-pointer text-left"
              >
                <div className="shrink-0 w-10 h-10 bg-onyx rounded-sm flex items-center justify-center">
                  <Monitor
                    size={20}
                    className="text-fog group-hover:text-ash transition-colors duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-inter-tight font-medium text-body text-ash group-hover:text-white leading-tight tracking-[0.01em] mb-0.5 transition-colors duration-300">
                    Começar do Zero
                  </div>
                  <div className="font-inter-tight text-note text-fog leading-snug">
                    Canvas vazio — total liberdade criativa
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-fog/40 group-hover:text-fog group-hover:translate-x-1 transition-all duration-300"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)] z-20" />
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
            className={`flex-1 flex flex-col items-center justify-center py-2 text-caption font-medium uppercase tracking-wider transition-colors ${
              activeMobilePanel === 'widgets' ? 'text-signal-lime' : 'text-ash'
            }`}
          >
            <Grid size={20} className="mb-1" />
            {t('editor.mobile.widgets', 'Widgets')}
          </button>
          <button
            onClick={() => setActiveMobilePanel('canvas')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-caption font-medium uppercase tracking-wider transition-colors ${
              activeMobilePanel === 'canvas' ? 'text-signal-lime' : 'text-ash'
            }`}
          >
            <Monitor size={20} className="mb-1" />
            {t('editor.mobile.canvas', 'Canvas')}
          </button>
          <button
            onClick={() => setActiveMobilePanel('properties')}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-caption font-medium uppercase tracking-wider transition-colors ${
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

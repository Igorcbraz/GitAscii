'use client'

import { AlertCircle, ArrowRight, Grid, Monitor, Sliders, Sparkles, Terminal } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import KineticGrid from '@/components/ui/kinetic-grid'
import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { generateBestProfile } from '@/engine/generate/profileAnalyzer'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { safeStorage } from '@/utils/storage'

import { useEditorStore } from '../store/editorStore'
import { calculateFitZoom, getCanvasContainerWidth } from '../utils/canvasZoom'
import { CanvasStatusBar } from './Canvas/CanvasStatusBar'
import { SVGCanvas } from './Canvas/SVGCanvas'
import { EditorLoadingScreen, LoadStep } from './EditorLoadingScreen'
import { ProfileErrorScreen } from './ProfileErrorScreen'
import { PropertiesPanel } from './Properties/PropertiesPanel'
import { WidgetLibrary } from './Sidebar/WidgetLibrary'
import { EditorToolbar } from './Toolbar/EditorToolbar'
import { EditorTour } from './Tour/EditorTour'

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
  const { t } = useI18n()
  const initEditor = useEditorStore((state) => state.initEditor)
  const hasConfig = useEditorStore((state) => Boolean(state.config))
  const setSession = useEditorStore((state) => state.setSession)
  const session = useEditorStore((state) => state.session)
  const activeMobilePanel = useEditorStore((state) => state.activeMobilePanel)
  const setActiveMobilePanel = useEditorStore((state) => state.setActiveMobilePanel)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [githubData, setGithubData] = useState<NormalizedGitHubData | null>(null)

  const initialSteps: LoadStep[] = [
    {
      id: 'session',
      label: t('editor.loading.step_session', 'Verificando sessão'),
      status: 'pending',
    },
    {
      id: 'github',
      label: t('editor.loading.step_github', 'Buscando dados do GitHub'),
      status: 'pending',
    },
    {
      id: 'profile',
      label: t('editor.loading.step_profile', 'Analisando perfil'),
      status: 'pending',
    },
    {
      id: 'editor',
      label: t('editor.loading.step_editor', 'Inicializando editor'),
      status: 'pending',
    },
  ]

  const [steps, setSteps] = useState<LoadStep[]>(initialSteps)

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
        setSteps([
          {
            id: 'session',
            label: t('editor.loading.step_session', 'Verificando sessão'),
            status: 'pending',
          },
          {
            id: 'github',
            label: t('editor.loading.step_github', 'Buscando dados do GitHub'),
            status: 'pending',
          },
          {
            id: 'profile',
            label: t('editor.loading.step_profile', 'Analisando perfil'),
            status: 'pending',
          },
          {
            id: 'editor',
            label: t('editor.loading.step_editor', 'Inicializando editor'),
            status: 'pending',
          },
        ])

        setStep('session', 'active')
        try {
          const sessionRes = await fetch(API_ENDPOINTS.AUTH.SESSION)
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (isMounted) {
              setSession(sessionData.session || null)
              setStep(
                'session',
                'done',
                sessionData.session
                  ? `@${sessionData.session.username}`
                  : t('editor.loading.unauthenticated', 'Não autenticado')
              )
            }
          } else {
            setStep('session', 'done', t('editor.loading.unauthenticated', 'Não autenticado'))
          }
        } catch (e) {
          console.warn('Failed to fetch session', e)
          setStep('session', 'done', t('editor.loading.unauthenticated', 'Não autenticado'))
        }

        setStep('github', 'active', `api.github.com/users/${username}`)
        const res = await fetch(API_ENDPOINTS.GITHUB.PROFILE(username))
        let data: NormalizedGitHubData | null = null
        const resContentType = res.headers.get('content-type') || ''

        if (res.ok && resContentType.includes('application/json')) {
          try {
            data = await res.json()
          } catch {
            data = null
          }
        }

        if (!data || !data.user) {
          let errMsg = t('errors.fetch_profile_failed', 'Failed to fetch GitHub profile')
          try {
            const errText = await res.text()
            try {
              const errJson = JSON.parse(errText)
              if (errJson && typeof errJson.error === 'string') {
                errMsg = errJson.error
              }
            } catch {
              if (errText && !errText.trim().startsWith('<') && errText.length < 200) {
                errMsg = errText.trim()
              }
            }
          } catch (textErr) {
            console.debug('Failed to read error response text:', textErr)
          }

          const notFoundStatus =
            res.status === 404 ||
            errMsg.toLowerCase().includes('not found') ||
            errMsg.toLowerCase().includes('não encontrado')

          if (isMounted) {
            setIsNotFound(notFoundStatus)
            setStep('github', 'error', errMsg)
          }
          throw new Error(errMsg)
        }

        setStep(
          'github',
          'done',
          `${data.repos?.length ?? 0} repos · ${data.user?.followers ?? 0} followers`
        )

        setStep('profile', 'active')
        let initialConfig: SavedConfiguration | null = null

        const storageKey = `gitascii_${data.user.id}_${profileSlug}`
        const savedDraft = safeStorage.getItem(storageKey)

        let serverConfig: SavedConfiguration | null = null
        try {
          const configRes = await fetch(API_ENDPOINTS.CONFIG.GET(username, profileSlug))
          const contentType = configRes.headers.get('content-type') || ''
          if (configRes.ok && contentType.includes('application/json')) {
            serverConfig = await configRes.json()
          }
        } catch (e) {
          console.warn('Failed to fetch server config', e)
        }

        if (savedDraft) {
          try {
            initialConfig = JSON.parse(savedDraft)
            setStep('profile', 'done', t('editor.loading.draft_found', 'Rascunho salvo encontrado'))
          } catch {
            initialConfig = serverConfig || (autoGenerate ? generateBestProfile(data) : null)
            setStep(
              'profile',
              'done',
              serverConfig
                ? t('editor.loading.config_loaded', 'Configuração carregada')
                : autoGenerate
                  ? t('editor.loading.auto_generated', 'Gerado automaticamente')
                  : t('editor.loading.no_prev_config', 'Sem configuração prévia')
            )
          }
        } else if (serverConfig) {
          initialConfig = serverConfig
          setStep(
            'profile',
            'done',
            t('editor.loading.repo_loaded', 'Perfil carregado do repositório')
          )
        } else if (autoGenerate) {
          initialConfig = generateBestProfile(data)
          setStep(
            'profile',
            'done',
            t('editor.loading.profile_auto_generated', 'Perfil gerado automaticamente')
          )
        } else {
          initialConfig = null
          setStep(
            'profile',
            'done',
            t('editor.loading.waiting_template', 'Aguardando escolha de template')
          )
        }

        setStep('editor', 'active')
        await new Promise((r) => setTimeout(r, 260))

        if (isMounted) {
          setStep('editor', 'done', t('editor.loading.ready', 'Pronto'))
          await new Promise((r) => setTimeout(r, 180))

          if (initialConfig) {
            initEditor(initialConfig, data)
            setLoading(false)
          } else {
            setGithubData(data)
            setShowOnboarding(true)
            setLoading(false)
          }
          if (typeof window !== 'undefined') {
            const availableW = getCanvasContainerWidth()
            const optimalZoom = calculateFitZoom(availableW)
            useEditorStore.getState().setZoom(optimalZoom)
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : t('errors.fetch_profile_failed', 'Failed to load profile')
          )
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [username, profileSlug, autoGenerate, reloadKey, initEditor, setSession, setStep, t])

  const handleStartBlank = useCallback(() => {
    const fallbackData: NormalizedGitHubData = {
      user: {
        id: 0,
        login: username,
        name: username,
        avatar_url: `https://github.com/${username}.png`,
        bio: '',
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location: null,
        company: null,
        blog: null,
        twitter_username: null,
      },
      repos: [],
      languages: {},
      totalStars: 0,
      totalForks: 0,
    }

    const blankConfig = createConfiguration(
      0,
      username,
      'blank',
      profileSlug,
      profileSlug === 'default' ? 'Default' : profileSlug.toUpperCase(),
      fallbackData
    )

    initEditor(blankConfig, fallbackData)
    setError(null)
    setIsNotFound(false)
    setShowOnboarding(false)
  }, [username, profileSlug, initEditor])

  useEffect(() => {
    const handleZoomKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault()
        const store = useEditorStore.getState()
        if (e.key === '=' || e.key === '+') {
          store.setZoom(Math.min(1.5, store.zoom + 0.1))
        } else if (e.key === '-') {
          store.setZoom(Math.max(0.5, store.zoom - 0.1))
        }
      }
    }

    const handleZoomWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const store = useEditorStore.getState()
        // e.deltaY < 0 means scroll up (zoom in), e.deltaY > 0 means scroll down (zoom out)
        if (e.deltaY < 0) {
          store.setZoom(Math.min(1.5, store.zoom + 0.1))
        } else if (e.deltaY > 0) {
          store.setZoom(Math.max(0.5, store.zoom - 0.1))
        }
      }
    }

    window.addEventListener('keydown', handleZoomKeyboard, { capture: true, passive: false })
    window.addEventListener('wheel', handleZoomWheel, { capture: true, passive: false })

    return () => {
      window.removeEventListener('keydown', handleZoomKeyboard, { capture: true } as any)
      window.removeEventListener('wheel', handleZoomWheel, { capture: true } as any)
    }
  }, [])

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
                <Terminal size={11} className="text-signal-lime shrink-0" />
                {t('editor.onboarding.eyebrow', '[ GITASCII · NOVO PERFIL ]')}
              </span>
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-250 font-inter-tight font-light text-white text-4xl md:text-[52px] leading-heading tracking-[-1.2px] text-center mb-4">
              {t('editor.onboarding.title_prefix', 'Como deseja ')}
              <span className="italic text-signal-lime">
                {t('editor.onboarding.title_italic', 'começar,')}
              </span>{' '}
              <span className="text-white/80">@{username}?</span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-350 font-inter-tight text-body leading-body text-ash text-center max-w-md mb-10">
              {t(
                'editor.onboarding.subtitle',
                'Escolha como montar seu README. Você poderá personalizar tudo depois.'
              )}
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-500 flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const config = generateBestProfile(githubData)
                  initEditor(config, githubData)
                  setShowOnboarding(false)
                }}
                className="group relative w-full flex items-center gap-5 px-6 py-5 bg-signal-lime text-black rounded-sm shadow-[0_0_20px_rgba(197,255,74,0.3)] hover:shadow-[0_0_32px_rgba(197,255,74,0.55)] hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer text-left"
              >
                <div className="shrink-0 w-10 h-10 bg-black/15 rounded-sm flex items-center justify-center">
                  <Sparkles size={20} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-inter-tight font-semibold text-body leading-tight tracking-[0.01em] mb-0.5">
                    {t('editor.onboarding.start_template_title', 'Começar com um Template')}
                  </div>
                  <div className="font-inter-tight text-note text-black/60 leading-snug">
                    {t(
                      'editor.onboarding.start_template_desc',
                      'Layouts prontos pensados para diferentes tipos de perfil'
                    )}
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-black/50 group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>

              <button
                onClick={() => {
                  const config = createConfiguration(
                    githubData.user.id,
                    githubData.user.login,
                    'blank',
                    profileSlug,
                    profileSlug === 'default' ? 'Default' : profileSlug.toUpperCase(),
                    githubData
                  )
                  initEditor(config, githubData)
                  setShowOnboarding(false)
                }}
                className="group relative w-full flex items-center gap-5 px-6 py-5 bg-onyx border border-graphite hover:border-signal-lime/40 hover:bg-iron rounded-sm transition-all duration-300 cursor-pointer text-left"
              >
                <div className="shrink-0 w-10 h-10 bg-graphite rounded-sm flex items-center justify-center group-hover:bg-signal-lime/10 transition-colors duration-300">
                  <Monitor
                    size={20}
                    className="text-ash group-hover:text-signal-lime transition-colors duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-inter-tight font-semibold text-body text-white leading-tight tracking-[0.01em] mb-0.5">
                    {t('editor.onboarding.start_blank_title', 'Começar do Zero')}
                  </div>
                  <div className="font-inter-tight text-note text-ash leading-snug">
                    {t(
                      'editor.onboarding.start_blank_desc',
                      'Canvas vazio — total liberdade criativa'
                    )}
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-fog group-hover:text-signal-lime group-hover:translate-x-1 transition-all duration-300"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-signal-lime shadow-[0_0_15px_rgba(197,255,74,0.5)] z-20" />
      </div>
    )
  }

  if (error || (!hasConfig && !showOnboarding)) {
    return (
      <ProfileErrorScreen
        username={username}
        errorMessage={error}
        isNotFound={isNotFound}
        onRetry={() => {
          setError(null)
          setIsNotFound(false)
          setReloadKey((k) => k + 1)
        }}
        onStartBlank={handleStartBlank}
      />
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
                  {t('editor.banner.logged_in_as_prefix', 'Você está logado como')}{' '}
                  <strong className="text-white">@{session.username}</strong>
                  {t('editor.banner.logged_in_as_middle', ', mas editando o perfil de')}{' '}
                  <strong className="text-white">@{username}</strong>
                  {t(
                    'editor.banner.logged_in_as_suffix',
                    '. Suas alterações não serão salvas no servidor.'
                  )}
                </>
              ) : (
                <>
                  <span className="text-signal-lime font-semibold uppercase tracking-wider mr-1">
                    {t('editor.guest_banner.badge', '[ MODO VISITANTE ]')}
                  </span>
                  <span className="text-pearl">
                    {t(
                      'editor.guest_banner.message',
                      'Você pode exportar manualmente ou conectar sua conta para sincronizar seu README do GitHub automaticamente em 1 clique.'
                    )}
                  </span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!session && (
              <button
                onClick={() => {
                  window.location.href = API_ENDPOINTS.AUTH.LOGIN(`/${username}`)
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-signal-lime text-black font-bold text-caption uppercase tracking-wider glow-lime hover:brightness-110 cursor-pointer transition-all"
              >
                <span>{t('editor.guest_banner.btn_connect', 'Conectar GitHub')}</span>
              </button>
            )}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openExportGuide'))}
              className="flex items-center gap-1 text-caption text-ash hover:text-white transition-colors cursor-pointer"
            >
              {t('editor.banner.view_tutorial', 'Ver Tutorial')}
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
            className={`${activeMobilePanel === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 h-full relative overflow-hidden`}
          >
            <SVGCanvas />
            <CanvasStatusBar />
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
      <EditorTour />
    </div>
  )
}

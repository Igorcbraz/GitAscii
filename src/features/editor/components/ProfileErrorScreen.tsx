'use client'

import {
  AlertCircle,
  ArrowRight,
  Compass,
  FileCode2,
  Home,
  RefreshCw,
  Search,
  Sparkles,
  UserX,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import KineticGrid from '@/components/ui/kinetic-grid'
import { useI18n } from '@/i18n'

interface ProfileErrorScreenProps {
  username: string
  errorMessage?: string | null
  isNotFound?: boolean
  onRetry?: () => void
  onStartBlank?: () => void
}

const POPULAR_PROFILES = ['torvalds', 'shadcn', 'leerob', 'igorcbraz', 'antfu']

export function ProfileErrorScreen({
  username,
  errorMessage,
  isNotFound = false,
  onRetry,
  onStartBlank,
}: ProfileErrorScreenProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [isRetrying, setIsRetrying] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = searchInput.trim().replace(/^@+/, '')
    if (clean) {
      router.push(`/${clean}`)
    }
  }

  const handleRetryClick = () => {
    if (onRetry && !isRetrying) {
      setIsRetrying(true)
      onRetry()
      setTimeout(() => setIsRetrying(false), 1200)
    }
  }

  return (
    <div className="fixed inset-0 bg-carbon overflow-y-auto overflow-x-hidden font-inter-tight select-none">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <KineticGrid className="absolute inset-0 w-full h-full pointer-events-auto" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,6,0.9)_0%,rgba(6,6,6,0.6)_55%,rgba(6,6,6,0.18)_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-onyx/90 border border-graphite text-eyebrow font-medium uppercase tracking-[0.22em] text-ash shadow-inner">
              {isNotFound ? (
                <>
                  <UserX size={13} className="text-signal-lime shrink-0" />
                  {t('editor.error_screen.not_found_eyebrow', '[ 404 · PERFIL NÃO ENCONTRADO ]')}
                </>
              ) : (
                <>
                  <AlertCircle size={13} className="text-amber-400 shrink-0" />
                  {t('editor.error_screen.generic_eyebrow', '[ FALHA DE CARREGAMENTO ]')}
                </>
              )}
            </span>
          </div>

          <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-600 fill-mode-both delay-100 font-pt-serif font-light text-white text-3xl sm:text-4xl md:text-5xl leading-heading tracking-[-0.03em] mb-4">
            {isNotFound ? (
              <>
                {t('editor.error_screen.not_found_title_prefix', 'Perfil ')}
                <span className="italic text-signal-lime">@{username}</span>{' '}
                {t('editor.error_screen.not_found_title_suffix', 'não localizado.')}
              </>
            ) : (
              <>
                {t('editor.error_screen.generic_title_prefix', 'Não foi possível carregar ')}
                <span className="italic text-signal-lime">@{username}</span>.
              </>
            )}
          </h1>

          <p className="animate-in fade-in slide-in-from-bottom-5 duration-600 fill-mode-both delay-200 text-body leading-body text-bone/80 max-w-lg mb-8 font-inter-tight">
            {isNotFound
              ? t(
                  'editor.error_screen.not_found_desc',
                  'Não encontramos uma conta pública no GitHub com este identificador. Verifique a ortografia ou experimente uma das alternativas abaixo.'
                )
              : errorMessage ||
                t(
                  'editor.error_screen.generic_desc',
                  'Houve uma instabilidade momentânea na conexão com a API do GitHub. Tente novamente em alguns instantes.'
                )}
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300 w-full mb-6"
          >
            <div className="relative flex items-center bg-onyx/90 border border-graphite focus-within:border-signal-lime rounded-sm p-1.5 shadow-2xl transition-all">
              <div className="pl-3 pr-2 text-ash flex items-center gap-1 font-jetbrains-mono text-body">
                <Search size={16} className="text-ash" />
                <span className="text-signal-lime/80 font-medium">@</span>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t(
                  'editor.error_screen.search_placeholder',
                  'Digitar outro usuário do GitHub...'
                )}
                autoComplete="off"
                spellCheck="false"
                className="flex-1 bg-transparent text-white placeholder:text-fog text-body font-inter-tight outline-none px-2 py-1.5"
              />
              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="px-4 py-2 bg-signal-lime text-black font-semibold text-eyebrow uppercase tracking-wider rounded-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{t('editor.error_screen.search_btn', 'Buscar')}</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-caption text-ash font-jetbrains-mono">
              <span className="text-fog">
                {t('editor.error_screen.suggestions_label', 'Sugestões:')}
              </span>
              {POPULAR_PROFILES.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => router.push(`/${slug}`)}
                  className="px-2 py-0.5 rounded-xs bg-graphite/60 border border-slate/30 text-pearl hover:text-signal-lime hover:border-signal-lime/50 transition-colors cursor-pointer"
                >
                  @{slug}
                </button>
              ))}
            </div>
          </form>

          <div className="animate-in fade-in slide-in-from-bottom-7 duration-700 fill-mode-both delay-400 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left mb-6">
            {isNotFound && onStartBlank ? (
              <button
                type="button"
                onClick={onStartBlank}
                className="group p-4 bg-onyx/80 border border-graphite hover:border-signal-lime/50 rounded-sm transition-all duration-300 cursor-pointer flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xs bg-graphite flex items-center justify-center shrink-0 group-hover:bg-signal-lime/10 transition-colors">
                  <FileCode2
                    size={18}
                    className="text-pearl group-hover:text-signal-lime transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-body text-white flex items-center justify-between">
                    <span>{t('editor.error_screen.start_blank_title', 'Criar do Zero')}</span>
                    <ArrowRight
                      size={14}
                      className="text-fog group-hover:text-signal-lime group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <p className="text-caption text-ash mt-0.5 leading-relaxed">
                    {t(
                      'editor.error_screen.start_blank_desc',
                      'Abrir o editor com um canvas vazio para montar manualmente.'
                    )}
                  </p>
                </div>
              </button>
            ) : onRetry ? (
              <button
                type="button"
                onClick={handleRetryClick}
                disabled={isRetrying}
                className="group p-4 bg-signal-lime text-black rounded-sm shadow-[0_0_20px_rgba(197,255,74,0.25)] hover:shadow-[0_0_30px_rgba(197,255,74,0.45)] hover:brightness-105 transition-all duration-300 cursor-pointer flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xs bg-black/10 flex items-center justify-center shrink-0">
                  <RefreshCw
                    size={18}
                    className={`text-black ${isRetrying ? 'animate-spin' : ''}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-body text-black flex items-center justify-between">
                    <span>
                      {isRetrying
                        ? t('editor.error_screen.retrying', 'Recarregando...')
                        : t('editor.error_screen.retry_title', 'Tentar Novamente')}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-black/60 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                  <p className="text-caption text-black/70 mt-0.5 leading-relaxed">
                    {t(
                      'editor.error_screen.retry_desc',
                      'Reconectar à API do GitHub e tentar buscar os dados do perfil.'
                    )}
                  </p>
                </div>
              </button>
            ) : null}

            <Link
              href="/explore"
              className="group p-4 bg-onyx/80 border border-graphite hover:border-signal-lime/50 rounded-sm transition-all duration-300 flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xs bg-graphite flex items-center justify-center shrink-0 group-hover:bg-signal-lime/10 transition-colors">
                <Compass
                  size={18}
                  className="text-pearl group-hover:text-signal-lime transition-colors"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-body text-white flex items-center justify-between">
                  <span>{t('editor.error_screen.explore_title', 'Explorar Galeria')}</span>
                  <ArrowRight
                    size={14}
                    className="text-fog group-hover:text-signal-lime group-hover:translate-x-1 transition-all"
                  />
                </div>
                <p className="text-caption text-ash mt-0.5 leading-relaxed">
                  {t(
                    'editor.error_screen.explore_desc',
                    'Veja perfis e READMEs criados por outros desenvolvedores.'
                  )}
                </p>
              </div>
            </Link>
          </div>

          <div className="animate-in fade-in duration-700 delay-500 flex items-center gap-4 text-note text-ash font-inter-tight">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-ash hover:text-white transition-colors"
            >
              <Home size={14} />
              <span>{t('editor.error_screen.return_home', 'Voltar para o Início')}</span>
            </Link>
            <span className="text-graphite">·</span>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-ash hover:text-signal-lime transition-colors"
            >
              <Sparkles size={14} />
              <span>{t('editor.error_screen.view_showcases', 'Ver Destaques')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-signal-lime shadow-[0_0_12px_rgba(197,255,74,0.4)] z-20" />
    </div>
  )
}

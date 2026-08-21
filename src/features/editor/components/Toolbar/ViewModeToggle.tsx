'use client'

import { Eye, Terminal } from 'lucide-react'
import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useI18n } from '@/i18n'

import { useViewModeStore } from '../../store/viewModeStore'

export function ViewModeToggle() {
  const { viewMode, setViewMode, showPreviewNudge, dismissPreviewNudge } = useViewModeStore()
  const { t } = useI18n()
  const id = useId()

  const isEditor = viewMode === 'gitascii'
  const isPreview = viewMode === 'github'

  const previewBtnRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const handlePreviewClick = () => {
    setViewMode('github')
    dismissPreviewNudge()
  }

  useEffect(() => {
    if (!showPreviewNudge || !isEditor || !previewBtnRef.current) return
    const update = () => {
      if (!previewBtnRef.current) return
      const rect = previewBtnRef.current.getBoundingClientRect()
      setPopupStyle({
        position: 'fixed',
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [showPreviewNudge, isEditor])

  return (
    <div
      className={`relative flex flex-col items-start ${showPreviewNudge && isEditor ? 'z-[9995]' : ''}`}
    >
      <div
        role="group"
        aria-label={t('editor.view_mode.group_aria', 'View mode')}
        className={`relative inline-flex items-center rounded-sm border h-[32px] overflow-hidden transition-all duration-300 ${
          showPreviewNudge && isEditor
            ? 'border-signal-lime/60 shadow-[0_0_18px_rgba(197,255,74,0.3)]'
            : 'border-graphite/70'
        } bg-onyx`}
        style={{ minWidth: 156 }}
      >
        <span
          aria-hidden
          className={`
            absolute top-0 h-full w-1/2 rounded-[1px] transition-transform duration-250 ease-out will-change-transform
            ${
              showPreviewNudge && isEditor
                ? 'translate-x-full bg-signal-lime'
                : isEditor
                  ? 'translate-x-0 bg-signal-lime'
                  : 'translate-x-full bg-white'
            }
          `}
        />

        <button
          id={`${id}-editor`}
          onClick={() => setViewMode('gitascii')}
          aria-pressed={isEditor}
          title={t(
            'editor.view_mode.editor_title',
            'Editor Mode — edit widgets, positions and styles'
          )}
          className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3 h-full w-1/2 font-inter-tight font-medium text-note transition-all duration-300 cursor-pointer select-none ${
            showPreviewNudge && isEditor
              ? 'text-ash hover:text-white'
              : isEditor
                ? 'text-black'
                : 'text-ash hover:text-white'
          }`}
        >
          <Terminal size={12} className="shrink-0" />
          <span>{t('editor.view_mode.editor', 'Editor')}</span>
        </button>

        <span className="relative z-10 h-4 w-px bg-graphite/60 shrink-0" />

        <button
          ref={previewBtnRef}
          id={`${id}-preview`}
          onClick={handlePreviewClick}
          aria-pressed={isPreview}
          title={t(
            'editor.view_mode.preview_title',
            'GitHub Preview — see how your profile will look on GitHub'
          )}
          className={`relative z-10 inline-flex items-center justify-center gap-1.5 px-3 h-full w-1/2 font-inter-tight font-medium text-note transition-all duration-300 cursor-pointer select-none ${
            showPreviewNudge && isEditor
              ? 'text-black font-semibold'
              : isPreview
                ? 'text-[#0d1117]'
                : 'text-ash hover:text-white'
          }`}
        >
          <Eye size={12} className="shrink-0" />
          <span>{t('editor.view_mode.preview', 'Preview')}</span>

          {showPreviewNudge && isEditor && (
            <span
              aria-hidden
              className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-black animate-ping"
            />
          )}
        </button>
      </div>

      {showPreviewNudge &&
        isEditor &&
        mounted &&
        createPortal(
          <>
            <div
              onClick={dismissPreviewNudge}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[9990] transition-opacity duration-300 animate-in fade-in"
              aria-hidden="true"
            />
            <div
              ref={popupRef}
              role="status"
              aria-live="polite"
              style={popupStyle}
              className="z-[9999] animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="flex justify-end pr-[22px]">
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                  <path d="M7 0L14 8H0L7 0Z" fill="#252525" />
                </svg>
              </div>

              <div
                className="rounded-sm border border-graphite bg-carbon shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(197,255,74,0.06)] overflow-hidden"
                style={{ minWidth: 268, maxWidth: 300 }}
              >
                <div className="px-4 py-2.5 border-b border-graphite bg-onyx/60 flex items-center gap-2">
                  <span className="text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider">
                    {t('editor.preview_nudge.badge', '[ COMMIT · CONCLUÍDO ]')}
                  </span>
                </div>

                <div className="px-4 py-4 space-y-1.5">
                  <p className="font-pt-serif font-light text-chalk text-lg leading-snug tracking-tight">
                    {t('editor.preview_nudge.title_prefix', 'Alterações')}{' '}
                    <span className="italic text-signal-lime font-pt-serif">
                      {t('editor.preview_nudge.title_highlight', 'publicadas')}
                    </span>{' '}
                    {t('editor.preview_nudge.title_suffix', 'com sucesso')}
                  </p>
                  <p className="font-inter-tight text-caption text-ash leading-snug">
                    {t('editor.preview_nudge.description_prefix', 'Clique em')}{' '}
                    <strong className="font-semibold text-pearl">
                      {t('editor.view_mode.preview', 'Preview')}
                    </strong>{' '}
                    {t(
                      'editor.preview_nudge.description_suffix',
                      'para ver como seu perfil vai aparecer no GitHub.'
                    )}
                  </p>
                </div>

                <div className="px-4 py-2.5 border-t border-graphite bg-onyx/40 flex items-center gap-1.5">
                  <Eye size={10} className="text-signal-lime shrink-0" />
                  <span className="font-inter-tight text-caption text-ash font-medium">
                    {t('editor.preview_nudge.footer_prefix', 'Clique no botão')}{' '}
                    <span className="text-signal-lime font-semibold">
                      {t('editor.view_mode.preview', 'Preview')}
                    </span>{' '}
                    {t('editor.preview_nudge.footer_suffix', 'acima para continuar')}
                  </span>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}

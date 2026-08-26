'use client'

import { ArrowRight, Sparkles, Terminal } from 'lucide-react'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'

const LazyEditorLayout = dynamic(
  () => import('@/features/editor/components/EditorLayout').then((mod) => mod.EditorLayout),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-carbon text-ash font-jetbrains-mono">
        <span className="w-6 h-6 border-2 border-signal-lime border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] uppercase tracking-widest text-pearl">
          [ Initializing Interactive Studio Sandbox... ]
        </span>
      </div>
    ),
  }
)

interface InteractiveEditorDemoProps {
  defaultUsername?: string
}

export function InteractiveEditorDemo({
  defaultUsername = 'Igorcbraz',
}: InteractiveEditorDemoProps) {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const [shouldLoadEditor, setShouldLoadEditor] = useState<boolean>(false)

  useEffect(() => {
    if (shouldLoadEditor) return

    const el = sectionRef.current
    if (!el) return

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry && (entry.isIntersecting || entry.intersectionRatio > 0)) {
            setShouldLoadEditor(true)
            observer.disconnect()
          }
        },
        {
          rootMargin: '250px 0px', // Trigger slightly ahead of viewport arrival for instant seamlessness
          threshold: 0,
        }
      )

      observer.observe(el)
      return () => observer.disconnect()
    } else {
      setShouldLoadEditor(true)
    }
  }, [shouldLoadEditor])

  const handleOpenHero = () => {
    if (typeof window !== 'undefined') {
      const input = document.getElementById('hero-username-input')
      if (input) {
        input.focus()
        input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <section
      ref={sectionRef}
      id="editor-sandbox"
      className="relative z-10 w-full bg-transparent pt-10 sm:pt-14 pb-20 md:pb-24 px-2 sm:px-4 md:px-6 lg:px-8"
      aria-label="Interactive Studio Demo"
    >
      <div className="w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-sm border border-graphite/90 bg-carbon shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col h-[880px] md:h-[940px] lg:h-[980px]"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal-lime/50 to-transparent pointer-events-none z-20" />

          <div className="relative z-10 bg-void-black/95 px-4 py-2.5 border-b border-graphite flex flex-wrap items-center justify-between gap-3 text-ash font-inter-tight select-none shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
              </div>

              <div className="h-3.5 w-px bg-graphite hidden sm:block" />

              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-signal-lime shrink-0" />
                <span className="font-jetbrains-mono text-[11px] uppercase tracking-[0.18em] text-pearl font-medium">
                  {t('landing.editor_demo.live_sandbox', '[ LIVE INTERACTIVE STUDIO SANDBOX ]')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-signal-lime/10 border border-signal-lime/30 text-signal-lime font-jetbrains-mono text-[10px] uppercase tracking-wider">
                  {shouldLoadEditor
                    ? t('landing.editor_demo.status_loaded', 'Full Engine Loaded')
                    : t('landing.editor_demo.status_idle', 'Viewport Idle Mode')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-caption text-ash font-jetbrains-mono">
                {t(
                  'landing.editor_demo.hint',
                  'Try dragging widgets, tweaking props & changing themes'
                )}
              </span>
            </div>
          </div>

          <div
            id="interactive-editor-container"
            className="interactive-editor-workspace relative z-10 flex-1 w-full h-full bg-carbon flex flex-col overflow-hidden"
          >
            {shouldLoadEditor ? (
              <LazyEditorLayout
                username={defaultUsername}
                profileSlug="default"
                autoGenerate={false}
                embedded={true}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-carbon text-ash font-jetbrains-mono select-none">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-signal-lime animate-ping" />
                  <span className="text-[13px] uppercase tracking-[0.2em] text-signal-lime font-medium">
                    {t('landing.editor_demo.standby_title', '[ STANDBY · ZERO CPU MODE ]')}
                  </span>
                </div>
                <p className="text-caption text-ash/80 text-center max-w-md mb-4">
                  {t(
                    'landing.editor_demo.standby_desc',
                    'Interactive canvas engine activates automatically as you scroll into this sandbox zone.'
                  )}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-pearl/50 border border-graphite px-3 py-1.5 bg-onyx/60">
                  <span>{t('landing.editor_demo.target_profile', 'Target profile:')}</span>
                  <span className="text-signal-lime">@{defaultUsername}</span>
                  <span>&bull;</span>
                  <span>{t('landing.editor_demo.engine_label', 'Engine: WebGL & Vector SVG')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-auto">
            <button
              onClick={handleOpenHero}
              className="group flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-onyx hover:bg-carbon border border-signal-lime/80 hover:border-signal-lime text-chalk hover:text-white rounded-full font-inter-tight font-semibold text-[13px] sm:text-[14px] tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <Sparkles size={15} className="text-signal-lime shrink-0" />
              <span className="whitespace-nowrap">
                {t('landing.editor_demo.open_with_mine', 'Open Studio with Your GitHub')}
              </span>
              <ArrowRight
                size={15}
                className="text-signal-lime group-hover:translate-x-0.5 transition-transform duration-200 shrink-0"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveEditorDemo

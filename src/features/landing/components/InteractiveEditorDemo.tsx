'use client'

import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'

import { MediaPlayer, type MediaPlayerInstance, MediaProvider } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'
import { Play, Sparkles, Terminal } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'

const LazyEditorLayout = dynamic(
  () => import('@/features/editor/components/EditorLayout').then((mod) => mod.EditorLayout),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black text-ash font-jetbrains-mono">
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
  const playerRef = useRef<MediaPlayerInstance>(null)

  const [shouldLoadEditor, setShouldLoadEditor] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'video' | 'demo'>('video')
  const [hasPlayed, setHasPlayed] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(false)
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (activeView !== 'video' && playerRef.current) {
      playerRef.current.pause().catch(() => {})
    }
  }, [activeView])

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
          rootMargin: '250px 0px',
          threshold: 0,
        }
      )

      observer.observe(el)
      return () => observer.disconnect()
    } else {
      setShouldLoadEditor(true)
    }
  }, [shouldLoadEditor])

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    }
  }, [])

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current)
    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2500)
  }, [])

  const handleCustomPlay = useCallback(() => {
    setHasPlayed(true)
    setShowControls(true)
    playerRef.current?.play().catch(() => {})
    scheduleHideControls()
  }, [scheduleHideControls])

  const handleVideoInteraction = useCallback(() => {
    if (!hasPlayed) return
    setShowControls(true)
    scheduleHideControls()
  }, [hasPlayed, scheduleHideControls])

  return (
    <section
      ref={sectionRef}
      id="editor-sandbox"
      className="relative z-10 w-full bg-black pb-20 md:pb-24 px-2 sm:px-4 md:px-6 lg:px-8"
      aria-label="Interactive Studio Demo"
    >
      <div className="w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-2xl flex flex-col h-[880px] md:h-[940px] lg:h-[980px] border border-white/[0.08]"
          style={{
            background: 'rgba(8, 8, 8, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 0 rgba(197,255,74,0.18)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal-lime/50 to-transparent pointer-events-none z-20" />

          <div className="relative flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden">
            <div className="relative z-10 bg-black/50 px-4 py-2.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-ash font-inter-tight select-none shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 border border-[#e0443e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 border border-[#dea123]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 border border-[#1aab29]" />
                </div>

                <div className="h-3.5 w-px bg-white/10 hidden sm:block" />

                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-signal-lime shrink-0" />
                  <span className="font-jetbrains-mono text-[11px] uppercase tracking-[0.18em] text-pearl font-medium">
                    {activeView === 'video'
                      ? t('landing.editor_demo.title_video', '[ PRESENTATION · GITASCII OVERVIEW ]')
                      : t(
                          'landing.editor_demo.live_sandbox',
                          '[ LIVE INTERACTIVE STUDIO SANDBOX ]'
                        )}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-signal-lime/10 border border-signal-lime/30 text-signal-lime font-jetbrains-mono text-[10px] uppercase tracking-wider">
                    {activeView === 'video'
                      ? t('landing.editor_demo.status_video', 'Video Preview')
                      : shouldLoadEditor
                        ? t('landing.editor_demo.status_loaded', 'Full Engine Loaded')
                        : t('landing.editor_demo.status_idle', 'Viewport Idle Mode')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-caption text-ash/50 font-jetbrains-mono">
                  {activeView === 'video'
                    ? t(
                        'landing.editor_demo.hint_video',
                        'Switch to Live Demo to interact with the studio'
                      )
                    : t(
                        'landing.editor_demo.hint',
                        'Try dragging widgets, tweaking props & changing themes'
                      )}
                </span>
              </div>
            </div>

            <div
              id="interactive-editor-container"
              className="interactive-editor-workspace relative z-10 flex-1 w-full h-full flex flex-col overflow-hidden"
            >
              {activeView === 'video' ? (
                <div
                  className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
                  onMouseMove={handleVideoInteraction}
                  onClick={handleVideoInteraction}
                >
                  <MediaPlayer
                    ref={playerRef}
                    title={t('landing.editor_demo.title_video', 'GitAscii Overview')}
                    src="/presentation.mp4"
                    playsInline
                    preload="metadata"
                    className={`w-full h-full object-contain ${
                      !hasPlayed || !showControls
                        ? '[&_.vds-controls]:!opacity-0 [&_.vds-controls]:!pointer-events-none'
                        : ''
                    }`}
                  >
                    <MediaProvider />
                    <DefaultVideoLayout
                      icons={defaultLayoutIcons}
                      slots={{
                        airPlayButton: null,
                        googleCastButton: null,
                        pipButton: null,
                        settingsMenu: null,
                      }}
                    />
                  </MediaPlayer>

                  <AnimatePresence>
                    {!hasPlayed && (
                      <motion.button
                        key="custom-play-btn"
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        onClick={handleCustomPlay}
                        aria-label={t(
                          'landing.editor_demo.play_aria',
                          'Play GitAscii presentation video'
                        )}
                        className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group"
                        style={{ background: 'transparent' }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="relative flex items-center gap-4 px-7 py-4 rounded-full"
                          style={{
                            background: 'rgba(8, 8, 8, 0.82)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(197,255,74,0.35)',
                            boxShadow:
                              '0 0 0 1px rgba(197,255,74,0.12), 0 8px 40px rgba(0,0,0,0.8), 0 0 60px rgba(197,255,74,0.08)',
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                              background:
                                'radial-gradient(ellipse at center, rgba(197,255,74,0.07) 0%, transparent 70%)',
                            }}
                          />

                          <div
                            className="relative flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                            style={{
                              background: 'rgba(197,255,74,0.15)',
                              border: '1px solid rgba(197,255,74,0.4)',
                            }}
                          >
                            <Play size={18} className="text-signal-lime fill-signal-lime ml-0.5" />
                          </div>

                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="font-inter-tight text-[15px] sm:text-base font-semibold text-pearl leading-tight">
                              {t('landing.editor_demo.play_cta', 'Watch the Full Demo')}
                            </span>
                            <span className="font-jetbrains-mono text-[10px] uppercase tracking-[0.18em] text-signal-lime/80">
                              {t(
                                'landing.editor_demo.play_subtitle',
                                '[ GitAscii · 40s overview ]'
                              )}
                            </span>
                          </div>
                        </motion.div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ) : shouldLoadEditor ? (
                <LazyEditorLayout
                  username={defaultUsername}
                  profileSlug="default"
                  autoGenerate={false}
                  embedded={true}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/30 text-ash font-jetbrains-mono select-none">
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
                  <div className="flex items-center gap-2 text-[11px] text-pearl/50 border border-white/10 px-3 py-1.5 bg-white/5">
                    <span>{t('landing.editor_demo.target_profile', 'Target profile:')}</span>
                    <span className="text-signal-lime">@{defaultUsername}</span>
                    <span>&bull;</span>
                    <span>
                      {t('landing.editor_demo.engine_label', 'Engine: WebGL & Vector SVG')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-auto w-auto max-w-[94vw]">
            <div
              className="relative flex items-center p-1 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
              style={{
                background: 'rgba(8, 8, 8, 0.88)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow:
                  '0 8px 32px -4px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 0 rgba(197,255,74,0.18)',
              }}
            >
              <div
                className="absolute top-1 h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                style={{
                  width: 'calc(50% - 4px)',
                  left: activeView === 'video' ? '4px' : 'calc(50%)',
                  background: 'rgba(197,255,74,0.12)',
                  borderTop: '1px solid rgba(197,255,74,0.35)',
                  boxShadow: '0 0 14px rgba(197,255,74,0.15)',
                }}
              />

              <button
                onClick={() => setActiveView('video')}
                className={`relative z-10 flex-1 min-w-[150px] sm:min-w-[170px] flex items-center justify-center gap-2.5 px-5 sm:px-7 py-2.5 rounded-full font-inter-tight text-[11px] sm:text-label font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  activeView === 'video' ? 'text-signal-lime' : 'text-ash hover:text-pearl'
                }`}
              >
                <Play
                  size={13}
                  className={`shrink-0 transition-transform duration-200 ${
                    activeView === 'video'
                      ? 'text-signal-lime fill-signal-lime/20 scale-105'
                      : 'text-ash/60'
                  }`}
                />
                <span>{t('landing.editor_demo.toggle_video', 'Presentation')}</span>
              </button>

              <button
                onClick={() => setActiveView('demo')}
                className={`relative z-10 flex-1 min-w-[150px] sm:min-w-[170px] flex items-center justify-center gap-2.5 px-5 sm:px-7 py-2.5 rounded-full font-inter-tight text-[11px] sm:text-label font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  activeView === 'demo' ? 'text-signal-lime' : 'text-ash hover:text-pearl'
                }`}
              >
                <Sparkles
                  size={13}
                  className={`shrink-0 transition-transform duration-200 ${
                    activeView === 'demo'
                      ? 'text-signal-lime fill-signal-lime/20 scale-105'
                      : 'text-ash/60'
                  }`}
                />
                <span>{t('landing.editor_demo.toggle_demo', 'Live Demo')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveEditorDemo

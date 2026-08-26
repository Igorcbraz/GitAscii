'use client'

import { useEffect, useState } from 'react'

import KineticGrid from '@/components/ui/kinetic-grid'
import { useI18n } from '@/i18n'

export type LoadStep = {
  id: string
  label: string
  detail?: string
  status: 'pending' | 'active' | 'done' | 'error'
}

interface EditorLoadingScreenProps {
  username: string
  steps: LoadStep[]
  embedded?: boolean
}

function useTyped(text: string, speed = 28): string {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!text) return
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return displayed
}

function StepRow({ step, index }: { step: LoadStep; index: number }) {
  const isActive = step.status === 'active'
  const isDone = step.status === 'done'
  const isError = step.status === 'error'
  const isPending = step.status === 'pending'

  return (
    <div
      className="flex items-start gap-3 transition-all duration-500"
      style={{
        opacity: isPending ? 0.3 : 1,
        transform: isPending ? 'translateX(-4px)' : 'translateX(0)',
        transitionDelay: `${index * 60}ms`,
      }}
    >
      <span
        className="font-jetbrains-mono text-label leading-none mt-px shrink-0 w-4 text-center"
        style={{
          color: isDone
            ? '#c5ff4a'
            : isError
              ? '#ff6b6b'
              : isActive
                ? '#c5ff4a'
                : 'rgba(255,255,255,0.2)',
        }}
      >
        {isDone ? '✓' : isError ? '✗' : isActive ? <SpinnerGlyph /> : '·'}
      </span>

      <div className="flex-1 min-w-0">
        <span
          className="font-inter-tight text-note font-medium uppercase tracking-[0.16em] leading-none"
          style={{
            color: isDone ? '#c5ff4a' : isError ? '#ff6b6b' : isActive ? '#ffffff' : '#525252',
          }}
        >
          {step.label}
        </span>
        {step.detail && (isDone || isActive) && (
          <span
            className="block font-jetbrains-mono text-caption tracking-[0.08em] mt-0.5 truncate"
            style={{ color: isDone ? 'rgba(197,255,74,0.55)' : 'rgba(255,255,255,0.35)' }}
          >
            {step.detail}
          </span>
        )}
      </div>

      {isActive && (
        <span className="shrink-0 flex items-center self-center">
          <ActiveBar />
        </span>
      )}
    </div>
  )
}

function SpinnerGlyph() {
  const frames = ['◐', '◓', '◑', '◒']
  const [f, setF] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setF((p) => (p + 1) % frames.length), 100)
    return () => clearInterval(id)
  }, [frames.length])
  return <>{frames[f]}</>
}

function ActiveBar() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 28,
        height: 3,
        borderRadius: 2,
        background: 'linear-gradient(90deg, #c5ff4a 0%, rgba(197,255,74,0.2) 100%)',
        animation: 'loadbar-pulse 1s ease-in-out infinite',
      }}
    />
  )
}

function ScanLine() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  )
}

export function EditorLoadingScreen({
  username,
  steps,
  embedded = false,
}: EditorLoadingScreenProps) {
  const { t } = useI18n()
  const typedUser = useTyped(`@${username}`, 32)

  const doneCount = steps.filter((s) => s.status === 'done').length
  const totalSteps = steps.length
  const progressPct = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0

  return (
    <>
      <style>{`
        @keyframes loadbar-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className={`${embedded ? 'absolute inset-0 z-20' : 'fixed inset-0'} bg-carbon overflow-hidden font-inter-tight`}
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <KineticGrid className="absolute inset-0 w-full h-full pointer-events-auto" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,6,0.92)_0%,rgba(6,6,6,0.65)_55%,rgba(6,6,6,0.2)_100%)] pointer-events-none" />
        </div>

        <ScanLine />

        <div className="relative z-10 flex h-full items-center justify-center px-6">
          <div className="w-full max-w-sm" style={{ animation: 'fade-up 0.5s ease-out both' }}>
            <div
              style={{
                background: 'rgba(6,6,6,0.72)',
                border: '1px solid rgba(197,255,74,0.18)',
                borderRadius: 4,
                backdropFilter: 'blur(8px)',
                boxShadow:
                  '0 0 0 1px rgba(0,0,0,0.6), 0 24px 48px rgba(0,0,0,0.6), 0 0 40px rgba(197,255,74,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: 'rgba(18,18,18,0.9)',
                  borderBottom: '1px solid rgba(197,255,74,0.12)',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {['rgba(255,95,86,0.7)', 'rgba(255,189,46,0.7)', 'rgba(39,201,63,0.7)'].map(
                  (c, i) => (
                    <span
                      key={i}
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: c,
                        display: 'inline-block',
                      }}
                    />
                  )
                )}
                <span
                  className="font-jetbrains-mono text-caption ml-2"
                  style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}
                >
                  {t('editor.loading.header_badge', 'gitascii — loading profile')}
                </span>
              </div>

              <div style={{ padding: '20px 20px 16px' }}>
                <div
                  className="flex items-center gap-2 mb-5"
                  style={{ animation: 'fade-up 0.4s ease-out 0.1s both' }}
                >
                  <span
                    className="font-jetbrains-mono text-eyebrow"
                    style={{ color: 'rgba(197,255,74,0.6)', letterSpacing: '0.04em' }}
                  >
                    $
                  </span>
                  <span
                    className="font-jetbrains-mono text-label font-medium"
                    style={{ color: '#c5ff4a', letterSpacing: '0.04em' }}
                  >
                    {typedUser}
                    <span
                      style={{
                        display: 'inline-block',
                        width: 7,
                        height: 13,
                        background: '#c5ff4a',
                        marginLeft: 2,
                        verticalAlign: 'middle',
                        animation: 'blink-cursor 1s step-end infinite',
                      }}
                    />
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {steps.map((step, i) => (
                    <StepRow key={step.id} step={step} index={i} />
                  ))}
                </div>
              </div>

              <div
                style={{
                  height: 3,
                  background: 'rgba(255,255,255,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(90deg, rgba(197,255,74,0.6) 0%, #c5ff4a 50%, rgba(197,255,74,0.6) 100%)',
                    width: `${progressPct}%`,
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 8px rgba(197,255,74,0.8)',
                  }}
                />
              </div>
            </div>

            <p
              className="mt-4 text-center font-inter-tight text-eyebrow uppercase tracking-[0.18em]"
              style={{
                color: 'rgba(255,255,255,0.15)',
                animation: 'fade-up 0.5s ease-out 0.4s both',
              }}
            >
              {t('editor.loading.connecting_api', 'Connecting to GitHub API')}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-signal-lime shadow-[0_0_12px_rgba(197,255,74,0.5)] z-20" />
      </div>
    </>
  )
}

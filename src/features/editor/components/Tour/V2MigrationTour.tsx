'use client'

import { ArrowLeft, ArrowRight, Check, GitCommit, Move, Sparkles, X } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { useI18n } from '@/i18n'
import { safeStorage } from '@/utils/storage'

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

interface V2MigrationTourProps {
  embedded?: boolean
}

export function V2MigrationTour({ embedded = false }: V2MigrationTourProps) {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)

  const steps = useMemo(
    () => [
      {
        target: null,
        placement: 'center',
        badge: t('v2tour.step1.badge', 'NOVIDADE · GITASCII V2'),
        titlePrefix: t('v2tour.step1.title_prefix', 'O '),
        titleHighlight: t('v2tour.step1.title_highlight', 'GitAscii v2'),
        titleSuffix: t('v2tour.step1.title_suffix', ' chegou! 🚀'),
        description: t(
          'v2tour.step1.desc',
          'Reconstruímos toda a arquitetura da plataforma. Seus SVGs agora vivem diretamente em uma branch dedicada (gitascii) com carregamento instantâneo, zero latência e 100% de disponibilidade.'
        ),
        tipLabel: t('v2tour.step1.tip_label', 'Passo 1 de 3: Migração Rápida'),
        tipText: t(
          'v2tour.step1.tip_text',
          'Você não precisa esperar a fila de PRs. Migre em menos de 10 segundos seguindo os próximos 2 passos!'
        ),
        icon: Sparkles,
      },
      {
        target: '#tour-canvas-area',
        placement: 'bottom-center',
        badge: t('v2tour.step2.badge', 'PASSO 2 · AJUSTE O CANVAS'),
        titlePrefix: t('v2tour.step2.title_prefix', 'Mova ou edite '),
        titleHighlight: t('v2tour.step2.title_highlight', 'qualquer widget'),
        titleSuffix: '',
        description: t(
          'v2tour.step2.desc',
          'Para gerar a nova estrutura da v2, basta arrastar qualquer widget, alterar uma cor ou fazer um leve ajuste no canvas.'
        ),
        tipLabel: t('v2tour.step2.tip_label', 'Ação Necessária'),
        tipText: t(
          'v2tour.step2.tip_text',
          'Arraste um widget 1px para o lado ou selecione um elemento para marcar alterações pendentes.'
        ),
        icon: Move,
      },
      {
        target: '#tour-commit-button',
        placement: 'left-center',
        badge: t('v2tour.step3.badge', 'PASSO 3 · COMMIT AUTOMÁTICO'),
        titlePrefix: t('v2tour.step3.title_prefix', 'Clique em '),
        titleHighlight: t('v2tour.step3.title_highlight', 'Update README'),
        titleSuffix: '',
        description: t(
          'v2tour.step3.desc',
          'Ao clicar no botão de commit, o GitAscii criará automaticamente a branch gitascii, salvará seus SVGs Dark/Light e atualizará o README com o workflow da v2.'
        ),
        tipLabel: t('v2tour.step3.tip_label', 'Tudo Automático'),
        tipText: t(
          'v2tour.step3.tip_text',
          'Seu perfil estará 100% migrado para a v2 e pronto para receber atualizações automáticas via GitHub Actions!'
        ),
        icon: GitCommit,
      },
    ],
    [t]
  )

  const updateTargetPosition = useCallback((targetSelector: string | null) => {
    if (!targetSelector) {
      setTargetRect((prev) => (prev !== null ? null : prev))
      return
    }

    const element = document.querySelector(targetSelector)
    if (element) {
      const rect = element.getBoundingClientRect()
      setTargetRect((prev) => {
        if (
          prev &&
          Math.abs(prev.top - rect.top) < 1 &&
          Math.abs(prev.left - rect.left) < 1 &&
          Math.abs(prev.width - rect.width) < 1 &&
          Math.abs(prev.height - rect.height) < 1
        ) {
          return prev
        }
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }
      })
    } else {
      setTargetRect((prev) => (prev !== null ? null : prev))
    }
  }, [])

  useEffect(() => {
    setMounted(true)

    if (embedded) return

    const timer = setTimeout(() => {
      const hasSeenV2Tour = safeStorage.getItem('gitascii_has_seen_v2_migration_tour')
      if (!hasSeenV2Tour) {
        setIsOpen(true)
        setCurrentStep(0)
        safeStorage.setItem('gitascii_has_seen_v2_migration_tour', 'true')
      }
    }, 1200)

    const handleStartV2Tour = () => {
      setCurrentStep(0)
      setIsClosing(false)
      setIsOpen(true)
      safeStorage.setItem('gitascii_has_seen_v2_migration_tour', 'true')
    }

    window.addEventListener('gitascii:start-v2-tour', handleStartV2Tour)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('gitascii:start-v2-tour', handleStartV2Tour)
    }
  }, [embedded])

  const currentTargetSelector = isOpen ? steps[currentStep]?.target || null : null

  useEffect(() => {
    if (!isOpen || !currentTargetSelector) {
      setTargetRect(null)
      return
    }

    updateTargetPosition(currentTargetSelector)

    const element = document.querySelector(currentTargetSelector)
    if (element && !embedded) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    const handleResizeOrScroll = () => {
      updateTargetPosition(currentTargetSelector)
    }

    window.addEventListener('resize', handleResizeOrScroll)
    if (!embedded) {
      window.addEventListener('scroll', handleResizeOrScroll, true)
    }

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      if (!embedded) {
        window.removeEventListener('scroll', handleResizeOrScroll, true)
      }
    }
  }, [isOpen, currentTargetSelector, updateTargetPosition, embedded])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    safeStorage.setItem('gitascii_has_seen_v2_migration_tour', 'true')
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }, [])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleClose()
    }
  }, [currentStep, steps.length, handleClose])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        handleClose()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose, handleNext, handlePrev])

  if (!mounted || !isOpen) return null

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const StepIcon = step.icon

  const getDialogPositionClasses = () => {
    switch (step.placement) {
      case 'left-center':
        return 'top-1/2 left-4 md:left-20 lg:left-32 -translate-y-1/2'
      case 'bottom-center':
        return 'bottom-8 md:bottom-16 left-1/2 -translate-x-1/2'
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    }
  }

  const tourElements = (
    <>
      {targetRect ? (
        <svg
          className={`fixed inset-0 z-[110] pointer-events-auto w-full h-full transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        >
          <defs>
            <mask id="v2-tour-spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={Math.max(0, targetRect.left - 6)}
                y={Math.max(0, targetRect.top - 6)}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="6"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.82)"
            mask="url(#v2-tour-spotlight-mask)"
          />
        </svg>
      ) : (
        <div
          className={`fixed inset-0 z-[110] bg-black/82 backdrop-blur-xs transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />
      )}

      {targetRect && (
        <div
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
          className="fixed z-[115] pointer-events-none rounded-md border-2 border-signal-lime shadow-[0_0_28px_rgba(197,255,74,0.7)] transition-all duration-300 animate-pulse"
        >
          <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-signal-lime text-black font-jetbrains-mono font-bold text-[9px] uppercase tracking-wider rounded-xs shadow-md">
            [ FOCO DA MIGRAÇÃO V2 ]
          </div>
        </div>
      )}

      <div
        className={`fixed z-[120] ${getDialogPositionClasses()} w-full max-w-[480px] p-3 sm:p-4 transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl flex flex-col text-chalk">
          <div className="px-5 py-3.5 border-b border-graphite flex items-center justify-between bg-onyx/40">
            <div className="flex items-center gap-2">
              <span className="text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider">
                [ {step.badge} ]
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
              title={t('common.close', 'Fechar')}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-sm bg-graphite/80 border border-graphite flex items-center justify-center text-signal-lime shrink-0">
                  <StepIcon size={18} />
                </div>
                <h3 className="font-pt-serif font-light text-white text-2xl tracking-tight leading-snug">
                  {step.titlePrefix}
                  <span className="italic text-signal-lime font-pt-serif">
                    {step.titleHighlight}
                  </span>
                  {step.titleSuffix}
                </h3>
              </div>
              <p className="font-inter-tight text-note text-pearl leading-relaxed mt-2">
                {step.description}
              </p>
            </div>

            <div className="p-3.5 rounded-sm bg-onyx/80 border border-graphite flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-jetbrains-mono text-caption text-signal-lime font-semibold uppercase tracking-wider mb-1">
                  ● {step.tipLabel}
                </div>
                <div className="font-inter-tight text-note text-ash leading-relaxed">
                  {step.tipText}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentStep ? 'w-6 bg-signal-lime' : 'w-2 bg-graphite hover:bg-ash'
                  }`}
                  title={`Passo ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-graphite bg-onyx/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentStep > 0 ? (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>{t('tour.back', 'Voltar')}</span>
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
                >
                  {t('tour.skip', 'Pular')}
                </button>
              )}
            </div>

            <div className="text-caption font-jetbrains-mono text-ash font-medium tracking-wider">
              {currentStep + 1} / {steps.length}
            </div>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-note hover:brightness-110 transition-all cursor-pointer"
            >
              <span>{isLast ? t('tour.last', 'Entendi!') : t('tour.next', 'Próximo')}</span>
              {isLast ? <Check size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return createPortal(tourElements, document.body)
}

export default V2MigrationTour

'use client'

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Download,
  Layers,
  Search,
  Settings,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
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

export function EditorTour() {
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
        badge: t('tour.welcome.badge', 'GUIA · INTRODUÇÃO'),
        titlePrefix: t('tour.welcome.title_prefix', 'Bem-vindo ao '),
        titleHighlight: t('tour.welcome.title_highlight', 'GitAscii'),
        titleSuffix: t('tour.welcome.title_suffix', ' Editor'),
        description: t(
          'tour.welcome.desc',
          'Vamos fazer um tour rápido para você conhecer a plataforma e criar seu README personalizado.'
        ),
        tipLabel: t('tour.welcome.tip_label', 'Visão Geral'),
        tipText: t(
          'tour.welcome.tip_text',
          'Crie perfis impressionantes com arte ASCII, métricas dinâmicas e widgets em SVG.'
        ),
        icon: Compass,
      },
      {
        target: '#tour-global-search',
        placement: 'bottom-center',
        badge: t('tour.search.badge', 'ATALHO · NAVEGAÇÃO'),
        titlePrefix: t('tour.search.title_prefix', 'Busca '),
        titleHighlight: t('tour.search.title_highlight', 'Global & Atalhos'),
        titleSuffix: '',
        description: t(
          'tour.search.desc',
          'Use a busca para encontrar widgets, templates e ações instantaneamente no editor.'
        ),
        tipLabel: t('tour.search.tip_label', 'Atalho Rápido'),
        tipText: t(
          'tour.search.tip_text',
          'Pressione Ctrl + K (ou Cmd + K no Mac) para abrir a paleta de comandos a qualquer momento.'
        ),
        icon: Search,
      },
      {
        target: '#tour-featured-widgets',
        placement: 'right-side',
        badge: t('tour.featured.badge', 'SIDEBAR · DESTAQUES'),
        titlePrefix: t('tour.featured.title_prefix', 'Widgets em '),
        titleHighlight: t('tour.featured.title_highlight', 'Destaque'),
        titleSuffix: '',
        description: t(
          'tour.featured.desc',
          'Widgets incríveis feitos pela comunidade para destacar o seu perfil com visual moderno.'
        ),
        tipLabel: t('tour.featured.tip_label', 'Biblioteca'),
        tipText: t(
          'tour.featured.tip_text',
          'Cartões de estatísticas, troféus, gráficos de contribuição e animações prontas para uso.'
        ),
        icon: Star,
      },
      {
        target: '#tour-normal-widgets',
        placement: 'right-side',
        badge: t('tour.native.badge', 'BIBLIOTECA · COMPONENTES'),
        titlePrefix: t('tour.native.title_prefix', 'Widgets '),
        titleHighlight: t('tour.native.title_highlight', 'Nativos'),
        titleSuffix: '',
        description: t(
          'tour.native.desc',
          'Componentes padrão para montar as informações essenciais do seu perfil no GitHub.'
        ),
        tipLabel: t('tour.native.tip_label', 'Arrastar e Soltar'),
        tipText: t(
          'tour.native.tip_text',
          'Arraste biografia, links sociais, tecnologias e badges diretamente para o canvas.'
        ),
        icon: Layers,
      },
      {
        target: '#tour-properties-sidebar',
        placement: 'left-side',
        badge: t('tour.properties.badge', 'EDITOR · PROPRIEDADES'),
        titlePrefix: t('tour.properties.title_prefix', 'Edição e '),
        titleHighlight: t('tour.properties.title_highlight', 'Propriedades'),
        titleSuffix: '',
        description: t(
          'tour.properties.desc',
          'Quando você seleciona um widget no canvas, suas propriedades aparecem no painel lateral.'
        ),
        tipLabel: t('tour.properties.tip_label', 'Personalização'),
        tipText: t(
          'tour.properties.tip_text',
          'Altere cores, fontes, alinhamento, espaçamento, temas e dados dinâmicos do GitHub.'
        ),
        icon: Settings,
      },
      {
        target: '#tour-status-bar',
        placement: 'top-center',
        badge: t('tour.statusbar.badge', 'CANVAS · CONTROLES'),
        titlePrefix: t('tour.statusbar.title_prefix', 'Barra de '),
        titleHighlight: t('tour.statusbar.title_highlight', 'Status & Atalhos'),
        titleSuffix: '',
        description: t(
          'tour.statusbar.desc',
          'Aqui você controla o zoom, desfaz ações e gerencia a hierarquia das camadas do layout.'
        ),
        tipLabel: t('tour.statusbar.tip_label', 'Produtividade'),
        tipText: t(
          'tour.statusbar.desc_tip',
          'Use Ctrl+Z (Desfazer), Ctrl+C/V (Copiar/Colar), Delete e as setas para mover os widgets.'
        ),
        icon: Sparkles,
      },
      {
        target: '#tour-export-buttons',
        placement: 'left-center',
        badge: t('tour.export.badge', 'CONCLUSÃO · SALVAR'),
        titlePrefix: t('tour.export.title_prefix', 'Salvar e '),
        titleHighlight: t('tour.export.title_highlight', 'Exportar'),
        titleSuffix: '',
        description: t(
          'tour.export.desc',
          'Aqui você encontra as opções para salvar seu trabalho, exportar o layout em JSON ou atualizar o README diretamente no GitHub quando finalizar.'
        ),
        tipLabel: t('tour.export.tip_label', 'Exportação com 1 Clique'),
        tipText: t(
          'tour.export.tip_text',
          'Clique em "Update README" na barra superior para sincronizar o layout gerado diretamente com seu repositório.'
        ),
        icon: Download,
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

    const timer = setTimeout(() => {
      const hasSeenTour = safeStorage.getItem('gitascii_has_seen_tour')
      if (!hasSeenTour) {
        setIsOpen(true)
        setCurrentStep(0)
        safeStorage.setItem('gitascii_has_seen_tour', 'true')
      }
    }, 1500)

    const handleStartTourEvent = () => {
      setCurrentStep(0)
      setIsClosing(false)
      setIsOpen(true)
      safeStorage.setItem('gitascii_has_seen_tour', 'true')
    }

    window.addEventListener('gitascii:start-tour', handleStartTourEvent)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('gitascii:start-tour', handleStartTourEvent)
    }
  }, [])

  const currentTargetSelector = isOpen ? steps[currentStep]?.target || null : null

  useEffect(() => {
    if (!isOpen || !currentTargetSelector) {
      setTargetRect(null)
      return
    }

    updateTargetPosition(currentTargetSelector)

    const element = document.querySelector(currentTargetSelector)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    const handleResizeOrScroll = () => {
      updateTargetPosition(currentTargetSelector)
    }

    window.addEventListener('resize', handleResizeOrScroll)
    window.addEventListener('scroll', handleResizeOrScroll, true)

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      window.removeEventListener('scroll', handleResizeOrScroll, true)
    }
  }, [isOpen, currentTargetSelector, updateTargetPosition])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    safeStorage.setItem('gitascii_has_seen_tour', 'true')
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
      case 'right-side':
        return 'top-1/2 right-4 md:right-16 lg:right-24 -translate-y-1/2'
      case 'left-side':
        return 'top-1/2 left-4 md:left-16 lg:left-24 -translate-y-1/2'
      case 'left-center':
        return 'top-1/2 left-4 md:left-20 lg:left-32 -translate-y-1/2'
      case 'bottom-center':
        return 'bottom-8 md:bottom-16 left-1/2 -translate-x-1/2'
      case 'top-center':
        return 'top-12 md:top-20 left-1/2 -translate-x-1/2'
      case 'center':
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    }
  }

  return createPortal(
    <>
      {targetRect ? (
        <svg
          className={`fixed inset-0 z-110 pointer-events-auto w-full h-full transition-opacity duration-200 ${
            isClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        >
          <defs>
            <mask id="tour-spotlight-mask">
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
            fill="rgba(0, 0, 0, 0.78)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      ) : (
        <div
          className={`fixed inset-0 z-110 bg-black/78 backdrop-blur-xs transition-opacity duration-200 ${
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
          className="fixed z-115 pointer-events-none rounded-md border-2 border-signal-lime shadow-[0_0_24px_rgba(197,255,74,0.65)] transition-all duration-300 animate-pulse"
        >
          <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-signal-lime text-black font-jetbrains-mono font-bold text-[9px] uppercase tracking-wider rounded-xs shadow-md">
            [ FOCO DO TOUR ]
          </div>
        </div>
      )}

      <div
        className={`fixed z-120 ${getDialogPositionClasses()} w-full max-w-[480px] p-4 transition-all duration-200 ${
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
                  {t('tour.skip', 'Pular Tour')}
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
              <span>{isLast ? t('tour.last', 'Finalizar') : t('tour.next', 'Próximo')}</span>
              {isLast ? <Check size={14} /> : <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

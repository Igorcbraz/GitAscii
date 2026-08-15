'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { EXPORT_GUIDE_STEPS } from '@/constants'
import { useI18n } from '@/i18n'

interface ExportGuideModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  onDownload: () => void
  embedCode: string
}

const STEPS = EXPORT_GUIDE_STEPS

export function ExportGuideModal({
  isOpen,
  onClose,
  username,
  onDownload,
  embedCode,
}: ExportGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reCopied, setReCopied] = useState(false)
  const { t } = useI18n()

  const steps = [
    {
      ...STEPS[0],
      title: t('editor.guide.export.step1_title', 'Arquivo Baixado'),
      description: t(
        'editor.guide.export.step1_desc',
        'O arquivo JSON do seu layout foi baixado para o seu computador.'
      ),
    },
    {
      ...STEPS[1],
      title: t('editor.guide.export.step2_title', 'Adicione ao GitHub'),
      description: t(
        'editor.guide.export.step2_desc',
        'Salve este arquivo na raiz do seu repositório especial (ex: username/username) no GitHub.'
      ),
      linkLabel: t('editor.guide.export.step2_link', 'Adicionar arquivo'),
    },
    {
      ...STEPS[2],
      title: t('editor.guide.export.step3_title', 'Tudo Pronto!'),
      description: t(
        'editor.guide.export.step3_desc',
        'Nosso site renderiza automaticamente o JSON do seu repositório. Basta colar a URL da imagem no seu README.'
      ),
      linkLabel: t('editor.guide.export.step3_link', 'Editar README'),
    },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setIsClosing(false)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }, [onClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, handleClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode)
    setReCopied(true)
    setTimeout(() => setReCopied(false), 2000)
  }

  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setDontShowAgain(localStorage.getItem('gitascii_skip_export_guide') === 'true')
    }
  }, [isOpen])

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  if (!isOpen || !mounted) return null

  const step = steps[currentStep]
  const StepIcon = step.icon
  const linkUrl = step.getLinkUrl ? step.getLinkUrl(username) : ''
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div
        className={`fixed z-101 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-130 transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="bg-onyx border border-graphite rounded-lg overflow-hidden shadow-2xl">
          <div className="relative px-6 pt-5 pb-4 border-b border-graphite">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-signal-lime/10 border border-signal-lime/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-signal-lime" />
                </div>
                <div>
                  <h2 className="font-inter-tight font-semibold text-body text-chalk">
                    {t('editor.guide.export.title', 'Layout Exportado!')}
                  </h2>
                  <p className="text-caption text-ash mt-0.5">
                    {t('editor.guide.export.subtitle', 'Siga os passos para utilizar o seu layout')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-graphite text-ash hover:text-chalk transition-colors cursor-pointer"
                title={t('common.close', 'Fechar')}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-1.5 mt-4">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-iron cursor-pointer transition-colors"
                  onClick={() => setCurrentStep(idx)}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      idx < currentStep
                        ? 'bg-signal-lime w-full'
                        : idx === currentStep
                          ? 'bg-signal-lime w-full animate-pulse-glow-bar'
                          : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="px-6 py-6" key={currentStep}>
            <div className="flex items-start gap-4 animate-guide-fade-in">
              <div className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-lg bg-signal-lime/10 border border-signal-lime/25 flex items-center justify-center relative">
                  <StepIcon size={20} className="text-signal-lime" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-signal-lime text-black text-caption font-bold flex items-center justify-center font-inter-tight">
                    {currentStep + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-inter-tight font-semibold text-[15px] text-chalk mb-1.5">
                  {step.title}
                </h3>
                <p className="text-label text-pearl leading-relaxed mb-3 inline-flex items-center flex-wrap gap-1">
                  {step.description}
                </p>
                {currentStep === 2 && (
                  <div className="mt-2 bg-void-black border border-graphite rounded-md p-3 pr-10 text-note font-jetbrains-mono text-ash break-all overflow-hidden select-all relative">
                    {embedCode}
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-graphite text-ash hover:text-white transition-all cursor-pointer bg-void-black/80 backdrop-blur-sm"
                      title="Copiar"
                    >
                      {reCopied ? (
                        <Check size={14} className="text-signal-lime" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4">
                  {step.linkLabel && linkUrl && (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors"
                    >
                      <ExternalLink size={12} />
                      <span>{step.linkLabel}</span>
                    </a>
                  )}
                  {currentStep === 0 && (
                    <button
                      onClick={onDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                    >
                      <Download size={12} />
                      <span>{t('editor.guide.export.redownload', 'Baixar novamente')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5">
            <button
              onClick={() => {
                const newValue = !dontShowAgain
                setDontShowAgain(newValue)
                if (newValue) {
                  localStorage.setItem('gitascii_skip_export_guide', 'true')
                } else {
                  localStorage.removeItem('gitascii_skip_export_guide')
                }
              }}
              className="inline-flex items-center gap-2.5 text-ash hover:text-chalk transition-colors cursor-pointer select-none group"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  dontShowAgain
                    ? 'bg-signal-lime border-signal-lime text-black'
                    : 'bg-void-black border-graphite group-hover:border-ash'
                }`}
              >
                {dontShowAgain && <Check size={10} strokeWidth={3.5} />}
              </div>
              <span className="font-inter-tight font-medium text-label">
                {t('editor.guide.dont_show_again', 'Não mostrar este guia novamente')}
              </span>
            </button>
          </div>
          <div className="px-6 py-4 border-t border-graphite flex items-center justify-between">
            <div className="text-caption text-ash font-inter-tight">
              {t('common.step', 'Passo')} {currentStep + 1} {t('common.of', 'de')} {steps.length}
            </div>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>{t('common.back', 'Voltar')}</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>{t('common.next', 'Próximo')}</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <Check size={14} />
                  <span>{t('common.finish', 'Concluir')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

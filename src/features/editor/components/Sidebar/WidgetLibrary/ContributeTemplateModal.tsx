'use client'

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FolderGit2,
  GitFork,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { EXTERNAL_LINKS } from '@/constants'
import { useI18n } from '@/i18n'

interface ContributeTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onExportTemplate: (widgetCategory?: string) => void
}

export function ContributeTemplateModal({
  isOpen,
  onClose,
  onExportTemplate,
}: ContributeTemplateModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useI18n()

  const repoForkUrl = EXTERNAL_LINKS.GITHUB_FORK
  const repoFolderUrl = `${EXTERNAL_LINKS.GITHUB_REPO}/tree/main/src/data/templates`

  const steps = [
    {
      icon: Download,
      title: t('editor.guide.template.step1_title', '1. Exporte a estrutura do seu Template'),
      description: t(
        'editor.guide.template.step1_desc',
        'Clique no botão abaixo para baixar o arquivo JSON limpo. Todos os seus dados pessoais (links sociais, bio, fotos/ASCII) serão automaticamente removidos, preservando apenas a diagramação e configurações visuais.'
      ),
    },
    {
      icon: Upload,
      title: t('editor.guide.template.step2_title', '2. Adicione na pasta src/data/templates'),
      description: t(
        'editor.guide.template.step2_desc',
        'Faça um Fork do GitAscii no GitHub e faça o upload do arquivo .json baixado dentro do diretório src/data/templates/. Depois, abra um Pull Request para que todos possam usar!'
      ),
      linkLabel: t('editor.guide.template.step2_link', 'Abrir pasta no GitHub'),
      linkUrl: repoFolderUrl,
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

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1)
  }

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  if (!isOpen || !mounted) return null

  const step = steps[currentStep]
  const StepIcon = step.icon
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />
      <div
        className={`fixed z-101 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-140 max-h-[90vh] flex flex-col transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="bg-onyx border border-graphite rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="relative px-6 pt-5 pb-4 border-b border-graphite shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-signal-lime/10 border border-signal-lime/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-signal-lime" />
                </div>
                <div>
                  <h2 className="font-inter-tight font-semibold text-body text-chalk">
                    {t('editor.guide.template.title', 'Como Criar & Compartilhar um Template')}
                  </h2>
                  <p className="text-caption text-ash mt-0.5">
                    {t(
                      'editor.guide.template.subtitle',
                      'Compartilhe suas criações com a comunidade em apenas 2 passos'
                    )}
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
          <div className="px-6 py-5 overflow-y-auto flex-1" key={currentStep}>
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
                <p className="text-label text-pearl leading-relaxed mb-3">{step.description}</p>

                {currentStep === 0 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-signal-lime/10 border border-signal-lime/25 flex items-start gap-2.5">
                      <Sparkles size={16} className="text-signal-lime shrink-0 mt-0.5" />
                      <div className="text-caption text-bone leading-relaxed font-inter-tight">
                        <strong className="font-semibold text-signal-lime">
                          {t('editor.guide.template.step1_tip_title', 'Sem dados pessoais:')}
                        </strong>{' '}
                        {t(
                          'editor.guide.template.step1_tip_desc',
                          'O exportador de templates limpa referências pessoais para que novos usuários utilizem seu próprio perfil automaticamente.'
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => onExportTemplate()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>{t('editor.sidebar.export_template', 'Exportar Template')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-void-black border border-graphite flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderGit2 size={16} className="text-signal-lime shrink-0" />
                        <span className="text-caption font-jetbrains-mono text-chalk font-semibold truncate">
                          src/data/templates/[nome-do-template].json
                        </span>
                      </div>
                      <span className="text-caption font-jetbrains-mono text-ash bg-graphite/60 px-2 py-0.5 rounded shrink-0">
                        data/templates
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={repoForkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                      >
                        <GitFork size={14} />
                        <span>
                          {t('editor.guide.template.fork_repo_btn', 'Fazer Fork no GitHub')}
                        </span>
                      </a>
                      <a
                        href={repoFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>
                          {t('editor.guide.template.view_folder_btn', 'Ver Pasta de Templates')}
                        </span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-graphite flex items-center justify-between shrink-0">
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

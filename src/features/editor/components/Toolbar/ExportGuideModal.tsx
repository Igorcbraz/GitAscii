'use client'

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  GitBranch,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { useI18n } from '@/i18n'
import { generateWorkflowYaml } from '@/lib/migration/workflowGenerator'
import { API_ENDPOINTS } from '@/services/endpoints'
import { copyToClipboard } from '@/utils/clipboard'

interface ExportGuideModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  onDownload: () => void
  embedCode: string
  profileSlug?: string
  onFinished?: () => void
}

export function ExportGuideModal({
  isOpen,
  onClose,
  username,
  onDownload,
  embedCode,
  profileSlug = 'default',
  onFinished,
}: ExportGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reCopied, setReCopied] = useState(false)
  const [copiedWorkflow, setCopiedWorkflow] = useState(false)
  const { t } = useI18n()

  const fileName =
    profileSlug && profileSlug !== 'default'
      ? `gitascii_${profileSlug.toLowerCase()}.json`
      : 'gitascii.json'

  const repoName = `${username}/${username}`

  const workflowYaml = generateWorkflowYaml(username, undefined, {
    profileSlug: profileSlug !== 'default' ? profileSlug : undefined,
  })

  const steps = [
    {
      icon: Download,
      title: t('editor.guide.export.step1_title', 'Download Configuration File'),
      description: t(
        'editor.guide.export.step1_desc',
        'The configuration file contains all layout and widget structures for your profile.'
      ),
      warning: t(
        'editor.guide.export.step1_warning',
        'DO NOT rename the file. Keep it strictly as {fileName} as GitAscii looks for this exact name in your repository.'
      ).replace('{fileName}', fileName),
    },
    {
      icon: GitBranch,
      title: t('editor.guide.export.step2_title_v2', 'Upload to "gitascii" branch'),
      description: t(
        'editor.guide.export.step2_desc_v2',
        'Push or upload {fileName} to the orphan branch "gitascii" in your repository {repo}.'
      )
        .replace('{fileName}', fileName)
        .replace('{repo}', repoName),
      linkLabel: t('editor.guide.export.step2_link', 'View Repository on GitHub'),
      getLinkUrl: (user: string) => `https://github.com/${user}/${user}/tree/gitascii`,
    },
    {
      icon: FileCode,
      title: t('editor.guide.export.step3_title_v2', 'Configure GitHub Action Workflow'),
      description: t(
        'editor.guide.export.step3_desc_v2',
        'Create .github/workflows/gitascii.yml in your main branch to enable automated SVG builds.'
      ),
      linkLabel: t('editor.guide.export.step3_link_v2', 'Create workflow on GitHub'),
      getLinkUrl: (user: string) => `https://github.com/${user}/${user}/new/main?filename=.github/workflows/gitascii.yml`,
    },
    {
      icon: Sparkles,
      title: t('editor.guide.export.step4_title_v2', 'Add V2 Embed to your README.md'),
      description: t(
        'editor.guide.export.step4_desc_v2',
        'Copy the Picture + Telemetry badge snippet and paste it into your README.md:'
      ),
      linkLabel: t('editor.guide.export.step3_link', 'Edit README.md on GitHub'),
      getLinkUrl: (user: string) => API_ENDPOINTS.GITHUB.SPECIAL_REPO_EDIT_README(user),
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
      onFinished?.()
    }, 200)
  }, [onClose, onFinished])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, handleClose])

  const handleCopy = async () => {
    const success = await copyToClipboard(embedCode)
    if (success) {
      setReCopied(true)
      setTimeout(() => setReCopied(false), 2000)
    }
  }

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
                    {t('editor.guide.export.title', 'Manual Export Guide')}
                  </h2>
                  <p className="text-caption text-ash mt-0.5">
                    {t(
                      'editor.guide.export.subtitle',
                      'Follow the steps to configure your profile manually'
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-graphite text-ash hover:text-chalk transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
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
                    <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                      <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-caption text-amber-200/90 leading-relaxed font-inter-tight">
                        <strong className="font-semibold text-amber-300">
                          {t('editor.export.file_warning_title', 'DO NOT rename this file:')}
                        </strong>{' '}
                        {t(
                          'editor.export.file_warning_desc_1',
                          'Keep the file with the exact name'
                        )}{' '}
                        <code className="bg-amber-950/70 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-200 font-jetbrains-mono text-eyebrow font-semibold">
                          {fileName}
                        </code>
                        {t(
                          'editor.export.file_warning_desc_2',
                          '. GitAscii strictly looks for this file in your repository root.'
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={onDownload}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                      >
                        <Download size={14} />
                        <span>
                          {t(
                            'editor.guide.export.step1_download_btn',
                            'Download {fileName}'
                          ).replace('{fileName}', fileName)}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-md bg-void-black border border-graphite flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <GitBranch size={16} className="text-signal-lime shrink-0" />
                        <span className="text-caption font-jetbrains-mono text-chalk font-semibold truncate">
                          {repoName} (branch: gitascii)
                        </span>
                      </div>
                      <span className="text-caption font-jetbrains-mono text-signal-lime bg-signal-lime/10 px-2 py-0.5 rounded shrink-0 border border-signal-lime/20">
                        {fileName}
                      </span>
                    </div>

                    <div className="pt-1">
                      {step.linkLabel && linkUrl && (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>{step.linkLabel}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-3">
                    <div className="relative group">
                      <pre className="bg-void-black border border-graphite rounded-md p-3.5 pr-12 text-note font-jetbrains-mono text-pearl overflow-x-auto whitespace-pre leading-relaxed select-all max-h-48">
                        <code>{workflowYaml}</code>
                      </pre>
                      <button
                        onClick={async () => {
                          const ok = await copyToClipboard(workflowYaml)
                          if (ok) {
                            setCopiedWorkflow(true)
                            setTimeout(() => setCopiedWorkflow(false), 2000)
                          }
                        }}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-md hover:bg-iron text-ash hover:text-white transition-all cursor-pointer bg-onyx/90 border border-graphite/80 backdrop-blur-sm"
                        title={copiedWorkflow ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
                      >
                        {copiedWorkflow ? (
                          <Check size={14} className="text-signal-lime" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {step.linkLabel && linkUrl && (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>{step.linkLabel}</span>
                        </a>
                      )}
                      <button
                        onClick={async () => {
                          const ok = await copyToClipboard(workflowYaml)
                          if (ok) {
                            setCopiedWorkflow(true)
                            setTimeout(() => setCopiedWorkflow(false), 2000)
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                      >
                        {copiedWorkflow ? (
                          <Check size={14} className="text-signal-lime" />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>
                          {copiedWorkflow
                            ? t('common.copied', 'Copied!')
                            : t('common.copy_code', 'Copy workflow')}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="relative group">
                      <pre className="bg-void-black border border-graphite rounded-md p-3.5 pr-12 text-note font-jetbrains-mono text-pearl overflow-x-auto whitespace-pre leading-relaxed select-all">
                        <code>{embedCode}</code>
                      </pre>
                      <button
                        onClick={handleCopy}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-md hover:bg-iron text-ash hover:text-white transition-all cursor-pointer bg-onyx/90 border border-graphite/80 backdrop-blur-sm"
                        title={reCopied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
                      >
                        {reCopied ? (
                          <Check size={14} className="text-signal-lime" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-md bg-signal-lime/5 border border-signal-lime/20 flex items-center gap-2.5">
                      <Zap size={15} className="text-signal-lime shrink-0" />
                      <div className="text-caption text-pearl leading-tight font-inter-tight">
                        <strong className="font-semibold text-signal-lime">
                          {t('editor.guide.export.step3_cache_title', 'GitHub Native SVGs')}:
                        </strong>{' '}
                        {t(
                          'editor.guide.export.step3_cache_desc',
                          'Your SVGs are served directly from GitHub raw content with automatic dark/light mode switching.'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {step.linkLabel && linkUrl && (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                        >
                          <ExternalLink size={14} />
                          <span>{step.linkLabel}</span>
                        </a>
                      )}
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                      >
                        {reCopied ? (
                          <Check size={14} className="text-signal-lime" />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>
                          {reCopied
                            ? t('common.copied', 'Copied!')
                            : t('common.copy_code', 'Copy code')}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-graphite flex items-center justify-between shrink-0">
            <div className="text-caption text-ash font-inter-tight">
              {t('common.step', 'Step')} {currentStep + 1} {t('common.of', 'of')} {steps.length}
            </div>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-graphite hover:bg-iron border border-iron rounded-md text-note text-chalk font-inter-tight font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>{t('common.back', 'Back')}</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <span>{t('common.next', 'Next')}</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-signal-lime text-black rounded-md text-note font-inter-tight font-semibold glow-lime hover:brightness-110 transition-all cursor-pointer"
                >
                  <Check size={14} />
                  <span>{t('common.finish', 'Finish')}</span>
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

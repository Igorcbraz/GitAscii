'use client'

import { Check, ExternalLink, Github, Loader2, Star, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { EXTERNAL_LINKS } from '@/constants/links'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { safeStorage } from '@/utils/storage'

interface StarPromptModalProps {
  isOpen: boolean
  onClose: () => void
  source?: 'export' | 'commit'
}

const REPO_URL = EXTERNAL_LINKS.GITHUB_REPO

export function StarPromptModal({
  isOpen,
  onClose,
  source: _source = 'export',
}: StarPromptModalProps) {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isStarring, setIsStarring] = useState(false)
  const [starSuccess, setStarSuccess] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [starCount, setStarCount] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setIsStarring(false)
      setStarSuccess(false)
      setIsRedirecting(false)

      fetch(API_ENDPOINTS.GITHUB.STAR)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data?.stargazersCount === 'number') {
            setStarCount(data.stargazersCount)
          }
          if (data?.starred) {
            safeStorage.setItem('gitascii_has_starred', 'true')
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }, [onClose])

  const handleDismiss = useCallback(() => {
    safeStorage.setItem('gitascii_star_dismissed', Date.now().toString())
    handleClose()
  }, [handleClose])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, handleClose])

  const handleStar = async () => {
    setIsStarring(true)
    try {
      const res = await fetch(API_ENDPOINTS.GITHUB.STAR, {
        method: 'POST',
      })
      const data = await res.json()

      if (data?.success) {
        setStarSuccess(true)
        if (typeof starCount === 'number') {
          setStarCount(starCount + 1)
        }
        safeStorage.setItem('gitascii_has_starred', 'true')
        setTimeout(() => {
          handleClose()
        }, 2000)
      } else {
        setIsRedirecting(true)
        window.open(REPO_URL, '_blank', 'noopener,noreferrer')
        safeStorage.setItem('gitascii_has_starred', 'true')
        setTimeout(() => {
          setStarSuccess(true)
          setTimeout(() => {
            handleClose()
          }, 2000)
        }, 600)
      }
    } catch {
      setIsRedirecting(true)
      window.open(REPO_URL, '_blank', 'noopener,noreferrer')
      safeStorage.setItem('gitascii_has_starred', 'true')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } finally {
      setIsStarring(false)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-110 bg-black/80 backdrop-blur-xs transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleDismiss}
      />
      <div
        className={`fixed z-111 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] p-4 transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl flex flex-col text-chalk">
          <div className="px-5 py-3.5 border-b border-graphite flex items-center justify-between bg-onyx/40">
            <div className="flex items-center gap-2">
              <span className="text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider">
                [ GITHUB · {t('editor.star_modal.badge', 'APOIE O PROJETO')} ]
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
              title={t('common.close', 'Fechar')}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <h3 className="font-pt-serif font-light text-white text-2xl tracking-tight leading-snug">
                {t('editor.star_modal.title_prefix', 'Deixe sua ')}
                <span className="italic text-signal-lime font-pt-serif">
                  {t('editor.star_modal.title_highlight', 'estrela')}
                </span>
                {t('editor.star_modal.title_suffix', ' no GitAscii')}
              </h3>
              <p className="font-inter-tight text-note text-pearl leading-relaxed mt-1">
                {starSuccess
                  ? t(
                      'editor.star_modal.thank_you',
                      'Muito obrigado pelo apoio! Sua estrela ajuda o GitAscii a crescer.'
                    )
                  : t(
                      'editor.star_modal.desc_short',
                      'Apoie o desenvolvimento open-source e novas ferramentas deixando uma estrela no GitHub.'
                    )}
              </p>
            </div>

            <div className="p-3 rounded-sm bg-onyx/80 border border-graphite flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-sm bg-graphite flex items-center justify-center text-chalk shrink-0">
                  <Github size={16} />
                </div>
                <div className="min-w-0">
                  <div className="font-jetbrains-mono text-note text-white font-semibold truncate">
                    Igorcbraz/GitAscii
                  </div>
                  <div className="font-inter-tight text-caption text-ash truncate">
                    GitHub Profile README Generator
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-graphite/80 border border-graphite px-2.5 py-1 rounded-sm text-caption font-jetbrains-mono text-pearl shrink-0">
                <Star size={12} className="fill-signal-lime text-signal-lime" />
                <span className="font-bold text-white">
                  {typeof starCount === 'number' ? starCount.toLocaleString() : 'Star'}
                </span>
              </div>
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-graphite bg-onyx/40 flex items-center justify-between gap-3">
            {starSuccess ? (
              <div className="w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-sm bg-signal-lime/10 border border-signal-lime/30 text-signal-lime font-inter-tight font-medium text-note">
                <Check size={14} />
                <span>{t('editor.star_modal.starred_success', 'Estrela Concedida! ⭐')}</span>
              </div>
            ) : (
              <>
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
                >
                  {t('editor.star_modal.btn_later', 'Agora não')}
                </button>

                <button
                  onClick={handleStar}
                  disabled={isStarring}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-note hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isStarring ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Star size={14} className="fill-black text-black" />
                  )}
                  <span>
                    {isStarring
                      ? t('editor.star_modal.starring', 'Dando Estrela...')
                      : isRedirecting
                        ? t('editor.star_modal.opening_github', 'Abrindo GitHub...')
                        : t('editor.star_modal.btn_star', 'Dar Estrela no GitHub')}
                  </span>
                  {!isStarring && <ExternalLink size={12} className="opacity-70" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

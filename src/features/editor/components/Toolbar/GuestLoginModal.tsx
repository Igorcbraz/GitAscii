'use client'

import { ArrowRight, Github, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { GUEST_BENEFIT_ITEMS } from '@/constants/editor'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'
import { safeStorage } from '@/utils/storage'

interface GuestLoginModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export function GuestLoginModal({ isOpen, onClose, username }: GuestLoginModalProps) {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setIsConnecting(false)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    safeStorage.setItem('gitascii_guest_export_prompted', 'true')
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

  const handleLogin = () => {
    setIsConnecting(true)
    safeStorage.setItem('gitascii_guest_export_prompted', 'true')
    window.location.href = API_ENDPOINTS.AUTH.LOGIN(`/${username}`)
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-110 bg-black/80 backdrop-blur-xs transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed z-111 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] p-4 transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-carbon border border-graphite rounded-sm overflow-hidden shadow-2xl flex flex-col text-chalk">
          <div className="px-5 py-3.5 border-b border-graphite flex items-center justify-between bg-onyx/40">
            <div className="flex items-center gap-2">
              <span className="text-caption font-jetbrains-mono font-bold text-signal-lime uppercase tracking-wider">
                [ GITASCII · {t('editor.guest_modal.header_tag', 'AUTOMAÇÃO COM 1 CLIQUE')} ]
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
              <h3 className="font-pt-serif font-light text-white text-2xl tracking-tight leading-snug">
                {t('editor.guest_modal.title_prefix', 'Sincronize em ')}
                <span className="italic text-signal-lime font-pt-serif">
                  {t('editor.guest_modal.title_highlight', '1 clique')}
                </span>
                {t('editor.guest_modal.title_suffix', ' com o GitHub')}
              </h3>
            </div>

            <div className="space-y-2.5">
              {GUEST_BENEFIT_ITEMS.map((item) => {
                const ItemIcon = item.icon
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-sm bg-onyx/90 border border-graphite hover:border-signal-lime/40 transition-colors flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-sm bg-signal-lime/10 border border-signal-lime/30 flex items-center justify-center text-signal-lime shrink-0 mt-0.5">
                      <ItemIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-inter-tight font-semibold text-body text-white">
                          {t(item.titleKey, item.defaultTitle)}
                        </span>
                        <span className="text-[10px] font-jetbrains-mono text-signal-lime font-bold uppercase tracking-wider bg-signal-lime/10 px-1.5 py-0.5 rounded-xs">
                          {item.badge}
                        </span>
                      </div>
                      <div className="font-inter-tight text-note text-ash mt-0.5 leading-relaxed">
                        {t(item.descKey, item.defaultDesc)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="px-5 py-3.5 border-t border-graphite bg-onyx/40 flex items-center justify-between gap-3">
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-sm text-note font-inter-tight text-ash hover:text-white hover:bg-graphite transition-colors cursor-pointer"
            >
              {t('editor.guest_modal.btn_stay_manual', 'Continuar Manual')}
            </button>

            <button
              onClick={handleLogin}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm bg-signal-lime text-black font-inter-tight font-semibold text-note hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
            >
              {isConnecting ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Github size={14} />
              )}
              <span>{t('editor.guest_modal.btn_connect', 'Conectar com GitHub')}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

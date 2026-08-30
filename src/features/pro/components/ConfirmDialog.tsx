'use client'

import { AlertTriangle, Info, Trash2, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { useI18n } from '@/i18n'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onClose?: () => void
  onCancel?: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
  onCancel,
}) => {
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const resolvedConfirmLabel = confirmLabel || t('pro.dialog.confirm', 'Confirm')
  const resolvedCancelLabel = cancelLabel || t('pro.dialog.cancel', 'Cancel')
  const handleClose = onClose || onCancel || (() => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, handleClose])

  if (!isOpen || !mounted) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-400" />,
          iconBg: 'bg-rose-500/10 border-rose-500/20',
          btnConfirm:
            'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.25)] border-rose-500/30',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          btnConfirm:
            'bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        }
      case 'primary':
      default:
        return {
          icon: <Info className="w-5 h-5 text-[#c5ff4a]" />,
          iconBg: 'bg-[#c5ff4a]/10 border-[#c5ff4a]/20',
          btnConfirm:
            'bg-[#c5ff4a] hover:bg-[#b0f533] text-black font-semibold shadow-[0_0_15px_rgba(197,255,74,0.25)]',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl space-y-5 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${styles.iconBg} shrink-0`}>{styles.icon}</div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#a0a0a0] leading-relaxed">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/5">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {resolvedCancelLabel}
          </button>
          <button
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all border border-transparent disabled:opacity-50 cursor-pointer ${styles.btnConfirm}`}
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{t('pro.dialog.processing', 'Processing...')}</span>
              </>
            ) : (
              resolvedConfirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

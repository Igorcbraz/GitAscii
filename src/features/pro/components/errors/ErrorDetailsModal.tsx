'use client'

import { AlertCircle, CheckCircle2, Trash2, X } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { WidgetErrorRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface ErrorDetailsModalProps {
  error: WidgetErrorRecord
  onClose: () => void
  onResolve: (id: string) => void
  onDelete: (err: WidgetErrorRecord) => void
}

export const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  error,
  onClose,
  onResolve,
  onDelete,
}) => {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f0f10] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#141416]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{error.widgetName}</h3>
              <p className="text-[11px] font-mono text-[#8a8a8a]">
                /{error.profileSlug || 'default'} • ID: {error.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <span className="text-[10px] text-[#7a7a7a] uppercase block">
                {t('pro.errors.th_error_type', 'Error Type')}
              </span>
              <span className="text-rose-400 font-bold">{error.errorType}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#7a7a7a] uppercase block">
                {t('pro.errors.th_status', 'Status')}
              </span>
              <ProBadge variant={error.status === 'resolved' ? 'emerald' : 'rose'} size="sm">
                {error.status.toUpperCase()}
              </ProBadge>
            </div>
            <div>
              <span className="text-[10px] text-[#7a7a7a] uppercase block">
                {t('pro.errors.th_occurrences', 'Occurrences')}
              </span>
              <span className="text-white font-bold">{error.occurrences || 1}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#7a7a7a] uppercase block">
                {t('pro.errors.th_first_seen', 'First Seen')}
              </span>
              <span className="text-[#8a8a8a]">{new Date(error.firstSeenAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#7a7a7a] uppercase block mb-1">
              {t('pro.errors.th_message', 'Message')}
            </span>
            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-300">
              {error.message}
            </div>
          </div>

          {error.details && (
            <div>
              <span className="text-[10px] text-[#7a7a7a] uppercase block mb-1">
                {t('pro.errors.technical_details', 'Technical Details')}
              </span>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-[#c5ff4a] overflow-x-auto whitespace-pre-wrap">
                {error.details}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#141416] flex items-center justify-between">
          <button
            onClick={() => onDelete(error)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('pro.errors.delete_btn', 'Delete Record')}</span>
          </button>

          <div className="flex items-center gap-2">
            {error.status !== 'resolved' && (
              <button
                onClick={() => onResolve(error.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('pro.errors.mark_resolved', 'Mark Resolved')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {t('pro.common.close', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

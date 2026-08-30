'use client'

import { Mail, X } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProEmailLogRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface EmailDetailModalProps {
  email: ProEmailLogRecord
  onClose: () => void
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded border border-white/[0.1] bg-[#0e0e0e] shadow-2xl relative">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#c5ff4a]" />
            <h3 className="text-sm font-bold text-white">
              {t('pro.emails.log_modal_title', 'Email Dispatch Log')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#6a6a6a] hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[9px] text-[#555] uppercase tracking-widest block">
              {t('pro.emails.th_subject', 'Subject')}
            </span>
            <span className="font-semibold text-white">{email.subject}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              {
                label: t('pro.emails.modal_template', 'Template'),
                value: <span className="text-white">{email.templateName}</span>,
              },
              {
                label: t('pro.emails.modal_recipient', 'Recipient'),
                value: <span className="text-[#c5ff4a]">{email.recipientEmail}</span>,
              },
              {
                label: t('pro.emails.modal_dispatched', 'Dispatched At'),
                value: (
                  <span className="text-white">{new Date(email.sentAt).toLocaleString()}</span>
                ),
              },
              {
                label: t('pro.emails.th_status', 'Status'),
                value: (
                  <ProBadge
                    variant={
                      email.status === 'delivered' || email.status === 'sent'
                        ? 'emerald'
                        : email.status === 'simulated'
                          ? 'muted'
                          : 'rose'
                    }
                    size="sm"
                  >
                    {email.status.toUpperCase()}
                  </ProBadge>
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <span className="text-[9px] text-[#555] uppercase tracking-widest block">
                  {label}
                </span>
                {value}
              </div>
            ))}
          </div>

          <div className="space-y-1 pt-1 border-t border-white/[0.05]">
            <span className="text-[9px] text-[#555] uppercase tracking-widest block">
              {t('pro.emails.modal_reason', 'Dispatch Reason')}
            </span>
            <p className="text-white/80 leading-relaxed">{email.reason}</p>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-3 border-t border-white/[0.07]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded cursor-pointer transition-colors"
          >
            {t('pro.common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  )
}

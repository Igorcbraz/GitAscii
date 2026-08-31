'use client'

import { Mail, ShieldCheck } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { ProEmailLogRecord } from '../../types'
import { ProBadge } from '../ProBadge'
import { ProEmptyState } from '../ProEmptyState'

interface EmailLogsTableProps {
  emails: ProEmailLogRecord[]
  canSendTest: boolean
  recipientEmail: string
  isFallback: boolean
  deliveryRate: number
  sentDigestCount: number
  onSendTest: () => void
  onSelectEmail: (email: ProEmailLogRecord) => void
}

export const EmailLogsTable: React.FC<EmailLogsTableProps> = ({
  emails,
  canSendTest,
  recipientEmail,
  isFallback,
  deliveryRate,
  sentDigestCount,
  onSendTest,
  onSelectEmail,
}) => {
  const { t } = useI18n()
  const [filter, setFilter] = useState<'all' | 'digests' | 'alerts'>('all')

  const filteredEmails = emails.filter((e) => {
    if (filter === 'digests') return e.templateName.toLowerCase().includes('digest')
    if (filter === 'alerts') return !e.templateName.toLowerCase().includes('digest')
    return true
  })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
        {[
          {
            label: t('pro.emails.total_dispatched', 'Total Dispatched'),
            value: String(emails.length),
            sub: t('pro.emails.audit_log', 'Audit Log'),
            subColor: 'text-[#7a7a7a]',
          },
          {
            label: t('pro.emails.delivery_sla', 'Delivery SLA'),
            value: `${deliveryRate}%`,
            sub: t('pro.emails.resend_provider', 'Resend Provider'),
            subColor: 'text-emerald-400',
            valueColor: 'text-emerald-400',
          },
          {
            label: t('pro.emails.digest_quota', 'Digest Quota'),
            value: `${sentDigestCount} / 3`,
            sub: t('pro.emails.weekly_schedule', 'Weekly Schedule'),
            subColor: 'text-[#7a7a7a]',
            valueColor: 'text-[#c5ff4a]',
          },
          {
            label: t('pro.emails.destination_integrity', 'Destination Integrity'),
            value: isFallback
              ? t('pro.emails.fallback_label', 'Fallback')
              : t('pro.emails.verified_label', 'Verified'),
            sub: 'DKIM & SPF',
            subColor: 'text-[#7a7a7a]',
          },
        ].map(({ label, value, sub, subColor, valueColor }) => (
          <div key={label} className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
            <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
            <p className={`text-xl font-bold ${valueColor ?? 'text-white'}`}>{value}</p>
            <span className={`text-[10px] block ${subColor}`}>{sub}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 px-4 py-2.5 rounded border border-white/[0.06]">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
          <Mail className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
          <span className="text-xs font-semibold text-white">
            {t('pro.emails.active_recipient', 'Active Recipient:')}
          </span>
          <span className="font-mono text-xs text-[#c5ff4a] truncate max-w-xs">
            {recipientEmail || '—'}
          </span>
          {isFallback ? (
            <ProBadge variant="muted" size="sm">
              {t('pro.emails.github_fallback', 'GitHub Fallback')}
            </ProBadge>
          ) : (
            <ProBadge variant="emerald" size="sm">
              {t('pro.emails.verified_inbox', 'Verified Inbox')}
            </ProBadge>
          )}
          {!canSendTest && (
            <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              {t('pro.emails.quota_reached', 'Quota 3/3')}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#5a5a5a] shrink-0 hidden sm:block">
          {isFallback
            ? t(
                'pro.emails.fallback_desc',
                'No verified primary email found. Dispatching to GitHub proxy.'
              )
            : t(
                'pro.emails.verified_desc',
                'Weekly digests and failure alerts go to this address.'
              )}
        </p>
      </div>

      {emails.length === 0 ? (
        <ProEmptyState
          icon={<Mail className="w-6 h-6" />}
          title={t('pro.emails.empty_title', 'No Email Logs Recorded')}
          description={t(
            'pro.emails.empty_desc',
            'When transactional alerts, widget failure notices, or weekly digests are dispatched, they will be cataloged here with delivery timestamps.'
          )}
          actionLabel={canSendTest ? t('pro.emails.send_test_btn', 'Send Test Digest') : undefined}
          onAction={canSendTest ? onSendTest : undefined}
        />
      ) : (
        <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#c5ff4a]" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                {t('pro.emails.dispatch_history', 'Dispatch History')}
              </h3>
            </div>
            <div className="flex items-center gap-px bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
              {(
                [
                  { key: 'all', label: t('pro.emails.filter_all_short', 'ALL') },
                  { key: 'digests', label: t('pro.emails.filter_digests', 'DIGESTS') },
                  { key: 'alerts', label: t('pro.emails.filter_alerts', 'ALERTS') },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-sm transition-all cursor-pointer ${
                    filter === key
                      ? 'bg-[#c5ff4a] text-black font-semibold'
                      : 'text-[#6a6a6a] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/[0.05] text-[#555] text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">{t('pro.emails.th_event', 'Template / Event')}</th>
                  <th className="py-2.5 px-4">{t('pro.emails.th_subject', 'Subject')}</th>
                  <th className="py-2.5 px-4">{t('pro.emails.th_profile', 'Profile')}</th>
                  <th className="py-2.5 px-4">{t('pro.emails.th_status', 'Status')}</th>
                  <th className="py-2.5 px-4">{t('pro.emails.th_dispatched', 'Dispatched')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEmails.map((email) => {
                  const isDigest = email.templateName.toLowerCase().includes('digest')
                  return (
                    <tr
                      key={email.id}
                      onClick={() => onSelectEmail(email)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isDigest ? 'bg-[#c5ff4a]' : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-semibold text-white">{email.templateName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-[#8a8a8a] max-w-xs truncate">
                        {email.subject}
                      </td>
                      <td className="py-2.5 px-4 text-[#c5ff4a]">
                        /{email.relatedProfile || 'default'}
                      </td>
                      <td className="py-2.5 px-4">
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
                      </td>
                      <td className="py-2.5 px-4 text-[#6a6a6a] whitespace-nowrap">
                        {new Date(email.sentAt).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex items-center gap-2 pb-2">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <p className="text-[11px] text-[#5a5a5a]">
          <strong className="text-[#7a7a7a]">
            {t('pro.emails.resend_sla_title', 'Resend SLA & Delivery:')}
          </strong>{' '}
          {t(
            'pro.emails.resend_sla_desc',
            'Idempotency keys, bounce suppression, and RFC 1-click unsubscribe enforced.'
          )}
        </p>
      </div>
    </div>
  )
}

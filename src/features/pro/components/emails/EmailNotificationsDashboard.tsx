'use client'

import { Inbox, Mail, RefreshCw, Send, ShieldCheck, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProEmailLogRecord } from '../../types'
import { ProBadge } from '../ProBadge'
import { ProEmptyState } from '../ProEmptyState'
import { ProHeader } from '../ProHeader'
import { ProDashboardSkeleton } from '../ProSkeleton'

export const EmailNotificationsDashboard: React.FC = () => {
  const { t } = useI18n()
  const [emails, setEmails] = useState<ProEmailLogRecord[]>([])
  const [canSendTest, setCanSendTest] = useState<boolean>(false)
  const [recipientEmail, setRecipientEmail] = useState<string>('')
  const [isFallback, setIsFallback] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<ProEmailLogRecord | null>(null)
  const [filter, setFilter] = useState<'all' | 'digests' | 'alerts'>('all')

  const fetchEmails = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(API_ENDPOINTS.PRO.EMAILS)
      if (!res.ok) throw new Error(t('pro.emails.fetch_error', 'Failed to fetch email logs'))
      const data = await res.json()
      const list: ProEmailLogRecord[] = Array.isArray(data.emails) ? data.emails : []
      setEmails(list)
      const sentDigestCount = list.filter(
        (e: ProEmailLogRecord) =>
          e.templateName === 'ProDigestEmail' && (e.status === 'sent' || e.status === 'delivered')
      ).length
      setCanSendTest(
        data.canSendTest !== undefined ? Boolean(data.canSendTest) : sentDigestCount < 3
      )
      setRecipientEmail(data.recipientEmail || '')
      setIsFallback(Boolean(data.isFallback))
    } catch (err) {
      console.warn('Error fetching emails:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void fetchEmails()
  }, [fetchEmails])

  const handleSendTest = async () => {
    try {
      setSendingTest(true)
      const res = await fetch(API_ENDPOINTS.PRO.EMAILS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: 'ProDigestEmail',
          subject: '⚡ GitAscii Pro Weekly Traffic & Growth Digest',
          reason: 'Weekly profile telemetry digest dispatched to account',
          relatedProfile: 'default',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
        setCanSendTest(data.canSendTest !== undefined ? Boolean(data.canSendTest) : false)
        if (data.recipientEmail) setRecipientEmail(data.recipientEmail)
        if (data.isFallback !== undefined) setIsFallback(Boolean(data.isFallback))
      }
    } catch (err) {
      console.error('Failed to send test email:', err)
    } finally {
      setSendingTest(false)
    }
  }

  const filteredEmails = emails.filter((e) => {
    if (filter === 'digests') return e.templateName.toLowerCase().includes('digest')
    if (filter === 'alerts') return !e.templateName.toLowerCase().includes('digest')
    return true
  })

  const deliveredCount = emails.filter(
    (e) => e.status === 'sent' || e.status === 'delivered'
  ).length
  const deliveryRate = emails.length > 0 ? Math.round((deliveredCount / emails.length) * 100) : 100

  const sentDigestCount = emails.filter(
    (e) => e.templateName === 'ProDigestEmail' && (e.status === 'sent' || e.status === 'delivered')
  ).length

  if (loading) {
    return (
      <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <ProDashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.emails.title', 'Email Notifications & Dispatch Logs')}
        subtitle={t(
          'pro.emails.subtitle',
          'Audit trail of automated telemetry digests, widget failure alerts, and transactional dispatches.'
        )}
        actions={
          <div className="flex items-center gap-2">
            {canSendTest && (
              <button
                onClick={handleSendTest}
                disabled={sendingTest}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_10px_rgba(197,255,74,0.15)] cursor-pointer"
                title={
                  recipientEmail
                    ? t('pro.emails.send_to', 'Sends to {email}', { email: recipientEmail })
                    : undefined
                }
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {sendingTest
                    ? t('pro.emails.sending', 'Sending...')
                    : t('pro.emails.send_test_btn', 'Send Test Digest')}
                </span>
              </button>
            )}
            <button
              onClick={fetchEmails}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer"
              title={t('pro.emails.refresh_title', 'Refresh logs')}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`} />
            </button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#111111] border border-white/[0.08] font-mono text-xs">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.emails.total_dispatched', 'Total Dispatched')}
            </span>
            <p className="text-lg font-bold text-white">{emails.length}</p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.emails.audit_log', 'Audit Log')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.emails.delivery_sla', 'Delivery SLA')}
            </span>
            <p className="text-lg font-bold text-emerald-400">{deliveryRate}%</p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.emails.resend_provider', 'Resend Provider')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.emails.digest_quota', 'Digest Quota')}
            </span>
            <p className="text-lg font-bold text-[#c5ff4a]">{sentDigestCount} / 3</p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.emails.weekly_schedule', 'Weekly Schedule')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.emails.destination_integrity', 'Destination Integrity')}
            </span>
            <p className="text-lg font-bold text-white">
              {isFallback
                ? t('pro.emails.fallback_label', 'Fallback')
                : t('pro.emails.verified_label', 'Verified')}
            </p>
            <span className="text-[10px] text-[#7a7a7a] block">DKIM & SPF</span>
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#c5ff4a]/10 border border-[#c5ff4a]/20 flex items-center justify-center text-[#c5ff4a] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-white">
                  {t('pro.emails.active_recipient', 'Active Recipient:')}
                </span>
                <span className="font-mono text-xs text-[#c5ff4a] bg-[#c5ff4a]/10 px-2 py-0.5 rounded border border-[#c5ff4a]/20 truncate max-w-xs">
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
              <p className="text-[11px] text-[#8a8a8a] leading-tight truncate">
                {isFallback
                  ? t(
                      'pro.emails.fallback_desc',
                      'No verified primary email found in current session. Dispatching to GitHub proxy.'
                    )
                  : t(
                      'pro.emails.verified_desc',
                      'Automated weekly digests and widget failure alerts are dispatched to this address.'
                    )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-[#8a8a8a]">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <p className="leading-tight truncate">
            <strong>{t('pro.emails.resend_sla_title', 'Resend SLA & Delivery:')}</strong>{' '}
            {t(
              'pro.emails.resend_sla_desc',
              'Idempotency keys, bounce suppression, and RFC 1-click unsubscribe enforced.'
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
            actionLabel={
              canSendTest ? t('pro.emails.send_test_btn', 'Send Test Digest') : undefined
            }
            onAction={canSendTest ? handleSendTest : undefined}
          />
        ) : (
          <div className="rounded-xl bg-[#111111] border border-white/[0.08] overflow-hidden shadow-xs w-full">
            <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Inbox className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-xs font-semibold text-white">
                  {t('pro.emails.table_title', 'Dispatched Notifications History')}
                </h3>
                <span className="text-[10px] font-mono bg-white/[0.04] border border-white/5 text-[#888] px-1.5 py-0.2 rounded">
                  {filteredEmails.length}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-md border border-white/10 text-[11px] font-mono">
                {(['all', 'digests', 'alerts'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      filter === tab
                        ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                        : 'text-[#8a8a8a] hover:text-white'
                    }`}
                  >
                    {tab === 'all'
                      ? t('pro.profiles.filter_all', 'ALL')
                      : tab === 'digests'
                        ? t('pro.emails.filter_digests', 'DIGESTS')
                        : t('pro.emails.filter_alerts', 'ALERTS')}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#7a7a7a] font-mono bg-white/[0.01] text-[10px]">
                    <th className="py-2 px-3 w-[32%]">
                      {t('pro.emails.th_subject', 'Subject / Template')}
                    </th>
                    <th className="py-2 px-3 w-[26%] hidden md:table-cell">
                      {t('pro.emails.th_reason', 'Trigger Reason')}
                    </th>
                    <th className="py-2 px-3 w-[18%] hidden sm:table-cell">
                      {t('pro.emails.th_recipient', 'Recipient')}
                    </th>
                    <th className="py-2 px-3 w-[12%]">
                      {t('pro.emails.th_sent_time', 'Sent Time')}
                    </th>
                    <th className="py-2 px-3 w-[12%]">{t('pro.errors.th_status', 'Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {filteredEmails.map((eml) => {
                    const isSuccess = eml.status === 'sent' || eml.status === 'delivered'
                    const isFailed = eml.status === 'failed'

                    return (
                      <tr
                        key={eml.id}
                        onClick={() => setSelectedEmail(eml)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="py-2 px-3 font-sans truncate">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-white truncate text-xs">
                              {eml.subject}
                            </span>
                            <span className="text-[10px] font-mono text-[#7a7a7a] truncate">
                              {eml.templateName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3 font-sans text-[#8a8a8a] truncate hidden md:table-cell">
                          {eml.reason}
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] truncate hidden sm:table-cell">
                          {eml.recipientEmail}
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] whitespace-nowrap text-[10px]">
                          {new Date(eml.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <ProBadge
                              variant={isSuccess ? 'emerald' : isFailed ? 'rose' : 'muted'}
                              size="sm"
                            >
                              {eml.status}
                            </ProBadge>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c5ff4a]" />
                <h3 className="text-base font-bold text-white">
                  {t('pro.emails.modal_title', 'Email Dispatch Log')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[#7a7a7a] font-mono text-[10px] block">
                  {t('pro.emails.modal_subject', 'Subject:')}
                </span>
                <p className="text-white font-medium">{selectedEmail.subject}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.emails.modal_template', 'Template:')}
                  </span>
                  <span className="text-white">{selectedEmail.templateName}</span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.errors.th_status', 'Status:')}
                  </span>
                  <ProBadge
                    variant={
                      selectedEmail.status === 'sent' || selectedEmail.status === 'delivered'
                        ? 'emerald'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {selectedEmail.status}
                  </ProBadge>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.emails.th_recipient', 'Recipient')}:
                  </span>
                  <span className="text-[#c5ff4a] truncate block">
                    {selectedEmail.recipientEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.emails.modal_dispatched', 'Dispatched:')}
                  </span>
                  <span className="text-white">
                    {new Date(selectedEmail.sentAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#7a7a7a] font-mono text-[10px] block">
                  {t('pro.emails.th_reason', 'Trigger Reason')}:
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/10 text-white/80 font-mono text-[11px]">
                  {selectedEmail.reason}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
              >
                {t('pro.errors.close_btn', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

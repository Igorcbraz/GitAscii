'use client'

import { Bell, Mail, RefreshCw, Send } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProEmailLogRecord } from '../../types'
import { ProHeader } from '../ProHeader'
import { EmailDetailModal } from './EmailDetailModal'
import { EmailLogsTable } from './EmailLogsTable'
import { EmailNotificationsDashboardSkeleton } from './EmailNotificationsSkeleton'
import { EmailPreferencesSection } from './EmailPreferencesSection'

export type EmailSectionId = 'logs' | 'alerts-config'

export const EmailNotificationsDashboard: React.FC = () => {
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<EmailSectionId>('logs')
  const [emails, setEmails] = useState<ProEmailLogRecord[]>([])
  const [canSendTest, setCanSendTest] = useState<boolean>(false)
  const [recipientEmail, setRecipientEmail] = useState<string>('')
  const [isFallback, setIsFallback] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<ProEmailLogRecord | null>(null)

  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [digestEnabled, setDigestEnabled] = useState(true)
  const [alertEmail, setAlertEmail] = useState('')
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [alertSaveSuccess, setAlertSaveSuccess] = useState(false)

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
      const target = data.recipientEmail || ''
      setRecipientEmail(target)
      setAlertEmail((prev) => prev || target)
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

  const handleSaveSettings = () => {
    setSavingAlerts(true)
    setTimeout(() => {
      setSavingAlerts(false)
      setAlertSaveSuccess(true)
      setTimeout(() => setAlertSaveSuccess(false), 2500)
    }, 600)
  }

  const deliveredCount = emails.filter(
    (e) => e.status === 'sent' || e.status === 'delivered'
  ).length
  const deliveryRate = emails.length > 0 ? Math.round((deliveredCount / emails.length) * 100) : 100

  const sentDigestCount = emails.filter(
    (e) => e.templateName === 'ProDigestEmail' && (e.status === 'sent' || e.status === 'delivered')
  ).length

  const sections = useMemo(() => {
    return [
      {
        id: 'logs' as const,
        label: t('pro.emails.tab_logs', 'History & Sent Logs'),
        icon: <Mail className="w-4 h-4" />,
        badge: emails.length > 0 ? String(emails.length) : undefined,
      },
      {
        id: 'alerts-config' as const,
        label: t('pro.emails.tab_config', 'Incident Alerts Settings'),
        icon: <Bell className="w-4 h-4" />,
      },
    ]
  }, [t, emails.length])

  if (loading) {
    return <EmailNotificationsDashboardSkeleton />
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#555] px-1 pb-1 block">
              {t('pro.emails.sections', 'E-mail Management')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => {
                const isActive = activeSection === sec.id
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left cursor-pointer ${
                      isActive
                        ? 'bg-white/[0.07] text-white font-medium'
                        : 'text-[#666] hover:text-[#bbb] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isActive ? 'text-[#c5ff4a]' : 'text-[#555]'}>
                        {sec.icon}
                      </span>
                      <span>{sec.label}</span>
                    </div>
                    {sec.badge !== undefined && (
                      <span className="px-1.5 py-px rounded text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#555] flex items-center justify-between px-1 pb-1">
          <span>{t('pro.emails.delivery_sla', 'Delivery SLA')}</span>
          <span className="text-emerald-400">{deliveryRate}%</span>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden min-w-0 max-w-full bg-[#0a0a0a]">
        <ProHeader
          title={t('pro.emails.title', 'Email Notifications & Dispatch Logs')}
          subtitle={t(
            'pro.emails.subtitle',
            'Audit trail of automated telemetry digests, widget failure alerts, and transactional dispatches.'
          )}
          actions={
            <div className="flex items-center gap-2">
              {canSendTest && activeSection === 'logs' && (
                <button
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded transition-all shadow-[0_0_10px_rgba(197,255,74,0.15)] cursor-pointer"
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
                className="p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#7a7a7a] hover:text-white transition-all cursor-pointer"
                title={t('pro.emails.refresh_title', 'Refresh logs')}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
                />
              </button>
            </div>
          }
        />

        <div className="md:hidden flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[#c5ff4a] text-black font-bold'
                  : 'text-[#777] hover:text-white'
              }`}
            >
              {sec.label}
              {sec.badge !== undefined && (
                <span className="px-1 py-px rounded text-[9px] bg-emerald-500 text-black font-mono font-bold">
                  {sec.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 xl:p-7 space-y-5">
          {activeSection === 'logs' ? (
            <EmailLogsTable
              emails={emails}
              canSendTest={canSendTest}
              recipientEmail={recipientEmail}
              isFallback={isFallback}
              deliveryRate={deliveryRate}
              sentDigestCount={sentDigestCount}
              onSendTest={handleSendTest}
              onSelectEmail={setSelectedEmail}
            />
          ) : (
            <EmailPreferencesSection
              emailAlertsEnabled={emailAlertsEnabled}
              setEmailAlertsEnabled={setEmailAlertsEnabled}
              digestEnabled={digestEnabled}
              setDigestEnabled={setDigestEnabled}
              alertEmail={alertEmail}
              setAlertEmail={setAlertEmail}
              savingAlerts={savingAlerts}
              alertSaveSuccess={alertSaveSuccess}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </div>

      {selectedEmail && (
        <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  )
}

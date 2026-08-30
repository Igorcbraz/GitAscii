'use client'

import { Bell, Mail, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const EmailNotificationsDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  const sections = [
    {
      id: 'logs',
      label: t('pro.emails.tab_logs', 'History & Sent Logs'),
      icon: <Mail className="w-4 h-4" />,
      active: true,
    },
    {
      id: 'alerts-config',
      label: t('pro.emails.tab_alerts', 'Incident Alerts Settings'),
      icon: <Bell className="w-4 h-4" />,
      active: false,
    },
  ]

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#555] px-1 pb-1 block">
              {t('pro.emails.nav_management', 'E-mail Management')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs ${
                    sec.active ? 'bg-white/[0.07] text-white font-medium' : 'text-[#666]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={sec.active ? 'text-[#c5ff4a]' : 'text-[#555]'}>
                      {sec.icon}
                    </span>
                    <span>{sec.label}</span>
                  </div>
                  {sec.active && <ProSkeleton className="h-3.5 w-5 rounded" />}
                </div>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-between px-1 pb-1 text-[10px] font-mono text-[#555]">
          <span>{t('pro.emails.delivery_sla', 'Delivery SLA')}</span>
          <ProSkeleton className="h-2.5 w-8 bg-emerald-500/10" />
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
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] rounded shadow-[0_0_10px_rgba(197,255,74,0.15)]">
                <Send className="w-3.5 h-3.5" />
                <span>{t('pro.emails.send_test_btn', 'Send Test Digest')}</span>
              </div>
              <div className="p-2 rounded bg-white/[0.04] border border-white/[0.08] text-[#7a7a7a]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5ff4a]" />
              </div>
            </div>
          }
        />

        <div className="flex-1 p-5 xl:p-7 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
            {[
              {
                label: t('pro.emails.kpi_total', 'Total Dispatched'),
                sub: t('pro.emails.kpi_audit_log', 'Audit Log'),
              },
              {
                label: t('pro.emails.kpi_sla', 'Delivery SLA'),
                sub: t('pro.emails.kpi_resend_sub', 'Resend Provider'),
                emerald: true,
              },
              {
                label: t('pro.emails.kpi_quota', 'Digest Quota'),
                sub: t('pro.emails.kpi_schedule_sub', 'Weekly Schedule'),
                lime: true,
              },
              {
                label: t('pro.emails.kpi_integrity', 'Destination Integrity'),
                sub: t('pro.emails.kpi_dkim_sub', 'DKIM & SPF'),
              },
            ].map(({ label, sub, emerald, lime }) => (
              <div key={label} className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
                <ProSkeleton
                  className={`h-6 w-16 ${emerald ? 'bg-emerald-500/10' : lime ? 'bg-[#c5ff4a]/10' : ''}`}
                />
                <span className="text-[10px] text-[#555] block">{sub}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded border border-white/[0.06]">
            <Mail className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
            <span className="text-xs font-semibold text-white">
              {t('pro.emails.active_recipient_label', 'Active Recipient:')}
            </span>
            <ProSkeleton className="h-4 w-48 bg-[#c5ff4a]/10 rounded" />
            <ProBadge variant="emerald" size="sm">
              {t('pro.emails.verified_inbox', 'Verified Inbox')}
            </ProBadge>
          </div>

          <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.emails.history_title', 'Dispatch History')}
                </h3>
              </div>
              <div className="flex items-center gap-px bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
                {[
                  t('pro.emails.filter_all', 'ALL'),
                  t('pro.emails.filter_digests', 'DIGESTS'),
                  t('pro.emails.filter_alerts', 'ALERTS'),
                ].map((tab, idx) => (
                  <span
                    key={tab}
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-sm ${
                      idx === 0 ? 'bg-[#c5ff4a] text-black font-semibold' : 'text-[#555]'
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[#555] text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-4">
                      {t('pro.emails.th_template', 'Template / Event')}
                    </th>
                    <th className="py-2.5 px-4">{t('pro.emails.th_subject', 'Subject')}</th>
                    <th className="py-2.5 px-4">{t('pro.emails.th_profile', 'Profile')}</th>
                    <th className="py-2.5 px-4">{t('pro.emails.th_status', 'Status')}</th>
                    <th className="py-2.5 px-4">{t('pro.emails.th_dispatched', 'Dispatched')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    { isDigest: true, status: 'emerald' as const },
                    { isDigest: false, status: 'rose' as const },
                    { isDigest: true, status: 'emerald' as const },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              item.isDigest ? 'bg-[#c5ff4a]' : 'bg-rose-400'
                            }`}
                          />
                          <ProSkeleton className="h-3 w-28" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <ProSkeleton className="h-3 w-52" />
                      </td>
                      <td className="py-2.5 px-4">
                        <ProSkeleton className="h-3 w-16 bg-[#c5ff4a]/10" />
                      </td>
                      <td className="py-2.5 px-4">
                        <ProBadge variant={item.status} size="sm">
                          {item.status === 'emerald'
                            ? t('pro.emails.status_delivered', 'DELIVERED')
                            : t('pro.emails.status_failed', 'FAILED')}
                        </ProBadge>
                      </td>
                      <td className="py-2.5 px-4">
                        <ProSkeleton className="h-3 w-28" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex items-center gap-2 pb-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <p className="text-[11px] text-[#5a5a5a]">
              <strong className="text-[#7a7a7a]">
                {t('pro.emails.footer_notice_title', 'Resend SLA & Delivery:')}{' '}
              </strong>
              {t(
                'pro.emails.footer_notice_desc',
                'Idempotency keys, bounce suppression, and RFC 1-click unsubscribe enforced.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

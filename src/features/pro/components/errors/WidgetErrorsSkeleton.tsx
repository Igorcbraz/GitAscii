'use client'

import { CheckCircle2, Play, RefreshCw, Square, Trash2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const WidgetErrorsDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.errors.title', 'Widget Failure Monitor')}
        subtitle={t(
          'pro.errors.subtitle',
          'Live telemetry and uptime tracking for widgets embedded in GitHub READMEs.'
        )}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c5ff4a] bg-[#c5ff4a]/10 border border-[#c5ff4a]/30 rounded-lg">
              <Play className="w-3.5 h-3.5" />
              <span>{t('pro.errors.simulate_btn', 'Simulate Test Failure')}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#8a8a8a]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#c5ff4a]" />
            </div>
          </div>
        }
      />

      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#111111] border border-white/[0.08] font-mono text-xs">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.kpi_active', 'Active Incidents')}
            </span>
            <ProSkeleton className="h-6 w-10 bg-emerald-500/10" />
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.health.optimal', 'Optimal')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.kpi_total_logged', 'Total Logged')}
            </span>
            <ProSkeleton className="h-6 w-12" />
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.analytics.pro_retention', '90-Day Retention')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.kpi_occurrences', 'Total Occurrences')}
            </span>
            <ProSkeleton className="h-6 w-14 bg-[#c5ff4a]/10" />
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.errors.deduplicated', 'Deduplicated')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.kpi_health', 'Health Status')}
            </span>
            <ProSkeleton className="h-6 w-14" />
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.errors.automated_alerts', 'Automated Alerts')}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-xs">
                {t(
                  'pro.errors.healthy_banner_title',
                  'All GitHub README widgets are rendering without errors.'
                )}
              </p>
              <p className="text-[11px] text-white/70 truncate">
                {t(
                  'pro.errors.healthy_banner_sub',
                  'Automated email alerts are active with 1-hour cooldown deduplication.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 text-[#8a8a8a]">
            <span>{t('pro.common.total', 'Total')}: 0</span>
            <span>•</span>
            <span>{t('pro.errors.filter_active', 'Active')}: 0</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#111111] border border-white/[0.08] overflow-hidden shadow-xs w-full">
          <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-white">
                {t('pro.errors.table_title', 'Logged Failures & Incidents')}
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-md border border-white/10 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-[#c5ff4a] text-black font-semibold shadow-xs">
                {t('pro.errors.filter_all', 'ALL')}
              </span>
              <span className="px-2 py-0.5 rounded text-[#8a8a8a]">
                {t('pro.errors.filter_active', 'ACTIVE')}
              </span>
              <span className="px-2 py-0.5 rounded text-[#8a8a8a]">
                {t('pro.errors.filter_resolved', 'RESOLVED')}
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#7a7a7a] font-mono bg-white/[0.01] text-[10px]">
                  <th className="py-2 px-2.5 w-8 text-center">
                    <Square className="w-3.5 h-3.5 mx-auto text-white/30" />
                  </th>
                  <th className="py-2 px-3 w-[24%]">{t('pro.health.th_widget', 'Widget')}</th>
                  <th className="py-2 px-3 w-[15%] hidden sm:table-cell">
                    {t('pro.health.th_profile', 'Profile')}
                  </th>
                  <th className="py-2 px-3 w-[20%]">
                    {t('pro.health.th_error_type', 'Error Type')}
                  </th>
                  <th className="py-2 px-3 w-[10%] hidden md:table-cell text-center">
                    {t('pro.table.count', 'Count')}
                  </th>
                  <th className="py-2 px-3 w-[15%] hidden lg:table-cell">
                    {t('pro.health.last_seen', 'Last Seen')}
                  </th>
                  <th className="py-2 px-3 w-[10%]">{t('common.status', 'Status')}</th>
                  <th className="py-2 px-3 w-[12%] text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {[
                  { widget: 'Contribution Snake', type: 'FETCH_TIMEOUT', resolved: false },
                  { widget: 'WakaTime Stats', type: 'UPSTREAM_500', resolved: true },
                  { widget: 'GitHub Trophy', type: 'SVG_SYNTAX_ERROR', resolved: true },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-2.5 text-center">
                      <Square className="w-3.5 h-3.5 mx-auto text-white/20" />
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-white truncate text-xs">
                      <ProSkeleton className="h-3.5 w-32" />
                    </td>
                    <td className="py-2 px-3 text-[#8a8a8a] truncate hidden sm:table-cell">
                      <ProSkeleton className="h-3 w-16" />
                    </td>
                    <td className="py-2 px-3 truncate text-[11px]">
                      <ProSkeleton className="h-3.5 w-28 bg-[#c5ff4a]/15" />
                    </td>
                    <td className="py-2 px-3 text-white hidden md:table-cell text-center">
                      <ProSkeleton className="h-4 w-8 mx-auto rounded" />
                    </td>
                    <td className="py-2 px-3 text-[#8a8a8a] whitespace-nowrap text-[10px] hidden lg:table-cell">
                      <ProSkeleton className="h-3 w-20" />
                    </td>
                    <td className="py-2 px-3">
                      <ProBadge variant={item.resolved ? 'emerald' : 'rose'} size="sm">
                        {item.resolved
                          ? t('pro.errors.resolved', 'Resolved')
                          : t('pro.errors.active', 'Active')}
                      </ProBadge>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="px-2 py-0.5 rounded bg-white/5 text-white/50 text-[11px]">
                          {t('pro.errors.inspect', 'Inspect')}
                        </div>
                        <div className="p-1 rounded text-[#8a8a8a]">
                          <Trash2 className="w-3 h-3" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

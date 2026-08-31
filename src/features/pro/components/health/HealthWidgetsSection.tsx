'use client'

import { Server } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { WidgetHealthRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface HealthWidgetsSectionProps {
  filteredWidgets: WidgetHealthRecord[]
  selectedProfile: string
  widgetsPage: number
  setWidgetsPage: React.Dispatch<React.SetStateAction<number>>
  pageSize?: number
}

export const HealthWidgetsSection: React.FC<HealthWidgetsSectionProps> = ({
  filteredWidgets,
  selectedProfile,
  widgetsPage,
  setWidgetsPage,
  pageSize = 8,
}) => {
  const { t } = useI18n()

  const paginatedWidgets = filteredWidgets.slice(
    (widgetsPage - 1) * pageSize,
    widgetsPage * pageSize
  )

  const totalPages = Math.ceil(filteredWidgets.length / pageSize)

  return (
    <section id="widgets" className="w-full space-y-4 scroll-mt-6">
      <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.health.widgets_table_title', 'Widget Health & Performance Telemetry')}
            </h3>
          </div>
          <ProBadge variant="muted" size="sm">
            {filteredWidgets.length} {t('pro.health.widgets_monitored', 'Widgets Monitored')}
          </ProBadge>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-mono table-fixed">
            <thead>
              <tr className="border-b border-white/10 text-[#7a7a7a] uppercase text-[10px]">
                <th className="pb-3 pl-4 w-[240px]">{t('pro.health.th_widget', 'Widget Name')}</th>
                {selectedProfile === 'all' && (
                  <th className="pb-3 w-[110px]">{t('pro.health.th_profile', 'Profile')}</th>
                )}
                <th className="pb-3 w-[110px]">{t('pro.health.th_status', 'Status')}</th>
                <th className="pb-3 w-[85px]">{t('pro.health.th_latency', 'Latency')}</th>
                <th className="pb-3 w-[130px]">
                  {t('pro.health.th_success_rate', 'Success Rate')}
                </th>
                <th className="pb-3 w-[90px]">{t('pro.health.th_errors_24h', 'Errors (24h)')}</th>
                <th className="pb-3 w-[100px]">{t('pro.health.th_last_render', 'Last Render')}</th>
                <th className="pb-3 pr-4 w-[140px]">
                  {t('pro.health.th_health_score', 'Health Score')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {paginatedWidgets.map((w) => (
                <tr
                  key={`${w.widgetId}-${w.profileSlug || 'default'}`}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 pl-4 font-medium">
                    <span className="text-white truncate block" title={w.widgetName}>
                      {w.widgetName}
                    </span>
                    <span
                      className="text-[#7a7a7a] text-[10px] block font-mono truncate"
                      title={w.widgetId}
                    >
                      ID: {w.widgetId}
                    </span>
                  </td>
                  {selectedProfile === 'all' && (
                    <td className="py-3">
                      <span
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cyan-300 truncate inline-block max-w-[100px]"
                        title={w.profileSlug || 'default'}
                      >
                        /{w.profileSlug || 'default'}
                      </span>
                    </td>
                  )}
                  <td className="py-3">
                    <ProBadge
                      variant={
                        w.status === 'operational'
                          ? 'emerald'
                          : w.status === 'warning'
                            ? 'amber'
                            : 'rose'
                      }
                      size="sm"
                    >
                      {w.status.toUpperCase()}
                    </ProBadge>
                  </td>
                  <td className="py-3 font-semibold text-white">{w.avgRenderDurationMs || 25}ms</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full ${
                            w.successRate >= 95
                              ? 'bg-emerald-400'
                              : w.successRate >= 80
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                          }`}
                          style={{ width: `${w.successRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold">{w.successRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono">
                    <span
                      className={
                        (w.errorsLast24h || 0) > 0 ? 'text-rose-400 font-bold' : 'text-[#7a7a7a]'
                      }
                    >
                      {w.errorsLast24h || 0}
                    </span>
                  </td>
                  <td className="py-3 text-[#7a7a7a] text-[10px]">
                    {w.lastRenderAt ? new Date(w.lastRenderAt).toLocaleTimeString() : 'Just now'}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            w.successRate >= 95
                              ? 'bg-emerald-400'
                              : w.successRate >= 80
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                          }`}
                          style={{ width: `${w.successRate}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          w.successRate >= 95
                            ? 'text-emerald-400'
                            : w.successRate >= 80
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }`}
                      >
                        {w.successRate >= 95 ? '●' : w.successRate >= 80 ? '◐' : '○'}{' '}
                        {w.successRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWidgets.length > pageSize && (
          <div className="flex items-center justify-between p-3 border-t border-white/5">
            <span className="text-[10px] font-mono text-[#7a7a7a]">
              Showing {(widgetsPage - 1) * pageSize + 1}–
              {Math.min(widgetsPage * pageSize, filteredWidgets.length)} of {filteredWidgets.length}{' '}
              widgets
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWidgetsPage((p) => Math.max(1, p - 1))}
                disabled={widgetsPage === 1}
                className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setWidgetsPage(page)}
                  className={`w-6 h-6 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                    page === widgetsPage
                      ? 'bg-[#c5ff4a] text-black font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setWidgetsPage((p) => Math.min(totalPages, p + 1))}
                disabled={widgetsPage === totalPages}
                className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </section>
  )
}

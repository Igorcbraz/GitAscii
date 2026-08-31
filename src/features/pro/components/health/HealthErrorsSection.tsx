'use client'

import { AlertCircle, Check, CheckSquare, Eye, ShieldCheck, Square, Trash2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { WidgetErrorRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface HealthErrorsSectionProps {
  filteredErrors: WidgetErrorRecord[]
  activeErrors: WidgetErrorRecord[]
  selectedIds: Set<string>
  errorsPage: number
  setErrorsPage: React.Dispatch<React.SetStateAction<number>>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onResolveError: (id: string) => void
  onSelectError: (err: WidgetErrorRecord) => void
  onDeleteSingle: (err: WidgetErrorRecord) => void
  pageSize?: number
}

export const HealthErrorsSection: React.FC<HealthErrorsSectionProps> = ({
  filteredErrors,
  activeErrors,
  selectedIds,
  errorsPage,
  setErrorsPage,
  onToggleSelect,
  onSelectAll,
  onResolveError,
  onSelectError,
  onDeleteSingle,
  pageSize = 8,
}) => {
  const { t } = useI18n()

  if (filteredErrors.length === 0) {
    return (
      <section id="errors" className="w-full space-y-4 scroll-mt-6">
        <div className="rounded border border-emerald-500/20 bg-emerald-500/5 px-6 py-8 text-center space-y-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
          <h3 className="text-xs font-bold text-white">
            {t('pro.health.no_incidents_title', 'All Widgets & Profiles Healthy')}
          </h3>
          <p className="text-[11px] text-[#5a5a5a] max-w-sm mx-auto">
            {t(
              'pro.health.no_incidents_desc',
              'Zero widget rendering failures or timeouts detected in this scope.'
            )}
          </p>
        </div>
      </section>
    )
  }

  const paginatedErrors = filteredErrors.slice((errorsPage - 1) * pageSize, errorsPage * pageSize)
  const totalPages = Math.ceil(filteredErrors.length / pageSize)

  return (
    <section id="errors" className="w-full space-y-4 scroll-mt-6">
      <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              {t('pro.health.tab_incidents', 'Logged Incidents & Errors')}
            </h3>
            <ProBadge variant="rose" size="sm">
              {activeErrors.length} Active
            </ProBadge>
          </div>

          <button
            onClick={onSelectAll}
            className="px-2.5 py-1 text-xs rounded bg-white/[0.04] hover:bg-white/[0.08] text-[#7a7a7a] hover:text-white transition-colors cursor-pointer"
          >
            {selectedIds.size === filteredErrors.length
              ? t('pro.common.deselect_all', 'Deselect All')
              : t('pro.common.select_all', 'Select All')}
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#7a7a7a] uppercase text-[10px]">
                <th className="pb-3 pl-4 w-8">
                  <button onClick={onSelectAll} className="cursor-pointer">
                    {selectedIds.size > 0 && selectedIds.size === filteredErrors.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#c5ff4a]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-[#7a7a7a]" />
                    )}
                  </button>
                </th>
                <th className="pb-3">{t('pro.health.th_widget_target', 'Widget / Target')}</th>
                <th className="pb-3">{t('pro.health.th_profile', 'Profile')}</th>
                <th className="pb-3">{t('pro.health.th_error_type', 'Error Type')}</th>
                <th className="pb-3">{t('pro.health.th_message', 'Message')}</th>
                <th className="pb-3">{t('pro.health.th_occurrences', 'Occurrences')}</th>
                <th className="pb-3">{t('common.status', 'Status')}</th>
                <th className="pb-3 pr-4 text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {paginatedErrors.map((err) => {
                const isSelected = selectedIds.has(err.id)

                return (
                  <tr
                    key={err.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <td className="py-3 pl-4">
                      <button onClick={() => onToggleSelect(err.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#c5ff4a]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#7a7a7a]" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 font-medium text-white">
                      {err.widgetName || err.widgetId}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-cyan-300">
                        /{err.profileSlug || 'default'}
                      </span>
                    </td>
                    <td className="py-3">
                      <ProBadge variant="rose" size="sm">
                        {err.errorType}
                      </ProBadge>
                    </td>
                    <td className="py-3 text-[#aaa] max-w-xs truncate" title={err.message}>
                      {err.message}
                    </td>
                    <td className="py-3 font-bold text-rose-400">{err.occurrences}x</td>
                    <td className="py-3">
                      <ProBadge variant={err.status === 'resolved' ? 'emerald' : 'rose'} size="sm">
                        {err.status.toUpperCase()}
                      </ProBadge>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {err.status !== 'resolved' && (
                          <button
                            onClick={() => onResolveError(err.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                            title={t('pro.errors.resolve', 'Mark as Resolved')}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectError(err)}
                          className="p-1 text-[#8a8a8a] hover:text-white cursor-pointer"
                          title={t('pro.errors.inspect', 'Inspect Details')}
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteSingle(err)}
                          className="p-1 text-[#8a8a8a] hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredErrors.length > pageSize && (
          <div className="flex items-center justify-between p-3 border-t border-white/5">
            <span className="text-[10px] font-mono text-[#7a7a7a]">
              Showing {(errorsPage - 1) * pageSize + 1}–
              {Math.min(errorsPage * pageSize, filteredErrors.length)} of {filteredErrors.length}{' '}
              incidents
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setErrorsPage((p) => Math.max(1, p - 1))}
                disabled={errorsPage === 1}
                className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setErrorsPage(page)}
                  className={`w-6 h-6 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                    page === errorsPage
                      ? 'bg-[#c5ff4a] text-black font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-[#8a8a8a] hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setErrorsPage((p) => Math.min(totalPages, p + 1))}
                disabled={errorsPage === totalPages}
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

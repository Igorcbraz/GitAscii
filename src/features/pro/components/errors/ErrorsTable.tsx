'use client'

import { AlertTriangle, CheckCircle2, CheckSquare, Square, Trash2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { WidgetErrorRecord } from '../../types'
import { ProBadge } from '../ProBadge'
import { ProEmptyState } from '../ProEmptyState'

interface ErrorsTableProps {
  errors: WidgetErrorRecord[]
  filteredErrors: WidgetErrorRecord[]
  statusFilter: 'all' | 'active' | 'resolved'
  setStatusFilter: (f: 'all' | 'active' | 'resolved') => void
  selectedIds: Set<string>
  allSelected: boolean
  isIndeterminate: boolean
  onToggleSelect: (id: string) => void
  onSelectAllToggle: () => void
  onSelectError: (err: WidgetErrorRecord) => void
  onResolve: (id: string) => void
  onDeleteSingle: (err: WidgetErrorRecord) => void
  onSimulate: () => void
}

export const ErrorsTable: React.FC<ErrorsTableProps> = ({
  errors,
  filteredErrors,
  statusFilter,
  setStatusFilter,
  selectedIds,
  allSelected,
  isIndeterminate,
  onToggleSelect,
  onSelectAllToggle,
  onSelectError,
  onResolve,
  onDeleteSingle,
  onSimulate,
}) => {
  const { t } = useI18n()

  if (errors.length === 0) {
    return (
      <ProEmptyState
        icon={<AlertTriangle className="w-6 h-6" />}
        title={t('pro.errors.empty_title', 'No Widget Failures Detected')}
        description={t(
          'pro.errors.empty_desc',
          'All your GitHub profile widgets are responding cleanly. When upstream errors or network fallbacks occur, they are recorded here in real-time.'
        )}
        actionLabel={t('pro.errors.simulate_btn', 'Simulate Test Failure')}
        onAction={onSimulate}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                : 'text-[#8a8a8a] hover:text-white'
            }`}
          >
            {t('pro.errors.filter_all', 'All ({count})', { count: String(errors.length) })}
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'text-[#8a8a8a] hover:text-white'
            }`}
          >
            {t('pro.errors.filter_active', 'Active ({count})', {
              count: String(errors.filter((e) => e.status !== 'resolved').length),
            })}
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'resolved'
                ? 'bg-emerald-500 text-black font-semibold shadow-xs'
                : 'text-[#8a8a8a] hover:text-white'
            }`}
          >
            {t('pro.errors.filter_resolved', 'Resolved ({count})', {
              count: String(errors.filter((e) => e.status === 'resolved').length),
            })}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0d0d0e] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-[#121214] text-[#8a8a8a]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={onSelectAllToggle}
                    className="text-[#8a8a8a] hover:text-white transition-colors cursor-pointer flex items-center justify-center mx-auto"
                    title={
                      allSelected
                        ? t('pro.errors.deselect_all', 'Deselect all')
                        : t('pro.errors.select_all', 'Select all')
                    }
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#c5ff4a]" />
                    ) : isIndeterminate ? (
                      <div className="w-4 h-4 rounded border border-[#c5ff4a] flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-[#c5ff4a]" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4 text-[#555]" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">{t('pro.errors.th_widget', 'Widget')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_profile', 'Profile')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_error_type', 'Error Type')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_message', 'Message')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_occurrences', 'Occurrences')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_status', 'Status')}</th>
                <th className="py-3 px-4">{t('pro.errors.th_last_seen', 'Last Seen')}</th>
                <th className="py-3 px-4 text-right">{t('pro.common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredErrors.map((error) => {
                const isSelected = selectedIds.has(error.id)
                return (
                  <tr
                    key={error.id}
                    onClick={() => onSelectError(error)}
                    className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                      isSelected ? 'bg-white/[0.04]' : ''
                    }`}
                  >
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSelect(error.id)
                      }}
                    >
                      <button
                        type="button"
                        className="text-[#8a8a8a] hover:text-white transition-colors cursor-pointer flex items-center justify-center mx-auto"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#c5ff4a]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#555]" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            error.status === 'resolved' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {error.widgetName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#c5ff4a]">/{error.profileSlug || 'default'}</td>
                    <td className="py-3 px-4 text-rose-400">{error.errorType}</td>
                    <td className="py-3 px-4 text-[#8a8a8a] max-w-xs truncate">{error.message}</td>
                    <td className="py-3 px-4 text-white font-bold">{error.occurrences || 1}</td>
                    <td className="py-3 px-4">
                      <ProBadge
                        variant={error.status === 'resolved' ? 'emerald' : 'rose'}
                        size="sm"
                      >
                        {error.status.toUpperCase()}
                      </ProBadge>
                    </td>
                    <td className="py-3 px-4 text-[#8a8a8a] whitespace-nowrap">
                      {new Date(error.lastSeenAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {error.status !== 'resolved' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onResolve(error.id)
                          }}
                          className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-medium border border-emerald-500/20 transition-colors cursor-pointer"
                          title={t('pro.errors.mark_resolved', 'Mark Resolved')}
                        >
                          <CheckCircle2 className="w-3 h-3 inline-block mr-1" />
                          {t('pro.errors.resolve_short', 'Resolve')}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSingle(error)
                        }}
                        className="p-1 rounded text-[#8a8a8a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={t('pro.errors.delete_btn', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

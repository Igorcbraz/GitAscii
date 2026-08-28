'use client'

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { WidgetErrorRecord } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProBadge } from '../ProBadge'
import { ProEmptyState } from '../ProEmptyState'
import { ProHeader } from '../ProHeader'
import { ProDashboardSkeleton } from '../ProSkeleton'

export const WidgetErrorsDashboard: React.FC = () => {
  const { t } = useI18n()
  const [errors, setErrors] = useState<WidgetErrorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedError, setSelectedError] = useState<WidgetErrorRecord | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: React.ReactNode
    confirmLabel?: string
    variant?: 'danger' | 'warning' | 'primary'
    actionType: 'clear_all' | 'delete_selected' | 'delete_single'
    targetId?: string
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: t('pro.dialog.confirm', 'Confirm'),
    variant: 'danger',
    actionType: 'clear_all',
  })
  const [isActionLoading, setIsActionLoading] = useState(false)

  const fetchErrors = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(API_ENDPOINTS.PRO.ERRORS())
      if (!res.ok) throw new Error(t('pro.errors.fetch_error', 'Failed to fetch errors'))
      const data = await res.json()
      setErrors(data.errors || [])
    } catch (err) {
      console.warn('Error fetching widget errors:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void fetchErrors()
  }, [fetchErrors])

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(errors.map((e) => e.id))
      const next = new Set<string>()
      for (const id of prev) {
        if (validIds.has(id)) next.add(id)
      }
      return next
    })
  }, [errors])

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAllToggle = () => {
    if (selectedIds.size === filteredErrors.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredErrors.map((e) => e.id)))
    }
  }

  const handleResolve = async (errorId: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.PRO.ERROR_STATUS(errorId), { method: 'PATCH' })
      if (res.ok) {
        setErrors((prev) =>
          prev.map((e) =>
            e.id === errorId
              ? { ...e, status: 'resolved', resolvedAt: new Date().toISOString() }
              : e
          )
        )
        if (selectedError?.id === errorId) {
          setSelectedError((prev) => (prev ? { ...prev, status: 'resolved' } : null))
        }
      }
    } catch (err) {
      console.error('Failed to resolve error:', err)
    }
  }

  const promptClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: t('pro.errors.clear_all_title', 'Clear All Errors'),
      description: t(
        'pro.errors.clear_all_desc',
        'Are you sure you want to permanently delete all {count} error records? This action cannot be undone.',
        { count: String(errors.length) }
      ),
      confirmLabel: t('pro.errors.clear_all_confirm', 'Clear All'),
      variant: 'danger',
      actionType: 'clear_all',
    })
  }

  const promptDeleteSelected = () => {
    if (selectedIds.size === 0) return
    setConfirmDialog({
      isOpen: true,
      title: t('pro.errors.delete_selected_title', 'Delete Selected Errors'),
      description: t(
        'pro.errors.delete_selected_desc',
        'Are you sure you want to remove {count} selected error record(s)?',
        { count: String(selectedIds.size) }
      ),
      confirmLabel: `${t('pro.errors.delete_btn', 'Delete')} (${selectedIds.size})`,
      variant: 'danger',
      actionType: 'delete_selected',
    })
  }

  const promptDeleteSingle = (err: WidgetErrorRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: t('pro.errors.delete_single_title', 'Delete Error Record'),
      description: (
        <div>
          {t(
            'pro.errors.delete_single_desc',
            'Are you sure you want to delete widget error for {widget} ({type})?',
            { widget: err.widgetName, type: err.errorType }
          )}
        </div>
      ),
      confirmLabel: t('pro.errors.delete_single_confirm', 'Delete Error'),
      variant: 'danger',
      actionType: 'delete_single',
      targetId: err.id,
    })
  }

  const handleExecuteConfirmedAction = async () => {
    setIsActionLoading(true)
    try {
      if (confirmDialog.actionType === 'clear_all') {
        const res = await fetch(API_ENDPOINTS.PRO.ERRORS(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear_all' }),
        })
        if (res.ok) {
          setErrors([])
          setSelectedIds(new Set())
          setSelectedError(null)
        }
      } else if (confirmDialog.actionType === 'delete_selected') {
        const ids = Array.from(selectedIds)
        const res = await fetch(API_ENDPOINTS.PRO.ERRORS(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete_selected', ids }),
        })
        if (res.ok) {
          setErrors((prev) => prev.filter((e) => !selectedIds.has(e.id)))
          if (selectedError && selectedIds.has(selectedError.id)) {
            setSelectedError(null)
          }
          setSelectedIds(new Set())
        }
      } else if (confirmDialog.actionType === 'delete_single' && confirmDialog.targetId) {
        const idToDelete = confirmDialog.targetId
        const res = await fetch(API_ENDPOINTS.PRO.ERROR_STATUS(idToDelete), {
          method: 'DELETE',
        })
        if (res.ok) {
          setErrors((prev) => prev.filter((e) => e.id !== idToDelete))
          if (selectedError?.id === idToDelete) {
            setSelectedError(null)
          }
          setSelectedIds((prev) => {
            const next = new Set(prev)
            next.delete(idToDelete)
            return next
          })
        }
      }
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
    } catch (err) {
      console.error('Failed to execute error deletion:', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSimulateError = async () => {
    try {
      setSimulating(true)
      const res = await fetch(API_ENDPOINTS.PRO.ERRORS(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: 'contribution-snake',
          widgetName: 'Contribution Snake',
          profileSlug: 'default',
          errorType: 'FETCH_TIMEOUT',
          message: 'Upstream CDN asset timed out after 5000ms',
          details: 'HTTP 504: Snake SVG rendering action not completed on GitHub runner',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setErrors(data.errors || [])
      }
    } catch (err) {
      console.error('Failed to simulate error:', err)
    } finally {
      setSimulating(false)
    }
  }

  const activeErrors = errors.filter((e) => e.status !== 'resolved')
  const totalOccurrences = errors.reduce((acc, e) => acc + (e.occurrences || 1), 0)

  const filteredErrors = errors.filter((e) => {
    if (statusFilter === 'active') return e.status !== 'resolved'
    if (statusFilter === 'resolved') return e.status === 'resolved'
    return true
  })

  const allSelected = filteredErrors.length > 0 && selectedIds.size === filteredErrors.length
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredErrors.length

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
        title={t('pro.errors.title', 'Widget Failure Monitor')}
        subtitle={t(
          'pro.errors.subtitle',
          'Live telemetry and uptime tracking for widgets embedded in GitHub READMEs.'
        )}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateError}
              disabled={simulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c5ff4a] bg-[#c5ff4a]/10 hover:bg-[#c5ff4a]/20 border border-[#c5ff4a]/30 rounded-lg transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>
                {simulating
                  ? t('pro.errors.simulating', 'Simulating...')
                  : t('pro.errors.simulate_btn', 'Simulate Test Failure')}
              </span>
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={promptDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-medium transition-all cursor-pointer shadow-xs"
                title={`${t('pro.errors.delete_btn', 'Delete')} (${selectedIds.size})`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {t('pro.errors.delete_btn', 'Delete')} ({selectedIds.size})
                </span>
              </button>
            )}
            {errors.length > 0 && (
              <button
                onClick={promptClearAll}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-[#8a8a8a] hover:text-rose-400 transition-all cursor-pointer"
                title={t('pro.errors.clear_all_confirm', 'Clear All')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={fetchErrors}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer"
              title={t('pro.errors.refresh_title', 'Refresh telemetry')}
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
              {t('pro.errors.active_incidents', 'Active Incidents')}
            </span>
            <p
              className={`text-lg font-bold ${
                activeErrors.length > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {activeErrors.length}
            </p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {activeErrors.length === 0
                ? t('pro.errors.optimal', 'Optimal')
                : t('pro.errors.requires_attention', 'Requires Attention')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.total_logged', 'Total Logged')}
            </span>
            <p className="text-lg font-bold text-white">{errors.length}</p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.errors.retention_90d', '90-Day Retention')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.total_occurrences', 'Total Occurrences')}
            </span>
            <p className="text-lg font-bold text-[#c5ff4a]">{totalOccurrences}</p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.errors.deduplicated', 'Deduplicated')}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
              {t('pro.errors.health_status', 'Health Status')}
            </span>
            <p className="text-lg font-bold text-white">
              {activeErrors.length === 0
                ? '100%'
                : `${Math.max(0, 100 - activeErrors.length * 10)}%`}
            </p>
            <span className="text-[10px] text-[#7a7a7a] block">
              {t('pro.errors.automated_alerts', 'Automated Alerts')}
            </span>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
            activeErrors.length === 0
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activeErrors.length === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-xs">
                {activeErrors.length === 0
                  ? t(
                      'pro.errors.all_widgets_healthy',
                      'All GitHub README widgets are rendering without errors.'
                    )
                  : t(
                      'pro.errors.active_failures_detected',
                      '{count} active widget failure(s) detected.',
                      { count: String(activeErrors.length) }
                    )}
              </p>
              <p className="text-[11px] text-white/70 truncate">
                {t(
                  'pro.errors.cooldown_desc',
                  'Automated email alerts are active with 1-hour cooldown deduplication.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
            <span>
              {t('pro.errors.total_label', 'Total:')} {errors.length}
            </span>
            <span>•</span>
            <span>
              {t('pro.errors.active_label', 'Active:')} {activeErrors.length}
            </span>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="p-2.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2 text-white font-mono text-xs">
              <span className="font-medium text-[#c5ff4a]">{selectedIds.size}</span>{' '}
              {t('pro.errors.of_selected', 'of {count} selected', {
                count: String(filteredErrors.length),
              })}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-0.5 text-xs text-[#8a8a8a] hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
              >
                {t('pro.errors.clear_selection', 'Clear Selection')}
              </button>
              <button
                onClick={promptDeleteSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-all shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>
                  {t('pro.errors.delete_btn', 'Delete')} ({selectedIds.size})
                </span>
              </button>
            </div>
          </div>
        )}

        {errors.length === 0 ? (
          <ProEmptyState
            icon={<ShieldCheck className="w-6 h-6" />}
            title={t('pro.errors.no_errors_title', 'No Widget Errors Detected')}
            description={t(
              'pro.errors.no_errors_desc',
              'Your GitHub profile README widgets are loading cleanly. If any external widget fails, errors and diagnostics will be cataloged here automatically.'
            )}
            actionLabel={t('pro.errors.simulate_btn', 'Simulate Test Failure')}
            onAction={handleSimulateError}
          />
        ) : (
          <div className="rounded-xl bg-[#111111] border border-white/[0.08] overflow-hidden shadow-xs w-full">
            <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-white">
                  {t('pro.errors.table_title', 'Logged Failures & Incidents')}
                </h3>
                {selectedIds.size > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#c5ff4a]/10 text-[#c5ff4a] font-mono border border-[#c5ff4a]/20">
                    {selectedIds.size} {t('pro.errors.selected', 'selected')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-md border border-white/10 text-[11px] font-mono">
                {(['all', 'active', 'resolved'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                      statusFilter === s
                        ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                        : 'text-[#8a8a8a] hover:text-white'
                    }`}
                  >
                    {s === 'all'
                      ? t('pro.profiles.filter_all', 'ALL')
                      : s === 'active'
                        ? t('pro.profiles.filter_active', 'ACTIVE')
                        : t('pro.errors.filter_resolved', 'RESOLVED')}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[#7a7a7a] font-mono bg-white/[0.01] text-[10px]">
                    <th className="py-2 px-2.5 w-8 text-center">
                      <button
                        type="button"
                        onClick={handleSelectAllToggle}
                        className="text-[#8a8a8a] hover:text-white transition-colors cursor-pointer flex items-center justify-center mx-auto"
                        title={
                          allSelected
                            ? t('pro.errors.clear_selection', 'Clear selection')
                            : t('pro.errors.select_all', 'Select all')
                        }
                      >
                        {allSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#c5ff4a]" />
                        ) : isIndeterminate ? (
                          <div className="w-3.5 h-3.5 rounded-xs border border-[#c5ff4a] bg-[#c5ff4a]/20 flex items-center justify-center">
                            <div className="w-1.5 h-0.5 bg-[#c5ff4a]" />
                          </div>
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </th>
                    <th className="py-2 px-3 w-[24%]">{t('pro.errors.th_widget', 'Widget')}</th>
                    <th className="py-2 px-3 w-[15%] hidden sm:table-cell">
                      {t('pro.errors.th_profile', 'Profile')}
                    </th>
                    <th className="py-2 px-3 w-[20%]">
                      {t('pro.errors.th_error_type', 'Error Type')}
                    </th>
                    <th className="py-2 px-3 w-[10%] hidden md:table-cell text-center">
                      {t('pro.errors.th_count', 'Count')}
                    </th>
                    <th className="py-2 px-3 w-[15%] hidden lg:table-cell">
                      {t('pro.errors.th_last_seen', 'Last Seen')}
                    </th>
                    <th className="py-2 px-3 w-[10%]">{t('pro.errors.th_status', 'Status')}</th>
                    <th className="py-2 px-3 w-[12%] text-right">
                      {t('pro.errors.th_actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {filteredErrors.map((err) => {
                    const isResolved = err.status === 'resolved'
                    const isSelected = selectedIds.has(err.id)

                    return (
                      <tr
                        key={err.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-[#c5ff4a]/[0.04]' : 'hover:bg-white/[0.02]'
                        } ${isResolved ? 'opacity-60' : ''}`}
                      >
                        <td className="py-2 px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(err.id)}
                            className="text-[#8a8a8a] hover:text-white transition-colors cursor-pointer flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5 text-[#c5ff4a]" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
                            )}
                          </button>
                        </td>
                        <td className="py-2 px-3 font-sans font-medium text-white truncate text-xs">
                          {err.widgetName}
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] truncate hidden sm:table-cell">
                          /{err.profileSlug}
                        </td>
                        <td className="py-2 px-3 text-[#c5ff4a] font-semibold truncate text-[11px]">
                          {err.errorType}
                        </td>
                        <td className="py-2 px-3 text-white hidden md:table-cell text-center">
                          <span className="px-1.5 py-0.2 rounded bg-white/5 text-white/90 text-[10px]">
                            {err.occurrences}x
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#8a8a8a] whitespace-nowrap text-[10px] hidden lg:table-cell">
                          {new Date(err.lastSeenAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <ProBadge variant={isResolved ? 'emerald' : 'rose'} size="sm">
                            {isResolved ? t('pro.errors.resolved_badge', 'Resolved') : err.status}
                          </ProBadge>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedError(err)}
                              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 transition-all font-sans text-[11px] cursor-pointer"
                            >
                              {t('pro.errors.inspect_btn', 'Inspect')}
                            </button>
                            {!isResolved && (
                              <button
                                onClick={() => handleResolve(err.id)}
                                className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all font-sans text-[11px] cursor-pointer"
                              >
                                {t('pro.errors.resolve_btn', 'Resolve')}
                              </button>
                            )}
                            <button
                              onClick={() => promptDeleteSingle(err)}
                              className="p-1 rounded text-[#8a8a8a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title={t('pro.errors.delete_single_title', 'Delete error log')}
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
          </div>
        )}
      </div>

      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  {t('pro.errors.diagnostics_title', 'Error Diagnostics')}
                </h3>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.errors.th_widget', 'Widget')}:
                  </span>
                  <p className="text-white font-medium">{selectedError.widgetName}</p>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.errors.th_profile', 'Profile')}:
                  </span>
                  <p className="text-white font-medium">/{selectedError.profileSlug}</p>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.errors.first_seen', 'First Seen')}:
                  </span>
                  <p className="text-white">
                    {new Date(selectedError.firstSeenAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.errors.th_last_seen', 'Last Seen')}:
                  </span>
                  <p className="text-white">
                    {new Date(selectedError.lastSeenAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#8a8a8a] font-mono text-[11px]">
                  {t('pro.errors.error_message', 'Error Message:')}
                </span>
                <p className="p-3 rounded-lg bg-black/40 border border-white/10 text-rose-300 font-mono text-[11px] break-all">
                  {selectedError.message}
                </p>
              </div>

              {selectedError.details && (
                <div className="space-y-1">
                  <span className="text-[#8a8a8a] font-mono text-[11px]">
                    {t('pro.errors.technical_details', 'Technical Details:')}
                  </span>
                  <p className="p-3 rounded-lg bg-black/40 border border-white/10 text-white/80 font-mono text-[11px] break-all">
                    {selectedError.details}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const err = selectedError
                    setSelectedError(null)
                    promptDeleteSingle(err)
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('pro.errors.delete_btn', 'Delete')}</span>
                </button>
                <span className="text-[11px] font-mono text-[#7a7a7a]">
                  {t('pro.errors.occurrences_count', '{count}x occurrences', {
                    count: String(selectedError.occurrences),
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedError.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(selectedError.id)}
                    className="px-4 py-2 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(197,255,74,0.2)]"
                  >
                    {t('pro.errors.mark_resolved', 'Mark as Resolved')}
                  </button>
                )}
                <button
                  onClick={() => setSelectedError(null)}
                  className="px-4 py-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
                >
                  {t('pro.errors.close_btn', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={t('pro.dialog.cancel', 'Cancel')}
        variant={confirmDialog.variant}
        isLoading={isActionLoading}
        onConfirm={handleExecuteConfirmedAction}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

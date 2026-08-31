'use client'

import { Play, RefreshCw, Trash2 } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { WidgetErrorRecord } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProHeader } from '../ProHeader'
import { ErrorDetailsModal } from './ErrorDetailsModal'
import { ErrorsKpiStrip } from './ErrorsKpiStrip'
import { ErrorsTable } from './ErrorsTable'
import { WidgetErrorsDashboardSkeleton } from './WidgetErrorsSkeleton'

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

  const handleSelectAllToggle = () => {
    if (selectedIds.size === filteredErrors.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredErrors.map((e) => e.id)))
    }
  }

  if (loading) {
    return <WidgetErrorsDashboardSkeleton />
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
        <ErrorsKpiStrip
          errors={errors}
          activeErrors={activeErrors}
          totalOccurrences={totalOccurrences}
        />

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

        <ErrorsTable
          errors={errors}
          filteredErrors={filteredErrors}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedIds={selectedIds}
          allSelected={allSelected}
          isIndeterminate={isIndeterminate}
          onToggleSelect={handleToggleSelect}
          onSelectAllToggle={handleSelectAllToggle}
          onSelectError={setSelectedError}
          onResolve={handleResolve}
          onDeleteSingle={promptDeleteSingle}
          onSimulate={handleSimulateError}
        />
      </div>

      {selectedError && (
        <ErrorDetailsModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
          onResolve={handleResolve}
          onDelete={promptDeleteSingle}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        isLoading={isActionLoading}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}

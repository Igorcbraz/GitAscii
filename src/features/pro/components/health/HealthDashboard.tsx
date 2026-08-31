'use client'

import { Play, RefreshCw } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { SavedConfiguration } from '@/engine/types'
import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type {
  HealthStatus,
  OverallHealthMetrics,
  ProProfileRecord,
  WidgetErrorRecord,
} from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ErrorDetailsModal } from '../errors/ErrorDetailsModal'
import { ProHeader } from '../ProHeader'
import { HealthBadgeSection } from './HealthBadgeSection'
import { HealthErrorsSection } from './HealthErrorsSection'
import { HealthKpiStrip } from './HealthKpiStrip'
import { HealthOverviewSection } from './HealthOverviewSection'
import { type HealthSectionId, HealthSidebarNav } from './HealthSidebarNav'
import { HealthSimulateModal } from './HealthSimulateModal'
import { HealthSkeleton } from './HealthSkeleton'
import { HealthWidgetsSection } from './HealthWidgetsSection'

export const HealthDashboard: React.FC = () => {
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<HealthSectionId>('overview')
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [username, setUsername] = useState<string>('')
  const [metrics, setMetrics] = useState<OverallHealthMetrics | null>(null)
  const [profiles, setProfiles] = useState<ProProfileRecord[]>([])
  const [profileConfigs, setProfileConfigs] = useState<Record<string, SavedConfiguration>>({})
  const [errors, setErrors] = useState<WidgetErrorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [selectedError, setSelectedError] = useState<WidgetErrorRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false)
  const [simulateTargetProfile, setSimulateTargetProfile] = useState('default')
  const [simulateTargetWidget, setSimulateTargetWidget] = useState('contribution-snake')
  const [simulateErrorType, setSimulateErrorType] = useState('FETCH_TIMEOUT')
  const [simulateCustomMessage, setSimulateCustomMessage] = useState('')

  const [widgetsPage, setWidgetsPage] = useState(1)
  const [errorsPage, setErrorsPage] = useState(1)

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

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true)
      const [healthRes, errorsRes, profilesRes, sessionRes] = await Promise.all([
        fetch(API_ENDPOINTS.PRO.HEALTH),
        fetch(API_ENDPOINTS.PRO.ERRORS()),
        fetch(API_ENDPOINTS.PRO.PROFILES).catch(() => null),
        fetch(API_ENDPOINTS.AUTH.SESSION)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ])

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setMetrics(healthData)
      }

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json()
        setErrors(errorsData.errors || [])
      }

      if (profilesRes && profilesRes.ok) {
        const pData = await profilesRes.json()
        setProfiles(pData.profiles || [])
      }

      const activeUser = sessionRes?.session?.username
      if (activeUser) {
        setUsername(activeUser)
      }
    } catch (err) {
      console.warn('Error fetching health monitoring data:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  useEffect(() => {
    setWidgetsPage(1)
    setErrorsPage(1)
  }, [selectedProfile])

  const displayedProfiles = useMemo(() => {
    const list = metrics?.profiles || []
    if (selectedProfile === 'all') {
      if (list.length > 0) return list
      if (profiles.length > 0) {
        return profiles.map((p) => ({
          profileSlug: p.slug,
          profileName: p.name || p.slug,
          isDefault: p.isDefault,
          status: (p.healthStatus || 'operational') as HealthStatus,
          healthScore: 100,
          totalRenders: p.totalViews || 0,
          successfulRenders: p.totalViews || 0,
          failedRenders: 0,
          errorsLast24h: 0,
          avgRenderDurationMs: 24,
          widgetsCount: p.widgetsCount || 3,
          operationalWidgetsCount: p.widgetsCount || 3,
          warningWidgetsCount: 0,
          failedWidgetsCount: 0,
        }))
      }
      return [
        {
          profileSlug: 'default',
          profileName: 'Default Profile',
          isDefault: true,
          status: 'operational' as HealthStatus,
          healthScore: 100,
          totalRenders: 0,
          successfulRenders: 0,
          failedRenders: 0,
          errorsLast24h: 0,
          avgRenderDurationMs: 24,
          widgetsCount: 3,
          operationalWidgetsCount: 3,
          warningWidgetsCount: 0,
          failedWidgetsCount: 0,
        },
      ]
    }
    const matched = list.filter((p) => p.profileSlug === selectedProfile)
    if (matched.length > 0) return matched
    const matchedP = profiles.find((p) => p.slug === selectedProfile)
    if (matchedP) {
      return [
        {
          profileSlug: matchedP.slug,
          profileName: matchedP.name || matchedP.slug,
          isDefault: matchedP.isDefault,
          status: (matchedP.healthStatus || 'operational') as HealthStatus,
          healthScore: 100,
          totalRenders: matchedP.totalViews || 0,
          successfulRenders: matchedP.totalViews || 0,
          failedRenders: 0,
          errorsLast24h: 0,
          avgRenderDurationMs: 24,
          widgetsCount: matchedP.widgetsCount || 3,
          operationalWidgetsCount: matchedP.widgetsCount || 3,
          warningWidgetsCount: 0,
          failedWidgetsCount: 0,
        },
      ]
    }
    return []
  }, [metrics, selectedProfile, profiles])

  const filteredWidgets = useMemo(() => {
    const list = metrics?.widgets || []
    if (selectedProfile === 'all') return list
    return list.filter((w) => !w.profileSlug || w.profileSlug === selectedProfile)
  }, [metrics, selectedProfile])

  const filteredErrors = useMemo(() => {
    if (selectedProfile === 'all') return errors
    return errors.filter((e) => !e.profileSlug || e.profileSlug === selectedProfile)
  }, [errors, selectedProfile])

  const activeErrors = useMemo(() => {
    return filteredErrors.filter((e) => e.status !== 'resolved')
  }, [filteredErrors])

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

  const handleSelectAll = () => {
    if (selectedIds.size === filteredErrors.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredErrors.map((e) => e.id)))
    }
  }

  const handleResolveError = async (id: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.PRO.ERROR_STATUS(id), { method: 'PATCH' })
      if (res.ok) {
        setErrors((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: 'resolved', resolvedAt: new Date().toISOString() } : e
          )
        )
      }
    } catch (err) {
      console.error('Failed to resolve error:', err)
    }
  }

  const promptDeleteSingle = (err: WidgetErrorRecord) => {
    setConfirmDialog({
      isOpen: true,
      title: t('pro.errors.delete_single_title', 'Delete Error Record'),
      description: t(
        'pro.errors.delete_single_desc',
        'Are you sure you want to delete widget error for {widget} ({type})?',
        { widget: err.widgetName, type: err.errorType }
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
      if (confirmDialog.actionType === 'delete_single' && confirmDialog.targetId) {
        const idToDelete = confirmDialog.targetId
        const res = await fetch(API_ENDPOINTS.PRO.ERROR_STATUS(idToDelete), { method: 'DELETE' })
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
      console.error('Failed to delete error record:', err)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleTriggerSimulate = async () => {
    try {
      setSimulating(true)
      const res = await fetch(API_ENDPOINTS.PRO.ERRORS(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: simulateTargetWidget,
          widgetName:
            simulateTargetWidget === 'contribution-snake'
              ? 'Contribution Snake Game'
              : simulateTargetWidget === 'bio'
                ? 'Developer Bio & Avatar'
                : 'GitHub Stats Cards',
          profileSlug: simulateTargetProfile,
          errorType: simulateErrorType,
          message:
            simulateCustomMessage ||
            (simulateErrorType === 'FETCH_TIMEOUT'
              ? 'Upstream CDN asset request timed out after 5000ms'
              : simulateErrorType === 'UPSTREAM_500'
                ? 'Upstream API gateway returned HTTP 500 Internal Server Error'
                : 'Invalid SVG element hierarchy rendered'),
          details: `Simulated by telemetry monitor at ${new Date().toISOString()}`,
        }),
      })
      if (res.ok) {
        setIsSimulateModalOpen(false)
        await fetchData()
      }
    } catch (err) {
      console.error('Failed to trigger simulation:', err)
    } finally {
      setSimulating(false)
    }
  }

  const effectiveUsername = username || 'user'

  if (loading) {
    return <HealthSkeleton />
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <HealthSidebarNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedProfile={selectedProfile}
        setSelectedProfile={setSelectedProfile}
        profiles={profiles}
        errorsCount={errors.length}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen flex flex-col min-w-0 max-w-full bg-[#0a0a0a]">
        <ProHeader
          title={t('pro.health.title', 'GitAscii Health')}
          subtitle={t(
            'pro.health.subtitle',
            'Full 24/7 widget telemetry, sub-millisecond error diagnostics, and dynamic profile monitoring.'
          )}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimulateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t('pro.health.simulate_incident', 'Simulate Incident')}</span>
              </button>
              <button
                onClick={fetchData}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer"
                title={t('pro.health.refresh_data', 'Refresh telemetry data')}
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
                />
              </button>
            </div>
          }
        />

        <div className="p-5 xl:p-7 space-y-8 w-full min-w-0 max-w-full">
          <HealthKpiStrip metrics={metrics} errors={errors} />

          {(activeSection === 'overview' || activeSection === 'widgets') && (
            <HealthOverviewSection
              displayedProfiles={displayedProfiles}
              activeErrors={activeErrors}
              profileConfigs={profileConfigs}
              effectiveUsername={effectiveUsername}
              onSelectError={setSelectedError}
            />
          )}

          {(activeSection === 'overview' || activeSection === 'widgets') && (
            <HealthWidgetsSection
              filteredWidgets={filteredWidgets}
              selectedProfile={selectedProfile}
              widgetsPage={widgetsPage}
              setWidgetsPage={setWidgetsPage}
            />
          )}

          {(activeSection === 'overview' || activeSection === 'errors') && (
            <HealthErrorsSection
              filteredErrors={filteredErrors}
              activeErrors={activeErrors}
              selectedIds={selectedIds}
              errorsPage={errorsPage}
              setErrorsPage={setErrorsPage}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onResolveError={handleResolveError}
              onSelectError={setSelectedError}
              onDeleteSingle={promptDeleteSingle}
            />
          )}

          {(activeSection === 'overview' || activeSection === 'badge') && (
            <HealthBadgeSection username={effectiveUsername} />
          )}
        </div>
      </div>

      <HealthSimulateModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        profiles={profiles}
        simulateTargetProfile={simulateTargetProfile}
        setSimulateTargetProfile={setSimulateTargetProfile}
        simulateTargetWidget={simulateTargetWidget}
        setSimulateTargetWidget={setSimulateTargetWidget}
        simulateErrorType={simulateErrorType}
        setSimulateErrorType={setSimulateErrorType}
        simulateCustomMessage={simulateCustomMessage}
        setSimulateCustomMessage={setSimulateCustomMessage}
        simulating={simulating}
        onSimulate={handleTriggerSimulate}
      />

      {selectedError && (
        <ErrorDetailsModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
          onResolve={handleResolveError}
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

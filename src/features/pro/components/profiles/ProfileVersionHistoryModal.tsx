'use client'

import { Clock, History, Layers, Plus, RefreshCw, RotateCcw, Sparkles, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProfileVersionRecord, ProProfileRecord } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProBadge } from '../ProBadge'

interface ProfileVersionHistoryModalProps {
  profile: ProProfileRecord
  onClose: () => void
  onVersionRestored: (profile: ProProfileRecord) => void
}

export const ProfileVersionHistoryModal: React.FC<ProfileVersionHistoryModalProps> = ({
  profile,
  onClose,
  onVersionRestored,
}) => {
  const { t } = useI18n()
  const [versions, setVersions] = useState<ProfileVersionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ProfileVersionRecord | null>(null)

  const [showCreateSnapshot, setShowCreateSnapshot] = useState(false)
  const [snapshotLabel, setSnapshotLabel] = useState('')
  const [snapshotDescription, setSnapshotDescription] = useState('')
  const [creatingSnapshot, setCreatingSnapshot] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [confirmRestore, setConfirmRestore] = useState<{
    isOpen: boolean
    version: ProfileVersionRecord | null
  }>({
    isOpen: false,
    version: null,
  })
  const [restoring, setRestoring] = useState(false)

  const fetchVersions = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE_VERSIONS(profile.slug))
      if (!res.ok) throw new Error(t('pro.versions.fetch_error', 'Failed to fetch version history'))
      const data = await res.json()
      setVersions(data.versions || [])
    } catch (err) {
      console.warn('Error fetching versions:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile.slug, t])

  useEffect(() => {
    void fetchVersions()
  }, [fetchVersions])

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      setCreatingSnapshot(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE_VERSIONS(profile.slug), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: snapshotLabel.trim() || undefined,
          description: snapshotDescription.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t('pro.versions.create_failed', 'Failed to create snapshot'))
      }

      setShowCreateSnapshot(false)
      setSnapshotLabel('')
      setSnapshotDescription('')
      await fetchVersions()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t('pro.versions.create_error', 'Error creating snapshot')
      )
    } finally {
      setCreatingSnapshot(false)
    }
  }

  const handleRestore = async () => {
    if (!confirmRestore.version) return

    try {
      setRestoring(true)
      const res = await fetch(
        API_ENDPOINTS.PRO.PROFILE_VERSION_RESTORE(profile.slug, confirmRestore.version.id),
        { method: 'POST' }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t('pro.versions.restore_failed', 'Failed to restore version'))
      }

      onVersionRestored(data.profile)
      setConfirmRestore({ isOpen: false, version: null })
      await fetchVersions()
    } catch (err) {
      console.error('Failed to restore version:', err)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t('pro.versions.modal_title', 'Version History: /{slug}', { slug: profile.slug })}
              </h3>
              <p className="text-[11px] text-[#8a8a8a]">
                {t(
                  'pro.versions.modal_subtitle',
                  'Restore earlier configuration checkpoints and view change audit history.'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateSnapshot(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_12px_rgba(197,255,74,0.2)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('pro.versions.create_checkpoint', 'Create Checkpoint')}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showCreateSnapshot && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-[#c5ff4a]/30 my-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#c5ff4a]" />
                {t('pro.versions.save_checkpoint_title', 'Save Manual Checkpoint')}
              </span>
              <button
                onClick={() => setShowCreateSnapshot(false)}
                className="text-[#8a8a8a] hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSnapshot} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#8a8a8a] font-medium text-[11px]">
                    {t('pro.versions.field_label', 'Checkpoint Label')}
                  </label>
                  <input
                    type="text"
                    placeholder={t(
                      'pro.versions.field_label_placeholder',
                      'e.g. Major UI Redesign'
                    )}
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#8a8a8a] font-medium text-[11px]">
                    {t('pro.versions.field_notes', 'Changelog Notes')}
                  </label>
                  <input
                    type="text"
                    placeholder={t(
                      'pro.versions.field_notes_placeholder',
                      'e.g. Added snake game and trophies'
                    )}
                    value={snapshotDescription}
                    onChange={(e) => setSnapshotDescription(e.target.value)}
                    className="w-full p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateSnapshot(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs"
                >
                  {t('pro.dialog.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creatingSnapshot}
                  className="px-3 py-1.5 rounded-lg bg-[#c5ff4a] text-black font-semibold text-xs hover:bg-[#b0f533] cursor-pointer"
                >
                  {creatingSnapshot
                    ? t('pro.dialog.saving', 'Saving...')
                    : t('pro.versions.save_btn', 'Save Checkpoint')}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <RefreshCw className="w-5 h-5 text-[#c5ff4a] animate-spin" />
              <span className="text-xs text-[#8a8a8a] font-mono">
                {t('pro.versions.loading', 'Loading version checkpoints...')}
              </span>
            </div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-dashed border-white/10 space-y-2">
              <History className="w-6 h-6 text-[#7a7a7a] mx-auto" />
              <p className="text-xs font-semibold text-white">
                {t('pro.versions.no_versions', 'No Version Checkpoints Yet')}
              </p>
              <p className="text-[11px] text-[#8a8a8a] max-w-sm mx-auto">
                {t(
                  'pro.versions.no_versions_desc',
                  'Version checkpoints are automatically created whenever you save profile edits or duplicate profiles.'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((ver, idx) => {
                const isLatest = idx === 0
                return (
                  <div
                    key={ver.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLatest
                        ? 'bg-white/[0.04] border-[#c5ff4a]/40 shadow-xs'
                        : 'bg-[#141414] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
                          v{ver.versionNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-white truncate">
                          {ver.label ||
                            t('pro.profiles.version_number', 'Version {num}', {
                              num: String(ver.versionNumber),
                            })}
                        </h4>
                        {isLatest && (
                          <ProBadge variant="lime" size="sm">
                            {t('pro.versions.current_active', 'Current Active')}
                          </ProBadge>
                        )}
                      </div>

                      {ver.description && (
                        <p className="text-[11px] text-[#8a8a8a] line-clamp-2">{ver.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#7a7a7a]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ver.createdAt).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#c5ff4a]" />
                          {ver.widgetsCount} {t('pro.common.widgets', 'widgets')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isLatest && (
                        <button
                          onClick={() => setConfirmRestore({ isOpen: true, version: ver })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all cursor-pointer hover:border-[#c5ff4a]/50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#c5ff4a]" />
                          <span>{t('pro.versions.restore_btn', 'Restore')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 shrink-0 text-xs">
          <span className="text-[11px] font-mono text-[#7a7a7a]">
            {t('pro.versions.total_checkpoints', '{count} version checkpoints stored', {
              count: String(versions.length),
            })}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
          >
            {t('pro.common.close', 'Close')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmRestore.isOpen}
        title={t('pro.versions.confirm_restore_title', 'Restore Version Checkpoint')}
        description={
          confirmRestore.version ? (
            <p>
              {t(
                'pro.versions.confirm_restore_desc',
                'Are you sure you want to restore profile /{slug} to version v{ver} ({label})? Your current layout will be replaced, and a new restore checkpoint will be saved.',
                {
                  slug: profile.slug,
                  ver: String(confirmRestore.version.versionNumber),
                  label: confirmRestore.version.label || '',
                }
              )}
            </p>
          ) : (
            ''
          )
        }
        confirmLabel={t('pro.versions.restore_confirm_btn', 'Restore Checkpoint')}
        cancelLabel={t('pro.dialog.cancel', 'Cancel')}
        variant="warning"
        isLoading={restoring}
        onConfirm={handleRestore}
        onClose={() => setConfirmRestore({ isOpen: false, version: null })}
      />
    </div>
  )
}

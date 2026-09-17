'use client'

import { Check, ChevronDown, Clock3, Layers, Plus, RefreshCw } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProProfileRecord } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProHeader } from '../ProHeader'
import { DuplicateProfileModal } from './DuplicateProfileModal'
import { DynamicProfilesSection } from './DynamicProfilesSection'
import { ProfileCard } from './ProfileCard'
import { ProfileEditorModal } from './ProfileEditorModal'
import { ProfilePreviewPane } from './ProfilePreviewPane'
import { type ProfilesNavSection, ProfilesSidebarNav } from './ProfilesSidebarNav'
import { ProfilesDashboardSkeleton } from './ProfilesSkeleton'
import { ProfileVersionHistoryModal } from './ProfileVersionHistoryModal'

export interface ProfilesDashboardProps {
  username?: string
}

type EmbedType = 'markdown' | 'html' | 'url'
type ProfileStatusFilter = 'all' | 'active' | 'inactive'

function CustomDropdown({
  value,
  options,
  disabled,
  onChange,
}: {
  value: number
  options: { value: number; label: string }[]
  disabled: boolean
  onChange: (val: number) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div ref={containerRef} className="relative shrink-0 text-xs w-full sm:w-auto min-w-[120px]">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-black/30 pl-3 pr-2.5 py-1.5 text-white hover:bg-white/[0.02] transition-colors focus:border-[#c5ff4a]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{selectedOption?.label || ''}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[#8a8a8a] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1.5 w-full min-w-[140px] origin-top-right rounded-xl border border-white/10 bg-[#141414] shadow-xl animate-in fade-in-0 zoom-in-95 duration-100 z-50 p-1">
          <div className="py-0.5 space-y-0.5" role="menu">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  option.value === value
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-[#888] hover:bg-white/[0.04] hover:text-white'
                }`}
                role="menuitem"
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ProfilesDashboard: React.FC<ProfilesDashboardProps> = ({
  username: initialUsername,
}) => {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<ProfilesNavSection>('profiles')
  const [username, setUsername] = useState<string>(initialUsername || '')
  const [profiles, setProfiles] = useState<ProProfileRecord[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string>('default')
  const [statusFilter, setStatusFilter] = useState<ProfileStatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now())
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [embedType, setEmbedType] = useState<EmbedType>('markdown')
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [openDropdownSlug, setOpenDropdownSlug] = useState<string | null>(null)
  const [publishIntervalMinutes, setPublishIntervalMinutes] = useState(1440)
  const [canConfigureInterval, setCanConfigureInterval] = useState(false)
  const [savingInterval, setSavingInterval] = useState(false)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [duplicateTargetProfile, setDuplicateTargetProfile] = useState<ProProfileRecord | null>(
    null
  )
  const [versionHistoryProfile, setVersionHistoryProfile] = useState<ProProfileRecord | null>(null)
  const [editingProfile, setEditingProfile] = useState<ProProfileRecord | null>(null)
  const [deleteTargetSlug, setDeleteTargetSlug] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [settingDefaultSlug, setSettingDefaultSlug] = useState<string | null>(null)

  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialUsername) {
      fetch(API_ENDPOINTS.AUTH.SESSION)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.session?.username) {
            setUsername(d.session.username)
          }
        })
        .catch(() => {})
    }
  }, [initialUsername])

  const fetchProfiles = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILES)
      if (!res.ok) throw new Error(t('pro.profiles.error_fetch', 'Failed to fetch profiles'))
      const data = await res.json()
      const profList: ProProfileRecord[] = data.profiles || []
      setProfiles(profList)
      setSelectedSlug((prev) => {
        if (profList.length > 0 && !profList.some((p) => p.slug === prev)) {
          return profList[0]?.slug || 'default'
        }
        return prev
      })
    } catch (err) {
      console.warn('Error fetching profiles:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [t])

  useEffect(() => {
    void fetchProfiles()
  }, [fetchProfiles])

  useEffect(() => {
    fetch(API_ENDPOINTS.PRO.PUBLISH_SETTINGS)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return
        setPublishIntervalMinutes(data.intervalMinutes || 1440)
        setCanConfigureInterval(data.tier !== 'free')
      })
      .catch(() => {})
  }, [])

  const savePublishInterval = async (intervalMinutes: number) => {
    setSavingInterval(true)
    try {
      const response = await fetch(API_ENDPOINTS.PRO.PUBLISH_SETTINGS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalMinutes }),
      })
      if (response.ok) setPublishIntervalMinutes(intervalMinutes)
    } finally {
      setSavingInterval(false)
    }
  }

  const selectedProfile = profiles.find((p) => p.slug === selectedSlug) ||
    profiles[0] || {
      id: 'default',
      slug: 'default',
      name: t('pro.profiles.primary_profile', 'Primary Profile'),
      isDefault: true,
      status: 'active' as const,
      widgetsCount: 3,
      totalViews: 0,
      versionCount: 1,
      healthStatus: 'operational' as const,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      publicUrl: API_ENDPOINTS.GITHUB.PROFILE_FILE_PAGE(username || 'user', 'default', 'dark'),
      rawSvgUrl: API_ENDPOINTS.GITHUB.PUBLISHED_PROFILE(username || 'user', 'default', 'dark'),
    }

  const effectiveUsername = username || 'user'

  const handleCopySnippet = () => {
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2500)
  }

  const handleRefreshPreview = () => {
    setImageLoaded(false)
    setImageError(false)
    setPreviewTimestamp(Date.now())
  }

  const handleSelectProfile = (pSlug: string) => {
    if (pSlug === selectedSlug) return
    setSelectedSlug(pSlug)
    setImageLoaded(false)
    setImageError(false)
    setPreviewTimestamp(Date.now())
  }

  const handleSetDefault = async (pSlug: string) => {
    try {
      setSettingDefaultSlug(pSlug)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE_DEFAULT(pSlug), { method: 'POST' })
      if (res.ok) {
        await fetchProfiles()
      }
    } catch (err) {
      console.error('Failed to set default profile:', err)
    } finally {
      setSettingDefaultSlug(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!name.trim() || !slug.trim()) {
      setFormError(t('pro.profiles.name_slug_required', 'Name and slug are required'))
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || t('pro.profiles.error_create', 'Failed to create profile'))
      }
      setShowCreateModal(false)
      setName('')
      setSlug('')
      setDescription('')
      await fetchProfiles()
      setSelectedSlug(slug.trim())
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProfile) return

    try {
      setSubmitting(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE(editingProfile.slug), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProfile.name,
          description: editingProfile.description,
          status: editingProfile.status,
        }),
      })
      if (res.ok) {
        setEditingProfile(null)
        await fetchProfiles()
      }
    } catch (err) {
      console.error('Update error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetSlug) return
    try {
      setIsDeleting(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE(deleteTargetSlug), { method: 'DELETE' })
      if (res.ok) {
        setDeleteTargetSlug(null)
        await fetchProfiles()
        setSelectedSlug('default')
      }
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProfiles = profiles.filter((p) => {
    if (statusFilter === 'active') return p.status === 'active'
    if (statusFilter === 'inactive') return p.status !== 'active'
    return true
  })

  if (loading) {
    return <ProfilesDashboardSkeleton />
  }

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <ProfilesSidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profiles={profiles}
        selectedSlug={selectedSlug}
        setSelectedSlug={handleSelectProfile}
        onCreateNew={() => setShowCreateModal(true)}
      />

      <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen flex flex-col min-w-0 max-w-full bg-[#0a0a0a]">
        <ProHeader
          title={t('pro.profiles.title', 'Profiles & Live Canvas')}
          subtitle={t(
            'pro.profiles.subtitle',
            'Manage multiple distinct GitHub README configurations and preview live dynamic SVG cards.'
          )}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_12px_rgba(197,255,74,0.2)] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('pro.profiles.create_btn', 'Create Profile')}</span>
              </button>
              <button
                onClick={fetchProfiles}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-all cursor-pointer"
                title={t('pro.profiles.refresh_title', 'Refresh profiles')}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#c5ff4a]' : ''}`}
                />
              </button>
            </div>
          }
        />

        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full min-w-0 max-w-full flex-1 flex flex-col min-h-0">
          {activeTab === 'dynamic' ? (
            <DynamicProfilesSection
              username={effectiveUsername}
              profiles={profiles}
              onProfileUpdated={fetchProfiles}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 shrink-0">
                <div className="p-3 rounded-xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">
                        {t(
                          'pro.profiles.quota_configured',
                          '{count} of {total} Profiles Configured',
                          {
                            count: String(profiles.length),
                            total: '10',
                          }
                        )}
                      </p>
                      <p className="text-[10px] text-[#8a8a8a]">
                        {t(
                          'pro.profiles.quota_desc',
                          'Pro Plan includes up to 10 independent dynamic README profiles.'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-40 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 shrink-0">
                    <div
                      className="bg-[#c5ff4a] h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (profiles.length / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-400/10 text-sky-300 border border-sky-400/20">
                      <Clock3 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-xs">
                        {t('pro.profiles.publish_frequency', 'GitHub publication frequency')}
                      </p>
                      <p className="text-[10px] text-[#8a8a8a]">
                        {canConfigureInterval
                          ? t(
                              'pro.profiles.publish_frequency_pro_desc',
                              'Pro schedules hourly and the server enforces your selected interval.'
                            )
                          : t(
                              'pro.profiles.publish_frequency_free_desc',
                              'Free profiles are limited to one publication every 24 hours.'
                            )}
                      </p>
                    </div>
                  </div>
                  <CustomDropdown
                    value={publishIntervalMinutes}
                    disabled={!canConfigureInterval || savingInterval}
                    onChange={(val) => void savePublishInterval(val)}
                    options={
                      canConfigureInterval
                        ? [
                            { value: 60, label: '1 hour' },
                            { value: 180, label: '3 hours' },
                            { value: 360, label: '6 hours' },
                            { value: 720, label: '12 hours' },
                            { value: 1440, label: '24 hours' },
                          ]
                        : [{ value: 1440, label: '24 hours' }]
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 min-h-0">
                <div className="lg:col-span-5 space-y-2 lg:overflow-y-auto lg:max-h-full pr-0.5">
                  <div className="flex items-center justify-between px-1 pb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                        {t('pro.sidebar.nav.profiles', 'Profiles')}
                      </span>
                      <span className="text-[10px] font-mono bg-white/[0.04] border border-white/5 text-[#888] px-1.5 py-0.2 rounded">
                        {t('pro.profiles.filter_count', '{current} of {total}', {
                          current: String(filteredProfiles.length),
                          total: String(profiles.length),
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-md border border-white/10 text-[10px] font-mono">
                      {(['all', 'active', 'inactive'] as const).map((s) => (
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
                              : t('pro.profiles.filter_inactive', 'INACTIVE')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredProfiles.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1 text-xs">
                      <p className="text-white/80 font-medium text-xs">
                        {t('pro.profiles.no_status_profiles', 'No {status} profiles found', {
                          status: statusFilter,
                        })}
                      </p>
                      <p className="text-[10px] text-[#7a7a7a]">
                        {t(
                          'pro.profiles.switch_filter_desc',
                          'Switch status filter to view all profiles.'
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {filteredProfiles.map((prof) => (
                        <ProfileCard
                          key={prof.slug}
                          profile={prof}
                          isSelected={prof.slug === selectedSlug}
                          username={effectiveUsername}
                          openDropdownSlug={openDropdownSlug}
                          setOpenDropdownSlug={setOpenDropdownSlug}
                          settingDefaultSlug={settingDefaultSlug}
                          onSelect={handleSelectProfile}
                          onSetDefault={handleSetDefault}
                          onDuplicate={setDuplicateTargetProfile}
                          onEdit={setEditingProfile}
                          onVersionHistory={setVersionHistoryProfile}
                          onDelete={setDeleteTargetSlug}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5ff4a]" />
                    <span>{t('pro.profiles.create_another', 'Create Another Profile')}</span>
                  </button>
                </div>

                <div className="lg:col-span-7 flex flex-col h-full min-h-0">
                  <ProfilePreviewPane
                    selectedProfile={selectedProfile}
                    username={effectiveUsername}
                    previewTimestamp={previewTimestamp}
                    imageLoaded={imageLoaded}
                    imageError={imageError}
                    embedType={embedType}
                    copiedSnippet={copiedSnippet}
                    onRefreshPreview={handleRefreshPreview}
                    onSetEmbedType={setEmbedType}
                    onCopySnippet={handleCopySnippet}
                    setImageLoaded={setImageLoaded}
                    setImageError={setImageError}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ProfileEditorModal
        isOpen={showCreateModal || Boolean(editingProfile)}
        onClose={() => {
          setShowCreateModal(false)
          setEditingProfile(null)
        }}
        editingProfile={editingProfile}
        setEditingProfile={setEditingProfile}
        name={name}
        setName={setName}
        slug={slug}
        setSlug={setSlug}
        description={description}
        setDescription={setDescription}
        submitting={submitting}
        formError={formError}
        effectiveUsername={effectiveUsername}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {duplicateTargetProfile && (
        <DuplicateProfileModal
          sourceProfile={duplicateTargetProfile}
          username={effectiveUsername}
          onClose={() => setDuplicateTargetProfile(null)}
          onSuccess={() => {
            setDuplicateTargetProfile(null)
            void fetchProfiles()
          }}
        />
      )}

      {versionHistoryProfile && (
        <ProfileVersionHistoryModal
          profile={versionHistoryProfile}
          onClose={() => setVersionHistoryProfile(null)}
          onVersionRestored={() => {
            void fetchProfiles()
            handleRefreshPreview()
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTargetSlug)}
        title={t('pro.profiles.delete_dialog_title', 'Delete Profile')}
        description={
          <div>
            {t(
              'pro.profiles.delete_dialog_desc',
              'Are you sure you want to delete profile {slug}? This action cannot be undone.',
              { slug: deleteTargetSlug || '' }
            )}
          </div>
        }
        confirmLabel={t('pro.profiles.delete_dialog_confirm', 'Delete Profile')}
        cancelLabel={t('pro.dialog.cancel', 'Cancel')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetSlug(null)}
      />
    </div>
  )
}

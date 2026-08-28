'use client'

import {
  Check,
  Copy,
  Edit,
  ExternalLink,
  ImageIcon,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProProfileRecord } from '../../types'
import { ConfirmDialog } from '../ConfirmDialog'
import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProDashboardSkeleton } from '../ProSkeleton'

export interface ProfilesDashboardProps {
  username?: string
}

type EmbedType = 'markdown' | 'html' | 'url'
type ProfileStatusFilter = 'all' | 'active' | 'inactive'

export const ProfilesDashboard: React.FC<ProfilesDashboardProps> = ({
  username: initialUsername,
}) => {
  const { t } = useI18n()
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ProProfileRecord | null>(null)
  const [deleteTargetSlug, setDeleteTargetSlug] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const selectedProfile = profiles.find((p) => p.slug === selectedSlug) ||
    profiles[0] || {
      id: 'default',
      slug: 'default',
      name: t('pro.profiles.primary_profile', 'Primary Profile'),
      isDefault: true,
      status: 'active' as const,
      widgetsCount: 3,
      totalViews: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      publicUrl: `/${username || 'user'}`,
      rawSvgUrl: `/api/${username || 'user'}`,
    }

  const effectiveUsername = username || 'user'
  const isDefaultProfile = selectedProfile.slug === 'default'
  const svgEndpoint = isDefaultProfile
    ? `/api/${encodeURIComponent(effectiveUsername)}?t=${previewTimestamp}`
    : `/api/${encodeURIComponent(effectiveUsername)}/${encodeURIComponent(selectedProfile.slug)}?t=${previewTimestamp}`

  const publicEditorUrl = isDefaultProfile
    ? `/${effectiveUsername}`
    : `/${effectiveUsername}/${selectedProfile.slug}`

  const fullSvgUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${isDefaultProfile ? `/api/${effectiveUsername}` : `/api/${effectiveUsername}/${selectedProfile.slug}`}`
      : `https://gitascii.dev${isDefaultProfile ? `/api/${effectiveUsername}` : `/api/${effectiveUsername}/${selectedProfile.slug}`}`

  const fullTargetUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${effectiveUsername}`
      : `https://gitascii.dev/${effectiveUsername}`

  const getEmbedSnippet = () => {
    switch (embedType) {
      case 'markdown':
        return `[![GitAscii Profile README](${fullSvgUrl})](${fullTargetUrl})`
      case 'html':
        return `<a href="${fullTargetUrl}"><img src="${fullSvgUrl}" alt="${selectedProfile.name} GitAscii Profile" /></a>`
      case 'url':
        return fullSvgUrl
    }
  }

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getEmbedSnippet())
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2500)
  }

  const handleRefreshPreview = () => {
    setImageLoaded(false)
    setImageError(false)
    setPreviewTimestamp(Date.now())
  }

  const filteredProfiles = profiles.filter((p) => {
    if (statusFilter === 'active') return p.status === 'active'
    if (statusFilter === 'inactive') return p.status !== 'active'
    return true
  })

  const handleFilterChange = (newFilter: ProfileStatusFilter) => {
    setStatusFilter(newFilter)
    const matches = profiles.filter((p) => {
      if (newFilter === 'active') return p.status === 'active'
      if (newFilter === 'inactive') return p.status !== 'active'
      return true
    })
    if (matches.length > 0 && !matches.some((p) => p.slug === selectedSlug)) {
      setSelectedSlug(matches[0]?.slug || 'default')
      setImageLoaded(false)
      setImageError(false)
      setPreviewTimestamp(Date.now())
    }
  }

  const handleSelectProfile = (pSlug: string) => {
    if (pSlug === selectedSlug) return
    setSelectedSlug(pSlug)
    setImageLoaded(false)
    setImageError(false)
    setPreviewTimestamp(Date.now())
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!slug || !name) {
      setFormError(t('pro.profiles.slug_name_required', 'Slug and Name are required'))
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name, description }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || t('pro.profiles.create_failed', 'Failed to create profile'))
      }

      setShowCreateModal(false)
      const createdSlug = slug
      setSlug('')
      setName('')
      setDescription('')
      await fetchProfiles()
      setSelectedSlug(createdSlug)
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : t('pro.profiles.create_error', 'Error creating profile')
      )
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
      if (!res.ok) throw new Error(t('pro.profiles.update_failed', 'Failed to update profile'))
      setEditingProfile(null)
      await fetchProfiles()
    } catch (err) {
      console.error(err)
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
        if (selectedSlug === deleteTargetSlug) {
          setSelectedSlug('default')
        }
        await fetchProfiles()
      }
    } catch (err) {
      console.error('Failed to delete profile:', err)
    } finally {
      setIsDeleting(false)
      setDeleteTargetSlug(null)
    }
  }

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

      <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
        <div className="p-3 rounded-xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs">
                {t('pro.profiles.quota_configured', '{count} of {total} Profiles Configured', {
                  count: String(profiles.length),
                  total: '10',
                })}
              </p>
              <p className="text-[10px] text-[#8a8a8a]">
                {t(
                  'pro.profiles.quota_desc',
                  'Pro Plan includes up to 10 independent dynamic README profiles.'
                )}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-40 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-[#c5ff4a] h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (profiles.length / 10) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 space-y-2">
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
                    onClick={() => handleFilterChange(s)}
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
                {filteredProfiles.map((prof) => {
                  const isSelected = prof.slug === selectedSlug
                  return (
                    <div
                      key={prof.slug}
                      onClick={() => handleSelectProfile(prof.slug)}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative group ${
                        isSelected
                          ? 'bg-white/[0.04] border-[#c5ff4a]/50 ring-1 ring-[#c5ff4a]/20 shadow-xs'
                          : 'bg-[#111111] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected ? 'bg-[#c5ff4a] animate-pulse' : 'bg-white/20'
                          }`}
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3
                              className={`text-xs font-bold truncate transition-colors ${
                                isSelected ? 'text-[#c5ff4a]' : 'text-white'
                              }`}
                            >
                              {prof.name}
                            </h3>
                            {prof.isDefault && (
                              <ProBadge variant="lime" size="sm">
                                {t('pro.common.default', 'Default')}
                              </ProBadge>
                            )}
                            <ProBadge
                              variant={prof.status === 'active' ? 'emerald' : 'muted'}
                              size="sm"
                            >
                              {prof.status === 'active'
                                ? t('pro.sidebar.active', 'Active')
                                : prof.status}
                            </ProBadge>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8a8a8a]">
                            <span>/{prof.slug}</span>
                            <span>•</span>
                            <span>
                              {prof.totalViews.toLocaleString()} {t('pro.common.views', 'views')}
                            </span>
                            <span>•</span>
                            <span>
                              {prof.widgetsCount} {t('pro.common.widgets', 'widgets')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setEditingProfile(prof)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title={t('pro.profiles.edit_title', 'Edit profile settings')}
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        {!prof.isDefault && (
                          <button
                            onClick={() => setDeleteTargetSlug(prof.slug)}
                            className="p-1.5 rounded-lg text-[#7a7a7a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title={t('pro.profiles.delete_title', 'Delete profile')}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <Link
                          href={
                            prof.isDefault || prof.slug === 'default'
                              ? `/${effectiveUsername}`
                              : `/${effectiveUsername}/${prof.slug}`
                          }
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center justify-center"
                          title={t('pro.profiles.open_visual_editor', 'Open in Visual Editor')}
                        >
                          <ExternalLink className="w-3 h-3 text-[#c5ff4a]" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
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

          <div className="lg:col-span-7 space-y-3">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white tracking-tight">
                        {selectedProfile.name}
                      </h3>
                      <ProBadge variant="lime" size="sm">
                        {t('pro.profiles.live_card_badge', 'Live Card')}
                      </ProBadge>
                    </div>
                    <p className="text-[10px] font-mono text-[#8a8a8a]">
                      /api/{effectiveUsername}
                      {!isDefaultProfile ? `/${selectedProfile.slug}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleRefreshPreview}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-colors cursor-pointer"
                    title={t('pro.profiles.force_rerender', 'Force re-render SVG badge')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={publicEditorUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_10px_rgba(197,255,74,0.2)]"
                  >
                    <span>{t('pro.profiles.editor_btn', 'Editor')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl bg-[#09090b] border border-white/[0.08] p-4 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-[#09090b]/80 backdrop-blur-xs">
                    <span className="w-5 h-5 border-2 border-[#c5ff4a] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-mono text-[#8a8a8a]">
                      {t('pro.profiles.synthesizing', 'Synthesizing dynamic SVG badge...')}
                    </span>
                  </div>
                )}

                {!imageError ? (
                  <div className="relative z-10 w-full flex items-center justify-center">
                    <Image
                      key={svgEndpoint}
                      src={svgEndpoint}
                      alt={`GitAscii Card for @${effectiveUsername}/${selectedProfile.slug}`}
                      width={800}
                      height={340}
                      unoptimized
                      priority
                      className={`w-full max-w-full h-auto max-h-[340px] object-contain transition-opacity duration-200 select-none ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setImageError(true)
                        setImageLoaded(true)
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-white">
                      {t('pro.profiles.preview_rendering', 'Preview Rendering')}
                    </p>
                    <p className="text-[11px] text-[#8a8a8a] max-w-sm">
                      {t(
                        'pro.profiles.preview_rendering_desc',
                        'Open this profile in the Visual Editor to customize widgets and initial layout.'
                      )}
                    </p>
                    <Link
                      href={publicEditorUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors mt-2"
                    >
                      <span>{t('pro.profiles.open_visual_editor', 'Open in Visual Editor')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                    <button
                      onClick={() => setEmbedType('markdown')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        embedType === 'markdown'
                          ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                          : 'text-[#8a8a8a] hover:text-white'
                      }`}
                    >
                      {t('pro.profiles.snippet_markdown', 'Markdown')}
                    </button>
                    <button
                      onClick={() => setEmbedType('html')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        embedType === 'html'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-[#8a8a8a] hover:text-white'
                      }`}
                    >
                      {t('pro.profiles.snippet_html', 'HTML')}
                    </button>
                    <button
                      onClick={() => setEmbedType('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        embedType === 'url'
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'text-[#8a8a8a] hover:text-white'
                      }`}
                    >
                      {t('pro.profiles.snippet_raw_url', 'Raw URL')}
                    </button>
                  </div>

                  <button
                    onClick={handleCopySnippet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-white/90 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {copiedSnippet
                        ? t('pro.profiles.snippet_copied', 'Copied!')
                        : t('pro.profiles.copy_embed_code', 'Copy Embed Code')}
                    </span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.08] font-mono text-[11px] text-[#bbb] overflow-x-auto select-all">
                  <code>{getEmbedSnippet()}</code>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px]">
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.profiles.lifetime_views', 'Profile Lifetime Views')}
                  </span>
                  <span className="text-white font-bold">
                    {selectedProfile.totalViews.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.profiles.active_widgets', 'Active Widgets')}
                  </span>
                  <span className="text-[#c5ff4a] font-bold">
                    {selectedProfile.widgetsCount} {t('pro.common.widgets', 'Widgets')}
                  </span>
                </div>
                <div>
                  <span className="text-[#7a7a7a] text-[10px] block">
                    {t('pro.profiles.last_sync', 'Last Sync')}
                  </span>
                  <span className="text-white/80 font-medium">
                    {new Date(selectedProfile.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c5ff4a]" />
                <h3 className="text-base font-bold text-white">
                  {t('pro.profiles.create_modal_title', 'Create New Profile')}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_name', 'Profile Name')}
                </label>
                <input
                  type="text"
                  placeholder={t('pro.profiles.field_name_placeholder', 'e.g. Minimalist Dark')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!slug) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_slug', 'Slug / URL Identifier')}
                </label>
                <input
                  type="text"
                  placeholder={t('pro.profiles.field_slug_placeholder', 'e.g. minimalist')}
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:border-[#c5ff4a] focus:outline-none"
                  required
                />
                <span className="text-[11px] text-[#7a7a7a] font-mono block">
                  {t('pro.profiles.path_prefix', 'Path:')} /api/{effectiveUsername}/
                  {slug || '[slug]'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_description', 'Description (Optional)')}
                </label>
                <textarea
                  placeholder={t(
                    'pro.profiles.field_desc_placeholder',
                    'Short note about what is included in this profile...'
                  )}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
                >
                  {t('pro.dialog.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(197,255,74,0.2)]"
                >
                  {submitting
                    ? t('pro.dialog.processing', 'Processing...')
                    : t('pro.profiles.create_btn', 'Create Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">
                {t('pro.profiles.edit_modal_title', 'Edit Profile: /{slug}', {
                  slug: editingProfile.slug,
                })}
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_name', 'Profile Name')}
                </label>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_status', 'Status')}
                </label>
                <select
                  value={editingProfile.status}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none"
                >
                  <option value="active">{t('pro.profiles.status_active', 'Active')}</option>
                  <option value="draft">{t('pro.profiles.status_draft', 'Draft')}</option>
                  <option value="archived">{t('pro.profiles.status_archived', 'Archived')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8a8a8a] font-medium">
                  {t('pro.profiles.field_description', 'Description')}
                </label>
                <textarea
                  value={editingProfile.description || ''}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
                >
                  {t('pro.dialog.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(197,255,74,0.2)]"
                >
                  {submitting
                    ? t('pro.dialog.processing', 'Processing...')
                    : t('pro.profiles.save_changes', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
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

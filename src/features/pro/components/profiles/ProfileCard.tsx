'use client'

import { Copy, Edit, ExternalLink, History, MoreVertical, Star, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface ProfileCardProps {
  profile: ProProfileRecord
  isSelected: boolean
  username: string
  openDropdownSlug: string | null
  setOpenDropdownSlug: (slug: string | null) => void
  onSelect: (slug: string) => void
  onSetDefault: (slug: string) => void
  onDuplicate: (p: ProProfileRecord) => void
  onEdit: (p: ProProfileRecord) => void
  onVersionHistory: (p: ProProfileRecord) => void
  onDelete: (slug: string) => void
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isSelected,
  username,
  openDropdownSlug,
  setOpenDropdownSlug,
  onSelect,
  onSetDefault,
  onDuplicate,
  onEdit,
  onVersionHistory,
  onDelete,
}) => {
  const { t } = useI18n()
  const isDropdownOpen = openDropdownSlug === profile.slug
  const isDefault = profile.isDefault || profile.slug === 'default'

  const effectiveUsername = username || 'user'
  const editorUrl = isDefault ? `/${effectiveUsername}` : `/${effectiveUsername}/${profile.slug}`

  return (
    <div
      onClick={() => onSelect(profile.slug)}
      className={`p-2.5 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 relative group ${
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
              {profile.name}
            </h3>
            {isDefault && (
              <ProBadge variant="lime" size="sm">
                {t('pro.common.default', 'Default')}
              </ProBadge>
            )}
            <ProBadge variant={profile.status === 'active' ? 'emerald' : 'muted'} size="sm">
              {profile.status === 'active' ? t('pro.sidebar.active', 'Active') : profile.status}
            </ProBadge>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8a8a8a]">
            <span>/{profile.slug}</span>
            <span>•</span>
            <span>
              {(profile.totalViews || 0).toLocaleString()} {t('pro.common.views', 'views')}
            </span>
            <span>•</span>
            <span>
              {profile.widgetsCount || 3} {t('pro.common.widgets', 'widgets')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onEdit(profile)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          title={t('pro.profiles.edit_title', 'Edit profile settings')}
        >
          <Edit className="w-3 h-3" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenDropdownSlug(isDropdownOpen ? null : profile.slug)}
            className="p-1.5 rounded-lg text-[#7a7a7a] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={t('common.more_actions', 'More Actions')}
          >
            <MoreVertical className="w-3 h-3" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 w-44 rounded-xl bg-[#18181b] border border-white/15 shadow-2xl p-1 space-y-0.5 font-mono text-xs animate-in fade-in zoom-in-95">
              {!isDefault && (
                <button
                  onClick={() => {
                    setOpenDropdownSlug(null)
                    onSetDefault(profile.slug)
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('pro.profiles.make_default', 'Set as Default')}</span>
                </button>
              )}
              <button
                onClick={() => {
                  setOpenDropdownSlug(null)
                  onDuplicate(profile)
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('pro.profiles.duplicate', 'Duplicate Profile')}</span>
              </button>
              <button
                onClick={() => {
                  setOpenDropdownSlug(null)
                  onVersionHistory(profile)
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>{t('pro.profiles.version_history', 'Version History')}</span>
              </button>
            </div>
          )}
        </div>

        {!isDefault && (
          <button
            onClick={() => onDelete(profile.slug)}
            className="p-1.5 rounded-lg text-[#7a7a7a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title={t('pro.profiles.delete_title', 'Delete profile')}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}

        <Link
          href={editorUrl}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
          title={t('pro.profiles.open_visual_editor', 'Open in Visual Editor')}
        >
          <ExternalLink className="w-3 h-3 text-[#c5ff4a]" />
        </Link>
      </div>
    </div>
  )
}

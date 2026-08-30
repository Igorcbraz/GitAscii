'use client'

import { Layers, X } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { CustomSelect } from './CustomSelect'

interface ProfileEditorModalProps {
  isOpen: boolean
  onClose: () => void
  editingProfile: ProProfileRecord | null
  setEditingProfile: React.Dispatch<React.SetStateAction<ProProfileRecord | null>>
  name: string
  setName: (val: string) => void
  slug: string
  setSlug: (val: string) => void
  description: string
  setDescription: (val: string) => void
  submitting: boolean
  formError: string | null
  effectiveUsername: string
  onCreate: (e: React.FormEvent) => void
  onUpdate: (e: React.FormEvent) => void
}

export const ProfileEditorModal: React.FC<ProfileEditorModalProps> = ({
  isOpen,
  onClose,
  editingProfile,
  setEditingProfile,
  name,
  setName,
  slug,
  setSlug,
  description,
  setDescription,
  submitting,
  formError,
  effectiveUsername,
  onCreate,
  onUpdate,
}) => {
  const { t } = useI18n()

  if (!isOpen) return null

  if (editingProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
        <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">
              {t('pro.profiles.edit_modal_title', 'Edit Profile: /{slug}', {
                slug: editingProfile.slug,
              })}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={onUpdate} className="space-y-4 text-xs">
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

            <div className="space-y-1.5">
              <label className="text-[#8a8a8a] font-medium">
                {t('pro.profiles.field_status', 'Status')}
              </label>
              <CustomSelect
                options={[
                  { value: 'active', label: t('pro.sidebar.active', 'Active') },
                  { value: 'draft', label: t('pro.profiles.status_draft', 'Draft') },
                  { value: 'archived', label: t('pro.profiles.status_archived', 'Archived') },
                ]}
                value={editingProfile.status}
                onChange={(val) =>
                  setEditingProfile({
                    ...editingProfile,
                    status: val as 'active' | 'draft' | 'archived',
                  })
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
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
                  ? t('pro.dialog.saving', 'Saving...')
                  : t('pro.profiles.save_changes_btn', 'Save Changes')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
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
            onClick={onClose}
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

        <form onSubmit={onCreate} className="space-y-4 text-xs">
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
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:border-[#c5ff4a] focus:outline-none"
              required
            />
            <span className="text-[11px] text-[#7a7a7a] font-mono block">
              {t('pro.profiles.path_prefix', 'Path:')} /api/{effectiveUsername}/{slug || '[slug]'}
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
              onClick={onClose}
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
  )
}

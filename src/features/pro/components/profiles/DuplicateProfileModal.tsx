'use client'

import { Copy, X } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'
import { API_ENDPOINTS } from '@/services/endpoints'

import type { ProProfileRecord } from '../../types'

interface DuplicateProfileModalProps {
  sourceProfile: ProProfileRecord
  username: string
  onClose: () => void
  onSuccess: (newProfile: ProProfileRecord) => void
}

export const DuplicateProfileModal: React.FC<DuplicateProfileModalProps> = ({
  sourceProfile,
  username,
  onClose,
  onSuccess,
}) => {
  const { t } = useI18n()
  const [name, setName] = useState(
    `${sourceProfile.name} ${t('pro.profiles.copy_suffix', '(Copy)')}`
  )
  const [slug, setSlug] = useState(`${sourceProfile.slug}-copy`)
  const [description, setDescription] = useState(
    sourceProfile.description
      ? `${t('pro.profiles.copy_of', 'Copy of')} ${sourceProfile.description}`
      : `${t('pro.profiles.duplicated_from', 'Duplicated from')} ${sourceProfile.name}`
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (!cleanSlug || !name.trim()) {
      setError(t('pro.profiles.slug_name_required', 'Slug and Name are required'))
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch(API_ENDPOINTS.PRO.PROFILE_DUPLICATE(sourceProfile.slug), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSlug: cleanSlug,
          name: name.trim(),
          description: description.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.error || t('pro.profiles.duplicate_failed', 'Failed to duplicate profile')
        )
      }

      onSuccess(data.profile)
      onClose()
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t('pro.profiles.duplicate_error', 'An error occurred while duplicating profile')
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Copy className="w-4 h-4 text-[#c5ff4a]" />
            <h3 className="text-base font-bold text-white">
              {t('pro.profiles.duplicate_modal_title', 'Duplicate Profile: /{slug}', {
                slug: sourceProfile.slug,
              })}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8a8a8a] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#7a7a7a] tracking-wider block">
              {t('pro.profiles.cloning_source', 'Cloning Source')}
            </span>
            <p className="text-white font-medium text-xs">
              {sourceProfile.name}{' '}
              <span className="text-[#8a8a8a] font-mono">
                ({sourceProfile.widgetsCount} {t('pro.profiles.widgets_count', 'widgets')})
              </span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8a8a8a] font-medium">
              {t('pro.profiles.new_profile_name', 'New Profile Name')}
            </label>
            <input
              type="text"
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
              {t('pro.profiles.new_profile_slug', 'New URL Slug')}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:border-[#c5ff4a] focus:outline-none"
              required
            />
            <span className="text-[11px] text-[#7a7a7a] font-mono block">
              {t('pro.profiles.path_prefix', 'Path:')} /api/{username}/{slug || '[slug]'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#8a8a8a] font-medium">
              {t('pro.profiles.field_description', 'Description (Optional)')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:border-[#c5ff4a] focus:outline-none h-16 resize-none"
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
                : t('pro.profiles.duplicate_btn', 'Duplicate Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

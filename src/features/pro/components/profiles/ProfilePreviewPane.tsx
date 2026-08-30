'use client'

import { Check, Copy, ExternalLink, ImageIcon, RefreshCw, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProProfileRecord } from '../../types'
import { ProBadge } from '../ProBadge'

interface ProfilePreviewPaneProps {
  selectedProfile: ProProfileRecord
  username: string
  previewTimestamp: number

  imageLoaded: boolean
  imageError: boolean
  embedType: 'markdown' | 'html' | 'url'
  copiedSnippet: boolean
  onRefreshPreview: () => void
  onSetEmbedType: (type: 'markdown' | 'html' | 'url') => void
  onCopySnippet: () => void
  setImageLoaded: (val: boolean) => void
  setImageError: (val: boolean) => void
}

export const ProfilePreviewPane: React.FC<ProfilePreviewPaneProps> = ({
  selectedProfile,
  username,
  previewTimestamp,
  imageLoaded,
  imageError,
  embedType,
  copiedSnippet,
  onRefreshPreview,
  onSetEmbedType,
  onCopySnippet,
  setImageLoaded,
  setImageError,
}) => {
  const { t } = useI18n()

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
      : `https://gitascii.com${isDefaultProfile ? `/api/${effectiveUsername}` : `/api/${effectiveUsername}/${selectedProfile.slug}`}`

  const fullTargetUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/${effectiveUsername}`
      : `https://gitascii.com/${effectiveUsername}`

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

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-white/[0.08] flex flex-col h-full min-h-0 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/5 pb-3 shrink-0">
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
            onClick={onRefreshPreview}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8a8a] hover:text-white transition-colors cursor-pointer"
            title={t('pro.profiles.force_rerender', 'Force re-render SVG badge')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <Link
            href={publicEditorUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-black bg-[#c5ff4a] hover:bg-[#b0f533] rounded-lg transition-all shadow-[0_0_10px_rgba(197,255,74,0.2)] cursor-pointer"
          >
            <span>{t('pro.profiles.editor_btn', 'Editor')}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl bg-[#09090b] border border-white/[0.08] p-4 flex flex-col items-center justify-center flex-1 min-h-[260px] relative overflow-hidden my-3">
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
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Image
              key={svgEndpoint}
              src={svgEndpoint}
              alt={selectedProfile.name}
              width={1200}
              height={800}
              unoptimized
              className={`max-w-full max-h-full w-auto h-auto object-contain select-none transition-opacity duration-300 ${
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white transition-colors mt-2 cursor-pointer"
            >
              <span>{t('pro.profiles.open_visual_editor', 'Open in Visual Editor')}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => onSetEmbedType('markdown')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                embedType === 'markdown'
                  ? 'bg-[#c5ff4a] text-black font-semibold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-white'
              }`}
            >
              {t('pro.profiles.snippet_markdown', 'Markdown')}
            </button>
            <button
              onClick={() => onSetEmbedType('html')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                embedType === 'html'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-white'
              }`}
            >
              {t('pro.profiles.snippet_html', 'HTML')}
            </button>
            <button
              onClick={() => onSetEmbedType('url')}
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
            onClick={onCopySnippet}
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

      <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px] shrink-0 mt-3">
        <div>
          <span className="text-[#7a7a7a] text-[10px] block">
            {t('pro.profiles.lifetime_views', 'Profile Lifetime Views')}
          </span>
          <span className="text-white font-bold">
            {(selectedProfile.totalViews || 0).toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-[#7a7a7a] text-[10px] block">
            {t('pro.profiles.active_widgets', 'Active Widgets')}
          </span>
          <span className="text-[#c5ff4a] font-bold">
            {selectedProfile.widgetsCount || 3} {t('pro.common.widgets', 'Widgets')}
          </span>
        </div>
        <div>
          <span className="text-[#7a7a7a] text-[10px] block">
            {t('pro.profiles.last_sync', 'Last Sync')}
          </span>
          <span className="text-white/80 font-medium">
            {selectedProfile.lastUpdated
              ? new Date(selectedProfile.lastUpdated).toLocaleDateString()
              : 'Today'}
          </span>
        </div>
      </div>
    </div>
  )
}

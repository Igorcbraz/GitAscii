'use client'

import { Copy, Edit, ExternalLink, Layers, Plus, RefreshCw, Sparkles } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const ProfilesDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Scope')}
            </span>
            <div className="h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center p-2 gap-2">
              <div className="w-5 h-5 rounded bg-white/[0.06]" />
              <div className="space-y-1 flex-1">
                <ProSkeleton className="h-3 w-20" />
                <ProSkeleton className="h-2 w-12" />
              </div>
            </div>
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.analytics.sections', 'Sections')}
            </span>
            <div className="space-y-1">
              <div className="h-8 rounded-md bg-white/[0.08] flex items-center px-2.5 gap-2">
                <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <ProSkeleton className="h-3 w-24" />
              </div>
              <div className="h-8 rounded-md bg-transparent flex items-center px-2.5 gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/10" />
                <ProSkeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-1 pb-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#666]">
            <span>{t('pro.profiles.title', 'Profiles')}</span>
            <span className="text-[#c5ff4a] font-semibold">1/10</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
            <div className="bg-[#c5ff4a] h-full rounded-full w-1/4 animate-pulse" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto h-screen min-w-0">
        <ProHeader
          title={t('pro.profiles.title', 'Profiles & Live Canvas')}
          subtitle={t(
            'pro.profiles.subtitle',
            'Manage up to 10 custom GitHub README profiles, version checkpoints, and scheduled dynamic profile rules.'
          )}
          actions={
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] rounded-lg shadow-[0_0_12px_rgba(197,255,74,0.2)]">
                <Plus className="w-3.5 h-3.5" />
                <span>{t('pro.profiles.create_btn', 'Create Profile')}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#8a8a8a]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5ff4a]" />
              </div>
            </div>
          }
        />

        <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
          <div className="p-3.5 rounded-xl bg-[#111111] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-white text-xs">
                  {t('pro.profiles.quota_configured', 'Profiles Configured')}
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
              <div className="bg-[#c5ff4a] h-full rounded-full w-1/3 animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between px-1 pb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                    {t('pro.profiles.title', 'Profiles')}
                  </span>
                  <span className="text-[10px] font-mono bg-white/[0.04] border border-white/5 text-[#888] px-1.5 py-0.2 rounded">
                    {t('pro.profiles.active_tab', 'Active')}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-md border border-white/10 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#c5ff4a] text-black font-semibold shadow-xs">
                    {t('pro.profiles.filter_all', 'ALL')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[#8a8a8a]">
                    {t('pro.profiles.filter_active', 'ACTIVE')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[#8a8a8a]">
                    {t('pro.profiles.filter_inactive', 'INACTIVE')}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="p-2.5 sm:p-3 rounded-xl border bg-white/[0.04] border-[#c5ff4a]/50 ring-1 ring-[#c5ff4a]/20 shadow-xs flex items-center justify-between gap-3 relative">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full shrink-0 bg-[#c5ff4a] animate-pulse" />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ProSkeleton className="h-3.5 w-24 bg-[#c5ff4a]/20" />
                        <ProBadge variant="lime" size="sm">
                          {t('pro.common.default', 'Default')}
                        </ProBadge>
                        <ProBadge variant="emerald" size="sm">
                          {t('pro.profiles.badge_active', 'Active')}
                        </ProBadge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#8a8a8a]">
                        <ProSkeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="p-1.5 rounded-lg bg-white/5 text-white/50">
                      <Edit className="w-3 h-3" />
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/5 text-white/50">
                      <ExternalLink className="w-3 h-3 text-[#c5ff4a]" />
                    </div>
                  </div>
                </div>

                {[...Array(2)].map((_, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-xl border bg-[#111111] border-white/[0.08] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-white/20" />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <ProSkeleton className="h-3.5 w-28" />
                          <ProBadge variant="emerald" size="sm">
                            {t('pro.profiles.badge_active', 'Active')}
                          </ProBadge>
                        </div>
                        <ProSkeleton className="h-2.5 w-36" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <div className="p-1.5 rounded-lg bg-white/5 text-white/50">
                        <Edit className="w-3 h-3" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/5 text-white/50">
                        <ExternalLink className="w-3 h-3 text-[#c5ff4a]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-xs font-medium text-white/80">
                <Plus className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <span>{t('pro.profiles.create_another', 'Create Another Profile')}</span>
              </div>
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
                        <ProSkeleton className="h-3.5 w-24" />
                        <ProBadge variant="lime" size="sm">
                          {t('pro.profiles.live_card_badge', 'Live Card')}
                        </ProBadge>
                      </div>
                      <ProSkeleton className="h-2.5 w-32 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#8a8a8a]">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-black bg-[#c5ff4a] rounded-lg shadow-[0_0_10px_rgba(197,255,74,0.2)]">
                      <span>{t('pro.profiles.editor_btn', 'Editor')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#09090b] border border-white/[0.08] p-4 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                  <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 text-center">
                    <span className="w-6 h-6 border-2 border-[#c5ff4a] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px] font-mono text-[#8a8a8a]">
                      {t('pro.profiles.synthesizing_svg', 'Synthesizing dynamic SVG badge...')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-md bg-[#c5ff4a] text-black font-semibold shadow-xs">
                        {t('pro.snippets.markdown', 'Markdown')}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[#8a8a8a]">
                        {t('pro.snippets.html', 'HTML')}
                      </span>
                      <span className="px-2.5 py-1 rounded-md text-[#8a8a8a]">
                        {t('pro.snippets.raw_url', 'Raw URL')}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-white/90 bg-white/5 border border-white/10 rounded-lg">
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('pro.snippets.copy_embed', 'Copy Embed Code')}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#09090b] border border-white/[0.08] font-mono text-[11px]">
                    <ProSkeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-[11px]">
                  <div className="space-y-1">
                    <span className="text-[#7a7a7a] text-[10px] block">
                      {t('pro.profiles.metric_views', 'Profile Lifetime Views')}
                    </span>
                    <ProSkeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#7a7a7a] text-[10px] block">
                      {t('pro.profiles.metric_widgets', 'Active Widgets')}
                    </span>
                    <ProSkeleton className="h-4 w-20 bg-[#c5ff4a]/10" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#7a7a7a] text-[10px] block">
                      {t('pro.profiles.metric_last_sync', 'Last Sync')}
                    </span>
                    <ProSkeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

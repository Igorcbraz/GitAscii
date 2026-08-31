'use client'

import {
  Activity,
  Clock,
  Compass,
  Copy,
  Layers,
  Network,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const ReportsDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  const timeRanges = [
    { id: '7d', label: t('pro.time.7d', '7D') },
    { id: '30d', label: t('pro.time.30d', '30D') },
    { id: '90d', label: t('pro.time.90d', '90D') },
    { id: 'all', label: t('pro.time.all', 'ALL') },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.reports.title', 'Executive Reports & Proof of Reach')}
        subtitle={t(
          'pro.reports.subtitle',
          'Consolidated performance audit, verified telemetry dossier, and publishable proof-of-reach cards.'
        )}
        center={
          <div className="flex items-center gap-px bg-white/[0.04] p-0.5 rounded border border-white/[0.08]">
            {timeRanges.map((tab, idx) => (
              <span
                key={tab.id}
                className={`px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-sm ${
                  idx === 1 ? 'bg-[#c5ff4a] text-black font-semibold' : 'text-[#8a8a8a]'
                }`}
              >
                {tab.label}
              </span>
            ))}
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-black bg-[#c5ff4a] rounded shadow-[0_0_12px_rgba(197,255,74,0.2)]">
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t('pro.reports.share_card', 'Share Performance Card')}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] rounded">
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t('pro.reports.copy_dossier', 'Copy Dossier')}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/[0.08] rounded">
              <Printer className="w-3.5 h-3.5" />
            </div>
          </div>
        }
      />

      <div className="flex-1 p-5 xl:p-7 space-y-5">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded border border-[#c5ff4a]/15 bg-[#c5ff4a]/[0.03]">
          <div className="flex items-center gap-2.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#c5ff4a] shrink-0" />
            <span className="text-xs font-semibold text-white">
              {t('pro.reports.proof_of_reach_title', 'Developer Proof of Reach')}
            </span>
            <ProBadge variant="lime" size="sm">
              {t('pro.reports.png_dimension_badge', '1200×630 PNG')}
            </ProBadge>
          </div>
          <div className="px-3 py-1 rounded bg-white/[0.06] border border-white/10 text-xs font-medium text-white whitespace-nowrap shrink-0">
            {t('pro.reports.export_image', 'Export Image')}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t('pro.reports.dossier_title', 'GitAscii Profile Performance Dossier')}
              </h2>
              <ProBadge variant="lime" size="sm">
                {t('pro.reports.verified_pro', 'Verified Pro')}
              </ProBadge>
            </div>
            <div className="flex items-center gap-2">
              <ProSkeleton className="h-2.5 w-40" />
              <ProSkeleton className="h-2.5 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right space-y-1">
              <span className="text-[9px] text-[#5a5a5a] uppercase tracking-wider block">
                {t('pro.reports.audit_timestamp', 'Audit Timestamp')}
              </span>
              <ProSkeleton className="h-3 w-36 ml-auto" />
            </div>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded whitespace-nowrap">
              {t('pro.reports.cookieless_tag', '100% Cookieless')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
          {[
            { label: t('pro.reports.kpi_impressions', 'Total Impressions') },
            { label: t('pro.reports.kpi_unique', 'Unique Visitors') },
            { label: t('pro.reports.kpi_cache', 'Cache Hit Ratio') },
            { label: t('pro.reports.kpi_latency', 'Synthesis Latency') },
          ].map(({ label }) => (
            <div key={label} className="bg-[#0c0c0c] px-5 py-4 space-y-1.5 font-mono">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
              <ProSkeleton className="h-6 w-20" />
              <ProSkeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.reports.channel_title', 'Delivery Channel & Routing')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#555]">
                {t('pro.reports.camo_vs_direct', 'GitHub Camo vs Direct')}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden flex">
              <div className="h-full bg-purple-400 w-3/4 rounded-l-full" />
              <div className="h-full bg-[#c5ff4a] w-1/4 rounded-r-full" />
            </div>
            <div className="space-y-2 pt-1">
              {[
                { w: '75%', lw: 'w-32' },
                { w: '25%', lw: 'w-24' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <ProSkeleton className={`h-2.5 ${item.lw}`} />
                    <ProSkeleton className="h-2.5 w-8" />
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c5ff4a]/50 rounded-full"
                      style={{ width: item.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.reports.status_codes_title', 'HTTP Status Code Breakdown')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#555]">
                {t('pro.reports.edge_health_sub', 'Edge Response Health')}
              </span>
            </div>
            <div className="space-y-2">
              {[
                { w: '85%', lw: 'w-24' },
                { w: '15%', lw: 'w-20' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <ProSkeleton className={`h-2.5 ${item.lw}`} />
                    <ProSkeleton className="h-2.5 w-8" />
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c5ff4a]/50 rounded-full"
                      style={{ width: item.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.reports.origin_breakdown_title', 'Origin & Traffic Breakdown')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#555]">
                {t('pro.reports.referrer_domains', 'Referrer Domains')}
              </span>
            </div>
            <div className="space-y-2">
              {[
                { w: '80%', lw: 'w-28' },
                { w: '20%', lw: 'w-20' },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <ProSkeleton className={`h-2.5 ${item.lw}`} />
                    <ProSkeleton className="h-2.5 w-8" />
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#c5ff4a]/50 rounded-full"
                      style={{ width: item.w }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.reports.peak_windows_title', 'Peak Engagement Windows')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#555]">
                {t('pro.reports.github_traffic_times', 'GitHub Traffic Times')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-1.5">
                  <ProSkeleton className="h-2 w-20" />
                  <ProSkeleton className="h-5 w-24" />
                  <ProSkeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                {t('pro.reports.profile_breakdown_title', 'Active Profile Breakdown')}
              </h3>
            </div>
            <ProSkeleton className="h-2.5 w-28" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[#555] font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-4 w-[28%]">
                    {t('pro.table.profile_name', 'Profile Name')}
                  </th>
                  <th className="py-2.5 px-4 w-[18%] hidden sm:table-cell">
                    {t('pro.reports.th_slug', 'Slug')}
                  </th>
                  <th className="py-2.5 px-4 w-[16%] hidden md:table-cell">
                    {t('pro.profiles.title', 'Widgets')}
                  </th>
                  <th className="py-2.5 px-4 w-[20%]">
                    {t('pro.table.portfolio_share', 'Traffic Share')}
                  </th>
                  <th className="py-2.5 px-4 w-[10%]">{t('common.status', 'Status')}</th>
                  <th className="py-2.5 px-4 w-[12%] text-right">
                    {t('pro.table.views', 'Views')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                {[...Array(3)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4">
                      <ProSkeleton className="h-3.5 w-28" />
                    </td>
                    <td className="py-2.5 px-4 hidden sm:table-cell">
                      <ProSkeleton className="h-3 w-20" />
                    </td>
                    <td className="py-2.5 px-4 hidden md:table-cell">
                      <ProSkeleton className="h-3 w-16" />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[72px] h-px bg-white/10 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${idx === 0 ? 65 : idx === 1 ? 25 : 10}%` }}
                            className="h-full bg-[#c5ff4a]"
                          />
                        </div>
                        <ProSkeleton className="h-2.5 w-6" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <ProBadge variant="emerald" size="sm">
                        {t('pro.profiles.badge_active', 'active')}
                      </ProBadge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <ProSkeleton className="h-3.5 w-14 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] text-[#5a5a5a]">
              <strong className="text-[#7a7a7a]">
                {t('pro.reports.footer_audit_title', 'Verified Telemetry Audit:')}{' '}
              </strong>
              {t(
                'pro.reports.footer_audit_desc',
                '100% cookieless tracking, zero IP retention, and daily rotating cryptographic salts.'
              )}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#3a3a3a] shrink-0">
            {t('pro.reports.footer_engine_signature', 'Signed by GitAscii Edge Engine')}
          </span>
        </div>
      </div>
    </div>
  )
}

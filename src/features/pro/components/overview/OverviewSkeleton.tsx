'use client'

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  Cpu,
  Eye,
  Layers,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const OverviewDashboardSkeleton: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="flex-1 flex flex-col overflow-y-auto h-screen">
      <ProHeader
        title={t('pro.overview.title', 'Overview')}
        subtitle={t(
          'pro.overview.subtitle',
          'Unified telemetry, profile health, and operational activity across your GitAscii stack.'
        )}
        actions={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-[#8a8a8a]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/80">
                {t('pro.overview.live_telemetry', 'Edge Telemetry Live')}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#8a8a8a]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c5ff4a]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/90">
              <span>{t('pro.nav.analytics', 'Analytics')}</span>
              <ArrowRight className="w-3 h-3 text-[#c5ff4a]" />
            </div>
          </div>
        }
      />

      <div className="p-5 xl:p-7 space-y-6 w-full min-w-0 max-w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
          <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                {t('pro.kpi.total_requests', 'Total Image Requests')}
              </span>
              <Eye className="w-3.5 h-3.5 text-[#c5ff4a]" />
            </div>
            <ProSkeleton className="h-6 w-20 bg-[#c5ff4a]/10" />
            <div className="flex items-center gap-1.5 text-[10px]">
              <ProSkeleton className="h-3 w-10 bg-emerald-500/10" />
              <span className="text-[#555]">{t('pro.kpi.vs_past_period', 'vs past period')}</span>
            </div>
          </div>

          <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                {t('pro.kpi.unique_sources', 'Est. Unique Sources')}
              </span>
              <Users className="w-3.5 h-3.5 text-[#8a8a8a]" />
            </div>
            <ProSkeleton className="h-6 w-16" />
            <span className="text-[10px] text-[#555] block">
              {t('pro.kpi.privacy_hashed', 'privacy-hashed')}
            </span>
          </div>

          <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                {t('pro.kpi.cache_validation', 'Cache Validation (304)')}
              </span>
              <Cpu className="w-3.5 h-3.5 text-[#8a8a8a]" />
            </div>
            <ProSkeleton className="h-6 w-14" />
            <span className="text-[10px] text-[#555] block">
              {t('pro.kpi.fast_edge_cache', 'Fast Edge Cache')}
            </span>
          </div>

          <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                {t('pro.kpi.avg_render', 'Avg Server Latency')}
              </span>
              <Zap className="w-3.5 h-3.5 text-[#8a8a8a]" />
            </div>
            <ProSkeleton className="h-6 w-14" />
            <span className="text-[10px] text-[#555] block">
              {t('pro.kpi.execution_time', 'Execution Time')}
            </span>
          </div>

          <div className="bg-[#0c0c0c] px-4 py-3.5 space-y-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">
                {t('pro.kpi.widget_health', 'Widget Health')}
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <ProSkeleton className="h-6 w-10" />
            <span className="text-[10px] text-[#555] block">
              {t('pro.kpi.all_healthy', 'All systems healthy')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded overflow-hidden border border-white/[0.05]">
          <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="text-[#666] text-[11px]">{t('pro.kpi.peak_day', 'Peak Day:')}</span>
            <ProSkeleton className="h-3.5 w-16" />
          </div>
          <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="text-[#666] text-[11px]">{t('pro.kpi.peak_hour', 'Peak Hour:')}</span>
            <ProSkeleton className="h-3.5 w-20" />
          </div>
          <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="text-[#666] text-[11px]">
              {t('pro.kpi.top_country', 'Top Country:')}
            </span>
            <div className="flex items-center gap-1.5">
              <ProSkeleton className="w-4 h-3 rounded-xs" />
              <ProSkeleton className="h-3.5 w-24" />
            </div>
          </div>
          <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <span className="text-[#666] text-[11px]">
              {t('pro.kpi.top_referrer', 'Top Referrer:')}
            </span>
            <ProSkeleton className="h-3.5 w-20" />
          </div>
        </div>

        <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/[0.06] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h2 className="text-xs font-semibold text-white tracking-tight">
                  {t('pro.trends.title', 'Traffic & Engagement Trends')}
                </h2>
                <ProBadge variant="muted" size="sm">
                  {t('pro.trends.badge', '30 Days')}
                </ProBadge>
              </div>
              <p className="text-[11px] text-[#666] mt-0.5">
                {t(
                  'pro.trends.subtitle',
                  'Aggregated daily profile badge impressions, unique visitors, and cache volume.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <ProSkeleton className="h-5 w-28" />
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c5ff4a]">
                <span>{t('pro.trends.deep_dive', 'Deep Dive')}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="h-[200px] w-full rounded bg-white/[0.01] border border-white/5 p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-x-0 top-12 border-b border-dashed border-white/[0.05]" />
            <div className="absolute inset-x-0 top-24 border-b border-dashed border-white/[0.05]" />
            <div className="absolute inset-x-0 top-36 border-b border-dashed border-white/[0.05]" />

            <div className="absolute inset-0 flex items-end px-2 pb-6 pointer-events-none opacity-30">
              <svg
                className="w-full h-32 overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 1000 200"
              >
                <defs>
                  <linearGradient id="overview-skel-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#c5ff4a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,130 Q200,60 400,100 T700,50 T900,80 L1000,40 L1000,200 L0,200 Z"
                  fill="url(#overview-skel-grad)"
                />
                <path
                  d="M0,130 Q200,60 400,100 T700,50 T900,80 L1000,40"
                  fill="none"
                  stroke="#c5ff4a"
                  strokeWidth="2"
                  strokeOpacity="0.4"
                />
              </svg>
            </div>

            <div className="flex justify-between text-[9px] font-mono text-[#555] pt-1 mt-auto border-t border-white/5 z-10">
              {[...Array(6)].map((_, i) => (
                <ProSkeleton key={i} className="h-2.5 w-12" />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="p-4 rounded border border-white/[0.06] bg-[#0c0c0c] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h3 className="text-xs font-semibold text-white">
                    {t('pro.activity.title', 'Recent Activity')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#666]">
                  {t('pro.activity.live_stream', 'Live Stream')}
                </span>
              </div>

              <div className="space-y-1">
                {[
                  {
                    icon: <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />,
                    border: 'border-[#c5ff4a]/20',
                    bg: 'bg-[#c5ff4a]/10',
                  },
                  {
                    icon: <Mail className="w-3.5 h-3.5 text-cyan-400" />,
                    border: 'border-cyan-500/20',
                    bg: 'bg-cyan-500/10',
                  },
                  {
                    icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
                    border: 'border-amber-500/20',
                    bg: 'bg-amber-500/10',
                  },
                  {
                    icon: <Clock className="w-3.5 h-3.5 text-[#8a8a8a]" />,
                    border: 'border-white/10',
                    bg: 'bg-white/5',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded hover:bg-white/[0.02]"
                  >
                    <div className={`p-1.5 rounded shrink-0 border ${item.border} ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <ProSkeleton className="h-3.5 w-32" />
                        <ProSkeleton className="h-2.5 w-12" />
                      </div>
                      <ProSkeleton className="h-2.5 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="p-4 rounded border border-white/[0.06] bg-[#0c0c0c] space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h3 className="text-xs font-semibold text-white">
                    {t('pro.profiles.title', 'Active Profiles')}
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c5ff4a]">
                  <span>{t('pro.profiles.manage_all', 'Manage All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-1">
                {[...Array(3)].map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ProSkeleton className="h-3.5 w-28" />
                        {idx === 0 && (
                          <ProBadge variant="lime" size="sm">
                            {t('pro.profiles.badge_default', 'Default')}
                          </ProBadge>
                        )}
                      </div>
                      <ProSkeleton className="h-2.5 w-36" />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <ProSkeleton className="h-6 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/90">
                <Plus className="w-3 h-3 text-[#c5ff4a]" />
                <span>{t('pro.profiles.create_new', 'Create New Profile')}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-[#666] pt-1 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong className="text-[#888]">
                {t('pro.compliance.title', 'LGPD & GDPR Compliant:')}{' '}
              </strong>
              {t(
                'pro.compliance.desc',
                'Cookieless telemetry with daily rotating SHA-256 HMAC salt hashes.'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] font-mono shrink-0 text-[#666]">
            <span>{t('pro.nav.analytics', 'Analytics')}</span>
            <span>•</span>
            <span>{t('pro.nav.profiles', 'Profiles')}</span>
            <span>•</span>
            <span>{t('pro.nav.health', 'Widget Errors')}</span>
            <span>•</span>
            <span>{t('pro.nav.emails', 'Email Logs')}</span>
            <span>•</span>
            <span>{t('pro.nav.reports', 'Reports')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

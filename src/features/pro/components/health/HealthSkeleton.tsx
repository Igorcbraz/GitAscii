'use client'

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Clock,
  Layers,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'
import { ProHeader } from '../ProHeader'
import { ProSkeleton } from '../ProSkeleton'

export const HealthSkeleton: React.FC = () => {
  const { t } = useI18n()

  const sections = [
    {
      id: 'overview',
      label: t('pro.health.tab_overview', 'Profiles Health Matrix'),
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: 'widgets',
      label: t('pro.health.tab_widgets', 'Widget Telemetry'),
      icon: <Server className="w-3.5 h-3.5" />,
    },
    {
      id: 'errors',
      label: t('pro.health.tab_incidents', 'Incident Logs'),
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
      id: 'badge',
      label: t('pro.health.tab_badge', 'Status Badge'),
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ]

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-[#0a0a0a] max-w-full">
      <aside className="w-52 lg:w-56 flex-shrink-0 hidden md:flex flex-col justify-between h-screen bg-[#080808] border-r border-white/[0.06] select-none p-3 space-y-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 block">
              {t('pro.analytics.scope', 'Profile Scope')}
            </span>
            <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c5ff4a]/60 animate-pulse" />
                <span className="text-[#ccc] font-medium text-xs">
                  {t('pro.analytics.all_profiles_combined', 'All Profiles Combined')}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#666]" />
            </div>
          </div>

          <div className="space-y-0.5 pt-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#666] px-1 pb-1 block">
              {t('pro.health.title', 'GitAscii Health')}
            </span>
            <nav className="space-y-0.5">
              {sections.map((sec, idx) => {
                const isFirst = idx === 0
                return (
                  <div
                    key={sec.id}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isFirst ? 'bg-white/[0.08] text-white font-medium shadow-xs' : 'text-[#777]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isFirst ? 'text-[#c5ff4a]' : 'text-[#666]'}>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </div>
                  </div>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] font-mono text-[#777] flex items-center justify-between">
          <span>{t('common.status', 'Status')}</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('pro.health.status_operational', 'Operational')}
          </span>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen flex flex-col min-w-0 max-w-full bg-[#0a0a0a]">
        <ProHeader
          title={t('pro.health.title', 'GitAscii Health')}
          subtitle={t(
            'pro.health.subtitle',
            'Full 24/7 widget telemetry, sub-millisecond error diagnostics, and dynamic profile monitoring.'
          )}
          actions={
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-amber-300/60 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <Play className="w-3.5 h-3.5 text-amber-400/50" />
                <span>{t('pro.health.simulate_incident', 'Simulate Incident')}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#666]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#c5ff4a]" />
              </div>
            </div>
          }
        />

        <div className="md:hidden flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto">
          {sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                idx === 0 ? 'bg-[#c5ff4a] text-black font-bold' : 'text-[#777]'
              }`}
            >
              {sec.label}
            </div>
          ))}
        </div>

        <div className="p-5 xl:p-7 space-y-8 w-full min-w-0 max-w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
            <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">
                  {t('pro.health.kpi_system_status', 'System Status')}
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <ProSkeleton className="w-28 h-6 rounded bg-emerald-500/10" />
              <span className="text-[10px] text-[#555] block">
                0 {t('pro.health.active_incidents', 'active incidents')}
              </span>
            </div>

            <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">
                  {t('pro.health.th_success_rate', 'Success Rate')}
                </span>
                <Activity className="w-3 h-3 text-[#c5ff4a]" />
              </div>
              <ProSkeleton className="w-20 h-6 rounded bg-[#c5ff4a]/10" />
              <span className="text-[10px] text-[#555] block">
                {t('pro.health.telemetry_24h', '24h telemetry')}
              </span>
            </div>

            <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">
                  {t('pro.health.kpi_avg_render', 'Avg Render Time')}
                </span>
                <Clock className="w-3 h-3 text-[#555]" />
              </div>
              <ProSkeleton className="w-20 h-6 rounded" />
              <span className="text-[10px] text-[#555] block truncate">
                {t('pro.health.last_render_now', 'Last: Just now')}
              </span>
            </div>

            <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-[#555]">
                  {t('pro.health.th_errors_24h', 'Errors (24h)')}
                </span>
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              </div>
              <ProSkeleton className="w-16 h-6 rounded bg-rose-500/10" />
              <span className="text-[10px] text-[#555] block">
                0 {t('pro.health.total_logged', 'total logged')}
              </span>
            </div>
          </div>

          <div className="w-full rounded border border-white/[0.06] bg-[#0c0c0c] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#c5ff4a]" />
                <h3 className="text-xs font-bold text-white">
                  {t('pro.health.uptime_title', '30-Day Uptime & Health History')}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {t('pro.health.uptime_stat', '100% 30d average uptime')}
              </span>
            </div>

            <div className="flex items-center gap-1 w-full pt-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 h-8 rounded-xs bg-emerald-500/30 animate-pulse" />
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#7a7a7a] pt-1">
              <span>{t('pro.health.30_days_ago', '30 days ago')}</span>
              <span>{t('pro.health.15_days_ago', '15 days ago')}</span>
              <span>{t('pro.health.today', 'Today')}</span>
            </div>
          </div>

          <section id="overview" className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                  {t('pro.health.tab_overview', 'Profiles Health Matrix')}
                </h3>
              </div>
              <ProBadge variant="lime" size="sm">
                2 {t('pro.health.profiles_monitored', 'Profiles Monitored')}
              </ProBadge>
            </div>

            <div className="flex gap-6 overflow-x-hidden pb-3">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="p-4 rounded bg-[#0c0c0c] border border-white/[0.06] flex flex-col justify-between space-y-4 flex-shrink-0 w-[min(100%,520px)] h-[480px]"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <ProSkeleton className="w-24 h-4 rounded" />
                      {idx === 1 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white font-semibold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <ProBadge variant="emerald" size="sm">
                      {t('pro.health.status_operational', 'OPERATIONAL')}
                    </ProBadge>
                  </div>

                  <div className="grid grid-cols-4 gap-px bg-white/[0.04] rounded overflow-hidden text-center font-mono text-xs">
                    <div className="bg-[#0c0c0c] py-2">
                      <span className="text-[10px] text-[#7a7a7a] block uppercase">
                        {t('pro.health.th_health', 'Health')}
                      </span>
                      <span className="font-bold text-emerald-400">100%</span>
                    </div>
                    <div className="bg-[#0c0c0c] py-2">
                      <span className="text-[10px] text-[#7a7a7a] block uppercase">
                        {t('pro.health.th_renders', 'Renders')}
                      </span>
                      <span className="font-bold text-white">1.2k</span>
                    </div>
                    <div className="bg-[#0c0c0c] py-2">
                      <span className="text-[10px] text-[#7a7a7a] block uppercase">
                        {t('pro.health.th_latency', 'Latency')}
                      </span>
                      <span className="font-bold text-white">24ms</span>
                    </div>
                    <div className="bg-[#0c0c0c] py-2">
                      <span className="text-[10px] text-[#7a7a7a] block uppercase">
                        {t('common.status', 'Status')}
                      </span>
                      <span className="font-bold text-emerald-400">
                        100% {t('pro.common.ok', 'OK')}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 rounded bg-[#080808] border border-white/[0.08] p-4 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-3">
                      <ProSkeleton className="w-10 h-10 rounded bg-white/10" />
                      <div className="space-y-1.5 flex-1">
                        <ProSkeleton className="w-32 h-3.5 rounded bg-white/10" />
                        <ProSkeleton className="w-48 h-2.5 rounded bg-white/5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <ProSkeleton className="h-14 rounded bg-white/[0.04]" />
                      <ProSkeleton className="h-14 rounded bg-white/[0.04]" />
                    </div>
                    <ProSkeleton className="h-16 rounded bg-white/[0.04]" />
                  </div>

                  <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">
                        {t('pro.health.all_healthy_pass', 'All widgets operational & healthy')}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60">
                      {t('pro.health.telemetry_pass_100', '100% pass')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="widgets" className="w-full space-y-4">
            <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                    {t('pro.health.widgets_table_title', 'Widget Health & Performance Telemetry')}
                  </h3>
                </div>
                <ProBadge variant="muted" size="sm">
                  5 {t('pro.health.widgets_monitored', 'Widgets Monitored')}
                </ProBadge>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs font-mono table-fixed">
                  <thead>
                    <tr className="border-b border-white/10 text-[#7a7a7a] uppercase text-[10px]">
                      <th className="pb-3 pl-4 w-[240px]">
                        {t('pro.health.th_widget', 'Widget Name')}
                      </th>
                      <th className="pb-3 w-[110px]">{t('pro.health.th_profile', 'Profile')}</th>
                      <th className="pb-3 w-[110px]">{t('pro.health.th_status', 'Status')}</th>
                      <th className="pb-3 w-[85px]">{t('pro.health.th_latency', 'Latency')}</th>
                      <th className="pb-3 w-[130px]">
                        {t('pro.health.th_success_rate', 'Success Rate')}
                      </th>
                      <th className="pb-3 w-[90px]">
                        {t('pro.health.th_errors_24h', 'Errors (24h)')}
                      </th>
                      <th className="pb-3 w-[100px]">
                        {t('pro.health.th_last_render', 'Last Render')}
                      </th>
                      <th className="pb-3 pr-4 w-[140px]">
                        {t('pro.health.th_health_score', 'Health Score')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: 'Developer Bio & Avatar', id: 'bio', latency: '18ms' },
                      { name: 'GitHub Stats Cards', id: 'stats', latency: '24ms' },
                      {
                        name: 'Contribution Snake Game',
                        id: 'contribution-snake',
                        latency: '32ms',
                      },
                      { name: 'Top Languages Radar', id: 'languages', latency: '21ms' },
                      { name: 'Repository Showcase', id: 'repositories', latency: '26ms' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 pl-4">
                          <div className="space-y-1">
                            <span className="text-white font-medium block">{row.name}</span>
                            <span className="text-[#7a7a7a] text-[10px] block">ID: {row.id}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-cyan-300 font-mono">
                            /default
                          </span>
                        </td>
                        <td className="py-3">
                          <ProBadge variant="emerald" size="sm">
                            {t('pro.health.status_operational', 'OPERATIONAL')}
                          </ProBadge>
                        </td>
                        <td className="py-3 font-semibold text-white font-mono">{row.latency}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 rounded-full bg-emerald-400/80" />
                            <span className="text-[11px] font-bold text-white">100%</span>
                          </div>
                        </td>
                        <td className="py-3 font-mono text-[#7a7a7a]">0</td>
                        <td className="py-3 text-[#7a7a7a] text-[10px]">
                          {t('pro.health.last_render_now', 'Just now')}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 rounded-full bg-emerald-400/80" />
                            <span className="text-[10px] font-bold font-mono text-emerald-400">
                              ● 100%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </section>

          <section id="errors" className="w-full space-y-4">
            <div className="rounded border border-emerald-500/20 bg-emerald-500/5 px-6 py-8 text-center space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
              <h3 className="text-xs font-bold text-white">
                {t('pro.health.no_incidents_title', 'All Widgets & Profiles Healthy')}
              </h3>
              <p className="text-[11px] text-[#5a5a5a] max-w-sm mx-auto">
                {t(
                  'pro.health.no_incidents_desc',
                  'Zero widget rendering failures or timeouts detected in this scope.'
                )}
              </p>
            </div>
          </section>

          <section id="badge" className="w-full space-y-4">
            <section className="rounded border border-white/[0.06] bg-[#0c0c0c] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5ff4a]" />
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
                      {t('pro.health.badge_title', 'Real-Time Health Status Badge')}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-[#7a7a7a] tracking-wider">
                    {t('pro.health.badge_preview_label', 'Live Uptime & Health Badge')}
                  </span>
                  <ProBadge variant="lime" size="sm">
                    {t('pro.health.badge_vector_tag', 'SVG Dynamic (100% Vector)')}
                  </ProBadge>
                </div>

                <div className="w-full flex items-center justify-center p-6 rounded bg-white/[0.02] border border-white/5">
                  <ProSkeleton className="h-8 w-44 rounded" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <ProSkeleton className="w-24 h-3 rounded" />
                    <ProSkeleton className="w-16 h-3 rounded" />
                  </div>
                  <ProSkeleton className="w-full h-10 rounded bg-black/50" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <ProSkeleton className="w-24 h-3 rounded" />
                    <ProSkeleton className="w-16 h-3 rounded" />
                  </div>
                  <ProSkeleton className="w-full h-10 rounded bg-black/50" />
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  )
}

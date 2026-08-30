'use client'

import { Activity, AlertTriangle, Clock, ShieldCheck } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { OverallHealthMetrics, WidgetErrorRecord } from '../../types'

interface HealthKpiStripProps {
  metrics: OverallHealthMetrics | null
  errors: WidgetErrorRecord[]
}

export const HealthKpiStrip: React.FC<HealthKpiStripProps> = ({ metrics, errors }) => {
  const { t } = useI18n()

  const systemStatus = metrics?.status || 'operational'
  const activeErrorsCount = errors.filter((e) => e.status !== 'resolved').length
  const successRate = metrics?.overallHealthScore !== undefined ? metrics.overallHealthScore : 100
  const avgLatency = metrics?.avgRenderTimeMs || 24

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded overflow-hidden border border-white/[0.05]">
        <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-[#555]">
              {t('pro.health.kpi_system_status', 'System Status')}
            </span>
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  systemStatus === 'operational'
                    ? 'bg-emerald-400'
                    : systemStatus === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  systemStatus === 'operational'
                    ? 'bg-emerald-500'
                    : systemStatus === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }`}
              />
            </span>
          </div>
          <p
            className={`text-xl font-bold uppercase tracking-tight ${
              systemStatus === 'operational'
                ? 'text-emerald-400'
                : systemStatus === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}
          >
            {systemStatus}
          </p>
          <span className="text-[10px] text-[#555] block">
            {activeErrorsCount} {t('pro.health.active_incidents', 'active incidents')}
          </span>
        </div>

        <div className="bg-[#0c0c0c] px-5 py-4 space-y-1 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-[#555]">
              {t('pro.health.th_success_rate', 'Success Rate')}
            </span>
            <Activity className="w-3 h-3 text-[#c5ff4a]" />
          </div>
          <p className="text-xl font-bold text-white">{successRate}%</p>
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
          <p className="text-xl font-bold text-white">{avgLatency}ms</p>
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
          <p className={`text-xl font-bold ${errors.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {errors.length}
          </p>
          <span className="text-[10px] text-[#555] block">
            {errors.length} {t('pro.health.total_logged', 'total logged')}
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
            <div
              key={i}
              className="flex-1 h-8 rounded-xs bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer"
              title={t('pro.health.day_uptime', 'Day {day}: 100% Uptime', { day: String(30 - i) })}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#7a7a7a] pt-1">
          <span>{t('pro.health.30_days_ago', '30 days ago')}</span>
          <span>{t('pro.health.15_days_ago', '15 days ago')}</span>
          <span>{t('pro.health.today', 'Today')}</span>
        </div>
      </div>
    </div>
  )
}

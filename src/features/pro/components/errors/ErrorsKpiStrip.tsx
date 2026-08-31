'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { WidgetErrorRecord } from '../../types'

interface ErrorsKpiStripProps {
  errors: WidgetErrorRecord[]
  activeErrors: WidgetErrorRecord[]
  totalOccurrences: number
}

export const ErrorsKpiStrip: React.FC<ErrorsKpiStripProps> = ({
  errors,
  activeErrors,
  totalOccurrences,
}) => {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#111111] border border-white/[0.08] font-mono text-xs">
        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
            {t('pro.errors.active_incidents', 'Active Incidents')}
          </span>
          <p
            className={`text-lg font-bold ${
              activeErrors.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {activeErrors.length}
          </p>
          <span className="text-[10px] text-[#7a7a7a] block">
            {activeErrors.length === 0
              ? t('pro.errors.optimal', 'Optimal')
              : t('pro.errors.requires_attention', 'Requires Attention')}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
            {t('pro.errors.total_logged', 'Total Logged')}
          </span>
          <p className="text-lg font-bold text-white">{errors.length}</p>
          <span className="text-[10px] text-[#7a7a7a] block">
            {t('pro.errors.retention_90d', '90-Day Retention')}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
            {t('pro.errors.total_occurrences', 'Total Occurrences')}
          </span>
          <p className="text-lg font-bold text-[#c5ff4a]">{totalOccurrences}</p>
          <span className="text-[10px] text-[#7a7a7a] block">
            {t('pro.errors.deduplicated', 'Deduplicated')}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] uppercase tracking-wider text-[#7a7a7a]">
            {t('pro.errors.health_status', 'Health Status')}
          </span>
          <p className="text-lg font-bold text-white">
            {activeErrors.length === 0 ? '100%' : `${Math.max(0, 100 - activeErrors.length * 10)}%`}
          </p>
          <span className="text-[10px] text-[#7a7a7a] block">
            {t('pro.errors.automated_alerts', 'Automated Alerts')}
          </span>
        </div>
      </div>

      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
          activeErrors.length === 0
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {activeErrors.length === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white truncate text-xs">
              {activeErrors.length === 0
                ? t(
                    'pro.errors.all_widgets_healthy',
                    'All GitHub README widgets are rendering without errors.'
                  )
                : t(
                    'pro.errors.active_failures_detected',
                    '{count} active widget failure(s) detected.',
                    { count: String(activeErrors.length) }
                  )}
            </p>
            <p className="text-[11px] text-white/70 truncate">
              {t(
                'pro.errors.cooldown_desc',
                'Automated email alerts are active with 1-hour cooldown deduplication.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
          <span>
            {t('pro.errors.total_label', 'Total:')} {errors.length}
          </span>
          <span>•</span>
          <span>
            {t('pro.errors.active_label', 'Active:')} {activeErrors.length}
          </span>
        </div>
      </div>
    </div>
  )
}

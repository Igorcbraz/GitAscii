'use client'

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Mail,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ActivityEvent, ProOverviewData } from '../../types'

interface OverviewActivityCardProps {
  data: ProOverviewData | null
}

function formatRelativeTime(
  timestamp: string,
  t: (k: string, d?: string, v?: Record<string, string>) => string
): string {
  try {
    const diffMs = Date.now() - new Date(timestamp).getTime()
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 30) return t('pro.time.just_now', 'Just now')
    if (seconds < 60) return t('pro.time.seconds_ago', '{s}s ago', { s: String(seconds) })
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return t('pro.time.minutes_ago', '{m}m ago', { m: String(minutes) })
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return t('pro.time.hours_ago', '{h}h ago', { h: String(hours) })
    const days = Math.floor(hours / 24)
    if (days < 7) return t('pro.time.days_ago', '{d}d ago', { d: String(days) })
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return timestamp
  }
}

function getActivityIcon(type: ActivityEvent['type']) {
  switch (type) {
    case 'error_detected':
      return (
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
      )
    case 'error_resolved':
      return (
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      )
    case 'email_sent':
      return (
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Mail className="w-3.5 h-3.5" />
        </div>
      )
    case 'view_spike':
      return (
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      )
    case 'profile_created':
    case 'profile_updated':
      return (
        <div className="p-1.5 rounded-lg bg-[#c5ff4a]/10 text-[#c5ff4a] border border-[#c5ff4a]/20">
          <Layers className="w-3.5 h-3.5" />
        </div>
      )
    default:
      return (
        <div className="p-1.5 rounded-lg bg-white/5 text-[#8a8a8a] border border-white/10">
          <Clock className="w-3.5 h-3.5" />
        </div>
      )
  }
}

export const OverviewActivityCard: React.FC<OverviewActivityCardProps> = ({ data }) => {
  const { t } = useI18n()
  const activeErrors = data?.activeErrorsCount ?? 0

  return (
    <section className="p-4 rounded border border-white/[0.06] bg-[#0c0c0c] space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-xs font-semibold text-white">
              {t('pro.overview.recent_activity', 'Recent Activity')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#666]">
            {t('pro.overview.live_stream', 'Live Stream')}
          </span>
        </div>

        <div className="space-y-1">
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-white/[0.02] transition-colors"
              >
                <div className="shrink-0">{getActivityIcon(act.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-white truncate">{act.title}</p>
                    <span className="text-[10px] font-mono text-[#666] shrink-0">
                      {formatRelativeTime(act.timestamp, t)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8a8a8a] truncate">{act.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#8a8a8a] py-6 text-center bg-white/[0.01] rounded border border-dashed border-white/5">
              {t('pro.overview.no_activity', 'No activity events recorded yet.')}
            </div>
          )}
        </div>
      </div>

      {activeErrors > 0 ? (
        <div className="pt-2">
          <Link
            href="/pro/errors"
            className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-xs font-medium text-rose-300 transition-colors"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>
              {t('pro.overview.review_errors', 'Review {count} active error(s)', {
                count: String(activeErrors),
              })}
            </span>
          </Link>
        </div>
      ) : null}
    </section>
  )
}

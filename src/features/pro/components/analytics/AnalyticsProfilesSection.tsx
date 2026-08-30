'use client'

import { Laptop } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary } from '../../types'
import { ProBadge } from '../ProBadge'

interface AnalyticsProfilesSectionProps {
  summary: AnalyticsSummary | null
}

export const AnalyticsProfilesSection: React.FC<AnalyticsProfilesSectionProps> = ({ summary }) => {
  const { t } = useI18n()

  return (
    <section id="profiles" className="space-y-6 scroll-mt-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-[#c5ff4a]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {t('pro.analytics.profiles_title', 'Profile Performance & Cache Efficiency')}
          </h2>
        </div>
        <ProBadge variant="lime">{t('pro.analytics.profiles_badge', 'Multi-Profile')}</ProBadge>
      </div>

      <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {t('pro.analytics.profiles_breakdown', 'Profile Breakdown Matrix')}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.profiles_breakdown_desc',
                'Comparative analytics across all configured GitAscii profiles.'
              )}
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 text-[#8a8a8a]">
              <th className="pb-3 font-semibold">
                {t('pro.analytics.th_profile_name', 'Profile Name')}
              </th>
              <th className="pb-3 font-semibold">{t('pro.analytics.th_views', 'Requests')}</th>
              <th className="pb-3 font-semibold">
                {t('pro.analytics.th_uniques', 'Est. Unique Sources')}
              </th>
              <th className="pb-3 font-semibold">
                {t('pro.analytics.th_cache_hit', 'Cache Hit Ratio')}
              </th>
              <th className="pb-3 font-semibold">
                {t('pro.analytics.th_avg_latency', 'Avg. Latency')}
              </th>
              <th className="pb-3 font-semibold">
                {t('pro.analytics.th_share', 'Portfolio Share')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {summary?.topProfiles && summary.topProfiles.length > 0 ? (
              summary.topProfiles.map((prof) => (
                <tr key={prof.slug} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-medium text-white font-sans flex items-center gap-2">
                    <span>{prof.name}</span>
                    <span className="text-[11px] font-mono text-[#8a8a8a]">({prof.slug})</span>
                  </td>
                  <td className="py-3 text-white font-semibold">{prof.views.toLocaleString()}</td>
                  <td className="py-3 text-emerald-400">{prof.uniques.toLocaleString()}</td>
                  <td className="py-3 text-cyan-400">{prof.cacheHitRatio}%</td>
                  <td className="py-3 text-[#8a8a8a]">{prof.avgLatencyMs}ms</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-[#c5ff4a] rounded-full"
                          style={{ width: `${Math.max(prof.percentage, 4)}%` }}
                        />
                      </div>
                      <span className="text-white/80">{prof.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#8a8a8a]">
                  {t('pro.overview.no_profiles', 'No profiles configured yet.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

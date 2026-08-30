'use client'

import { Layers } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import { ProBadge } from '../ProBadge'

interface ProfileSummaryItem {
  slug: string
  name: string
  views: number
  widgetsCount: number
  status: string
}

interface ReportsProfilesSummaryProps {
  profilesSummary: ProfileSummaryItem[]
  totalProfileViews: number
}

export const ReportsProfilesSummary: React.FC<ReportsProfilesSummaryProps> = ({
  profilesSummary,
  totalProfileViews,
}) => {
  const { t } = useI18n()

  return (
    <section className="rounded border border-white/[0.06] bg-[#0c0c0c]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white">
            {t('pro.reports.active_profile_breakdown', 'Active Profile Breakdown')}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#555]">
          {t('pro.reports.profiles_monitored', '{count} Profiles Monitored', {
            count: String(profilesSummary.length || 0),
          })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-xs text-left">
          <thead>
            <tr className="border-b border-white/[0.05] text-[#555] font-mono text-[10px] uppercase tracking-wider">
              <th className="py-2.5 px-4 w-[28%]">
                {t('pro.reports.th_profile_name', 'Profile Name')}
              </th>
              <th className="py-2.5 px-4 w-[18%] hidden sm:table-cell">
                {t('pro.reports.th_slug', 'Slug')}
              </th>
              <th className="py-2.5 px-4 w-[16%] hidden md:table-cell">
                {t('pro.common.widgets', 'Widgets')}
              </th>
              <th className="py-2.5 px-4 w-[20%]">
                {t('pro.reports.th_traffic_share', 'Traffic Share')}
              </th>
              <th className="py-2.5 px-4 w-[10%]">{t('pro.errors.th_status', 'Status')}</th>
              <th className="py-2.5 px-4 w-[12%] text-right">{t('pro.common.views', 'Views')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
            {profilesSummary.map((p) => {
              const sharePct = Math.round((p.views / totalProfileViews) * 100)
              return (
                <tr key={p.slug} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 font-sans font-medium text-white truncate text-xs">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-4 text-[#6a6a6a] truncate hidden sm:table-cell">
                    /{p.slug}
                  </td>
                  <td className="py-2.5 px-4 text-[#6a6a6a] hidden md:table-cell">
                    {p.widgetsCount} {t('pro.common.widgets', 'widgets')}
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[72px] h-px bg-white/10 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, sharePct)}%` }}
                          className="h-full bg-[#c5ff4a]"
                        />
                      </div>
                      <span className="text-[10px] text-[#6a6a6a] tabular-nums">{sharePct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <ProBadge variant="emerald" size="sm">
                      {p.status}
                    </ProBadge>
                  </td>
                  <td className="py-2.5 px-4 text-right text-white font-bold tabular-nums">
                    {p.views.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

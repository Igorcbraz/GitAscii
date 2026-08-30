'use client'

import { ArrowRight, Layers, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { useI18n } from '@/i18n'

import type { ProOverviewData } from '../../types'
import { ProBadge } from '../ProBadge'

interface OverviewProfilesCardProps {
  data: ProOverviewData | null
}

export const OverviewProfilesCard: React.FC<OverviewProfilesCardProps> = ({ data }) => {
  const { t } = useI18n()

  return (
    <section className="p-4 rounded border border-white/[0.06] bg-[#0c0c0c] space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#c5ff4a]" />
            <h3 className="text-xs font-semibold text-white">
              {t('pro.overview.active_profiles', 'Active Profiles')}
            </h3>
          </div>
          <Link
            href="/pro/profiles"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#c5ff4a] hover:underline"
          >
            <span>{t('pro.overview.manage_all', 'Manage All')}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-1">
          {data?.topProfiles && data.topProfiles.length > 0 ? (
            data.topProfiles.map((prof) => (
              <div
                key={prof.slug}
                className="flex items-center justify-between p-2 rounded hover:bg-white/[0.02] transition-colors"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">{prof.name}</span>
                    {prof.isDefault && (
                      <ProBadge variant="lime" size="sm">
                        {t('pro.common.default', 'Default')}
                      </ProBadge>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-[#666] truncate">
                    /{prof.slug} • {prof.widgetsCount} {t('pro.common.widgets', 'widgets')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono font-medium text-white/90 bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded">
                    {prof.totalViews.toLocaleString()} {t('pro.common.views', 'views')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#8a8a8a] py-6 text-center bg-white/[0.01] rounded border border-dashed border-white/5">
              {t('pro.overview.no_profiles', 'No profiles configured yet.')}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Link
          href="/pro/profiles"
          className="w-full flex items-center justify-center gap-1.5 p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-white/90 transition-colors"
        >
          <Plus className="w-3 h-3 text-[#c5ff4a]" />
          <span>{t('pro.overview.create_profile', 'Create New Profile')}</span>
        </Link>
      </div>
    </section>
  )
}

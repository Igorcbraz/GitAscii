'use client'

import { Compass, Cpu } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary } from '../../types'
import { DimensionRanking, StackedRatioBar } from '../charts/BarChart'
import { DonutChart } from '../charts/DonutChart'
import { ProBadge } from '../ProBadge'

interface AnalyticsTechSourcesSectionProps {
  summary: AnalyticsSummary | null
}

export const AnalyticsTechSourcesSection: React.FC<AnalyticsTechSourcesSectionProps> = ({
  summary,
}) => {
  const { t } = useI18n()

  return (
    <>
      <section id="technology" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#c5ff4a]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {t('pro.analytics.tech_title', 'Observed Request Metadata')}
            </h2>
          </div>
          <ProBadge variant="lime">
            {t('pro.analytics.tech_badge', 'Proxy & Direct Clients')}
          </ProBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.delivery_mode', 'Request Delivery Mode')}
              </h3>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.analytics.delivery_mode_desc',
                  'GitHub Camo Proxy (README views) vs Direct HTTP (Portfolio / external embeds).'
                )}
              </p>
            </div>

            <div className="pt-2">
              <DonutChart
                data={
                  summary?.trafficTypes && summary.trafficTypes.length > 0
                    ? summary.trafficTypes
                    : [
                        {
                          name: t('pro.analytics.github_camo', 'GitHub Camo Proxy'),
                          key: 'camo',
                          count: summary?.camoRatio || 0,
                          percentage: summary?.camoRatio || 0,
                        },
                        {
                          name: t('pro.analytics.direct_traffic', 'Direct / External Embed'),
                          key: 'direct',
                          count: summary?.directRatio || 0,
                          percentage: summary?.directRatio || 0,
                        },
                      ]
                }
                title={t('pro.analytics.traffic_type', 'Traffic Origin')}
                size={150}
              />
            </div>

            <div className="pt-2 border-t border-white/5">
              <StackedRatioBar
                labelLeft={t('pro.analytics.github_camo', 'GitHub Camo')}
                valueLeft={summary?.camoRatio || 0}
                labelRight={t('pro.analytics.direct', 'Direct / Ext')}
                valueRight={summary?.directRatio || 0}
                colorLeft="#c084fc"
                colorRight="#c5ff4a"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {t('pro.analytics.os_title', 'Observed Platform / Environment')}
                </h3>
                <span className="text-[10px] font-mono text-[#8a8a8a] bg-white/5 px-1.5 py-0.5 rounded">
                  {t('pro.analytics.estimated', 'Estimated')}
                </span>
              </div>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.analytics.os_desc',
                  'Environment reported in headers (GitHub Cloud for Camo, client OS for direct).'
                )}
              </p>
            </div>

            <div className="pt-2">
              <DimensionRanking
                items={summary?.topOs || []}
                label={t('pro.analytics.os_title', 'Operating Systems')}
                maxItems={5}
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {t('pro.analytics.browsers_title', 'Observed Clients & Locales')}
                </h3>
                <span className="text-[10px] font-mono text-[#8a8a8a] bg-white/5 px-1.5 py-0.5 rounded">
                  {t('pro.analytics.estimated', 'Estimated')}
                </span>
              </div>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.analytics.browsers_desc',
                  'Client user-agents and preferred languages (proxy headers vs direct client headers).'
                )}
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <DimensionRanking
                items={summary?.topBrowsers || []}
                label={t('pro.analytics.browsers_label', 'Clients')}
                maxItems={3}
              />

              {summary?.topLanguages && summary.topLanguages.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <span className="text-xs font-semibold text-white block mb-2">
                    {t('pro.analytics.languages_title', 'Observed Languages')}
                  </span>
                  <DimensionRanking
                    items={summary.topLanguages}
                    label={t('pro.analytics.languages_label', 'Languages')}
                    maxItems={3}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="sources" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c5ff4a]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {t('pro.analytics.sources_title', 'Inbound Sources & Channels')}
            </h2>
          </div>
          <ProBadge variant="lime">{t('pro.analytics.sources_badge', 'Inbound Requests')}</ProBadge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.top_referrers', 'Inbound Sources & Referrers')}
              </h3>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {t(
                  'pro.analytics.top_referrers_desc',
                  'Where your README badge and profile requests originate from.'
                )}
              </p>
            </div>

            <DimensionRanking
              items={summary?.topSources || []}
              label={t('pro.analytics.referrers_label', 'Referrers')}
              showSearch={true}
              maxItems={8}
            />
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.channel_dist', 'Traffic Channel Distribution')}
              </h3>
              <p className="text-xs text-[#8a8a8a] mt-0.5">
                {t('pro.analytics.channel_dist_desc', 'Categorized traffic channels.')}
              </p>
            </div>

            <DonutChart
              data={summary?.topSources || []}
              title={t('pro.analytics.channel_label', 'Channel')}
              size={160}
            />
          </div>
        </div>
      </section>
    </>
  )
}

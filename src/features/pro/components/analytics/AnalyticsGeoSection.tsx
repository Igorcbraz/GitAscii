'use client'

import { Globe2, Info } from 'lucide-react'
import React, { useState } from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary } from '../../types'
import { formatLocalizedCountry } from '../../utils/proFormatters'
import { DimensionRanking } from '../charts/BarChart'
import { WorldMap } from '../charts/WorldMap'
import { ProBadge } from '../ProBadge'

interface AnalyticsGeoSectionProps {
  summary: AnalyticsSummary | null
  selectedCountryCode: string | null
  setSelectedCountryCode: (code: string | null) => void
}

export const AnalyticsGeoSection: React.FC<AnalyticsGeoSectionProps> = ({
  summary,
  selectedCountryCode,
  setSelectedCountryCode,
}) => {
  const { t, language } = useI18n()
  const [showOriginNotice, setShowOriginNotice] = useState(false)

  return (
    <section id="geography" className="space-y-6 scroll-mt-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-[#c5ff4a]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {t('pro.analytics.geo_title', 'Geographic Reach')}
          </h2>
        </div>
        <ProBadge variant="lime">{t('pro.analytics.geo_badge', 'Global Heatmap')}</ProBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.geo_intensity', 'Global Visitor Intensity')}
              </h3>

              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowOriginNotice(true)}
                  onMouseLeave={() => setShowOriginNotice(false)}
                  onClick={() => setShowOriginNotice(!showOriginNotice)}
                  className="text-[#666] hover:text-[#bbb] transition-colors p-0.5 focus:outline-none cursor-pointer"
                  aria-label={t('pro.analytics.origin_notice_aria', 'Origin notice info')}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {showOriginNotice && (
                  <div className="absolute left-0 bottom-full mb-1.5 z-40 w-72 p-2.5 rounded-xl bg-[#161616] border border-white/15 shadow-2xl text-[11px] font-mono text-[#ccc] leading-relaxed backdrop-blur-md pointer-events-none animate-in fade-in-0 zoom-in-95">
                    <strong className="text-white block mb-0.5">
                      {t('pro.analytics.origin_notice_title', 'Origin Notice:')}
                    </strong>
                    {t(
                      'pro.analytics.origin_notice_desc',
                      'Direct browser hits reflect visitor edge location. Requests proxied by GitHub Camo reflect GitHub proxy datacenter nodes.'
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.geo_desc',
                'Vector 2D choropleth highlighting country traffic density. Hover over regions for granular stats.'
              )}
            </p>
          </div>

          <WorldMap
            countries={summary?.topCountries || []}
            selectedCountry={selectedCountryCode}
            onSelectCountry={setSelectedCountryCode}
          />
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white">
              {t('pro.analytics.top_countries', 'Top Visitor Countries')}
            </h3>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t('pro.analytics.top_countries_desc', 'Ranked by volume and unique visitor shares.')}
            </p>
          </div>

          <div className="pt-1">
            <DimensionRanking
              items={(summary?.topCountries || []).map((c) => ({
                key: c.code,
                name: formatLocalizedCountry(c.code, c.name, language, t),
                count: c.count,
                percentage: c.percentage,
              }))}
              label={t('pro.analytics.top_countries', 'Countries')}
              showSearch={true}
              maxItems={7}
              isCountry={true}
              emptyMessage={t('pro.analytics.no_geo_data', 'No geographic data collected yet.')}
            />
          </div>

          {summary?.topContinents && summary.topContinents.length > 0 && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-xs font-semibold text-white block">
                {t('pro.analytics.continent_share', 'Continent Share')}
              </span>
              <div className="space-y-2">
                {summary.topContinents.slice(0, 4).map((cont) => (
                  <div key={cont.key} className="space-y-1 text-xs">
                    <div className="flex justify-between text-[#8a8a8a]">
                      <span>{cont.name}</span>
                      <span className="font-mono text-white/80">{cont.percentage}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.max(cont.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

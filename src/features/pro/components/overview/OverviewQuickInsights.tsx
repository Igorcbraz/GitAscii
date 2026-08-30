'use client'

import React from 'react'

import { useI18n } from '@/i18n'

import type { ProOverviewData } from '../../types'
import {
  formatLocalizedCountry,
  formatLocalizedDay,
  formatUtcHourToLocal,
} from '../../utils/proFormatters'
import { CountryFlag } from '../CountryFlag'

interface OverviewQuickInsightsProps {
  data: ProOverviewData | null
}

export const OverviewQuickInsights: React.FC<OverviewQuickInsightsProps> = ({ data }) => {
  const { t, language } = useI18n()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded overflow-hidden border border-white/[0.05]">
      <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <span className="text-[#666] text-[11px]">{t('pro.insights.peak_day', 'Peak Day:')}</span>
        <span className="text-white font-bold">
          {formatLocalizedDay(data?.peakDay?.day, language)}
        </span>
      </div>
      <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <span className="text-[#666] text-[11px]">{t('pro.insights.peak_hour', 'Peak Hour:')}</span>
        <span className="text-white font-bold">{formatUtcHourToLocal(data?.peakHour?.hour)}</span>
      </div>
      <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <span className="text-[#666] text-[11px]">
          {t('pro.insights.top_country', 'Top Country:')}
        </span>
        <span className="text-white font-bold flex items-center gap-1.5 truncate">
          {data?.topCountry ? (
            <>
              <CountryFlag
                code={data.topCountry.code}
                name={formatLocalizedCountry(
                  data.topCountry.code,
                  data.topCountry.name,
                  language,
                  t
                )}
                size="sm"
              />
              <span className="truncate">
                {formatLocalizedCountry(data.topCountry.code, data.topCountry.name, language, t)}
              </span>
            </>
          ) : (
            formatLocalizedCountry('US', 'United States', language, t)
          )}
        </span>
      </div>
      <div className="bg-[#0c0c0c] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <span className="text-[#666] text-[11px]">
          {t('pro.insights.top_referrer', 'Top Referrer:')}
        </span>
        <span className="text-white font-bold truncate max-w-[130px]">
          {data?.topSource || 'GitHub'}
        </span>
      </div>
    </div>
  )
}

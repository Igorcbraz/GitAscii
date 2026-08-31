'use client'

import { Clock, Flame, TrendingUp } from 'lucide-react'
import React from 'react'

import { useI18n } from '@/i18n'

import type { AnalyticsSummary, TimeRange } from '../../types'
import { AreaChart } from '../charts/AreaChart'
import { HourlyBarChart } from '../charts/BarChart'
import { HeatmapChart } from '../charts/HeatmapChart'
import { ProBadge } from '../ProBadge'

interface AnalyticsTrafficSectionProps {
  summary: AnalyticsSummary | null
  range: TimeRange
  compareEnabled: boolean
}

export const AnalyticsTrafficSection: React.FC<AnalyticsTrafficSectionProps> = ({
  summary,
  range,
  compareEnabled,
}) => {
  const { t } = useI18n()

  return (
    <section id="traffic" className="space-y-6 scroll-mt-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#c5ff4a]" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            {t('pro.overview.chart_title', 'Traffic & Engagement Trends')}
          </h2>
        </div>
        <ProBadge variant="lime">{t('pro.analytics.time_series', 'Time Series')}</ProBadge>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-[#111111] border border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.daily_traffic_volume', 'Daily Traffic Volume')}
              </h3>
              {summary?.timeSeries && summary.timeSeries.length > 0 && (
                <span className="text-[10px] font-mono text-[#8a8a8a] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5">
                  {range === '24h'
                    ? t('pro.analytics.last_24_hours', 'Last 24 Hours')
                    : `${summary.timeSeries[0]?.date} → ${summary.timeSeries[summary.timeSeries.length - 1]?.date}`}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.daily_traffic_desc',
                'Interactive multi-layer breakdown of profile views, unique visitors, cache hits, and proxy views.'
              )}
            </p>
          </div>
        </div>

        <div className="pt-1">
          <AreaChart
            data={summary?.timeSeries || []}
            height={180}
            timeRange={range}
            showPreviousPeriod={compareEnabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#c5ff4a]" />
            <h3 className="text-sm font-semibold text-white">
              {t('pro.analytics.heatmap_title', '24x7 Weekly Activity Matrix')}
            </h3>
          </div>
          <p className="text-xs text-[#8a8a8a]">
            {t(
              'pro.analytics.heatmap_desc',
              'Audience density mapped by weekday and hour of day. Spot prime time slots for GitHub profile updates.'
            )}
          </p>

          <div className="pt-2">
            <HeatmapChart
              data={summary?.heatmapGrid || []}
              peakInsight={summary?.peakDay}
              peakHourInsight={summary?.peakHour}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#111111] border border-white/[0.08] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c5ff4a]" />
              <h3 className="text-sm font-semibold text-white">
                {t('pro.analytics.hourly_title', "Today's Hourly Pulse")}
              </h3>
            </div>
            <p className="text-xs text-[#8a8a8a] mt-0.5">
              {t(
                'pro.analytics.hourly_desc',
                '24-hour volume split by Direct traffic vs Camo Proxy.'
              )}
            </p>
          </div>

          <div className="pt-2 flex-1 flex flex-col justify-center">
            <HourlyBarChart data={summary?.hourlyDistribution || []} height={160} />
          </div>
        </div>
      </div>
    </section>
  )
}

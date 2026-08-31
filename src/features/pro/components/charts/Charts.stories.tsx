import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { AreaChart } from './AreaChart'
import { DimensionRanking, HourlyBarChart, StackedRatioBar } from './BarChart'
import { DonutChart } from './DonutChart'
import { HeatmapChart } from './HeatmapChart'
import { WorldMap } from './WorldMap'

const mockDailyData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 7, i + 1).toISOString().split('T')[0]
  const views = Math.floor(150 + Math.sin(i / 2) * 80 + (i % 5) * 20)
  const uniques = Math.floor(views * 0.65)
  const cacheHits = Math.floor(views * 0.4)
  const camoViews = Math.floor(views * 0.3)
  const directViews = views - camoViews

  return {
    date,
    views,
    uniques,
    cacheHits,
    camoViews,
    directViews,
    status200: directViews,
    status304: cacheHits,
    avgLatencyMs: Math.floor(18 + Math.random() * 10),
    previousPeriodViews: Math.floor(views * 0.85),
  }
})

const mockHourlyData = Array.from({ length: 24 }, (_, hour) => ({
  hour,
  views: Math.floor(20 + Math.sin(hour / 3) * 15 + (hour === 15 ? 45 : 0)),
  camoViews: Math.floor(8 + (hour % 4) * 2),
  directViews: Math.floor(12 + Math.sin(hour / 3) * 10),
}))

const mockDimensionData = [
  { name: 'GitHub', key: 'GitHub', count: 1420, percentage: 65 },
  { name: 'Direct / README', key: 'Direct', count: 480, percentage: 22 },
  { name: 'Google Search', key: 'Google', count: 180, percentage: 8 },
  { name: 'X / Twitter', key: 'Twitter', count: 110, percentage: 5 },
]

const mockCountryData = [
  {
    name: 'United States',
    code: 'US',
    key: 'US',
    continent: 'North America',
    continentCode: 'NA',
    flagEmoji: '🇺🇸',
    count: 1850,
    percentage: 42,
  },
  {
    name: 'Brazil',
    code: 'BR',
    key: 'BR',
    continent: 'South America',
    continentCode: 'SA',
    flagEmoji: '🇧🇷',
    count: 980,
    percentage: 22,
  },
  {
    name: 'Germany',
    code: 'DE',
    key: 'DE',
    continent: 'Europe',
    continentCode: 'EU',
    flagEmoji: '🇩🇪',
    count: 620,
    percentage: 14,
  },
  {
    name: 'Japan',
    code: 'JP',
    key: 'JP',
    continent: 'Asia',
    continentCode: 'AS',
    flagEmoji: '🇯🇵',
    count: 450,
    percentage: 10,
  },
]

const mockWeekdayData = Array.from({ length: 7 * 24 }, (_, idx) => {
  const day = Math.floor(idx / 24)
  const hour = idx % 24
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const views = Math.floor(10 + Math.sin(hour / 3) * 8 + (day >= 1 && day <= 5 ? 15 : 0))
  return {
    day,
    dayName: days[day],
    hour,
    views,
    intensity: Math.min(100, views * 3),
  }
})

const meta: Meta = {
  title: 'Pro/Charts/TelemetryVisualizations',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] min-h-screen text-white max-w-5xl mx-auto space-y-8">
        <Story />
      </div>
    ),
  ],
}

export default meta

export const TimeSeriesAreaChart: StoryObj = {
  render: () => (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
      <h3 className="text-sm font-semibold text-white">Daily Traffic & Unique Visitors</h3>
      <AreaChart data={mockDailyData} height={220} showPreviousPeriod={true} />
    </div>
  ),
}

export const HourlyDistributionBarChart: StoryObj = {
  render: () => (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
      <h3 className="text-sm font-semibold text-white">Hourly Distribution (24h UTC)</h3>
      <HourlyBarChart data={mockHourlyData} height={200} />
    </div>
  ),
}

export const DonutBreakdown: StoryObj = {
  render: () => (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4 max-w-md">
      <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
      <DonutChart data={mockDimensionData} size={180} />
    </div>
  ),
}

export const DimensionsRankings: StoryObj = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white">Top Countries</h3>
        <DimensionRanking
          items={mockCountryData}
          label="Countries"
          isCountry={true}
          showSearch={true}
        />
      </div>
      <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
        <h3 className="text-sm font-semibold text-white">Traffic Ratios</h3>
        <StackedRatioBar
          labelLeft="Direct Views"
          valueLeft={70}
          labelRight="GitHub Camo"
          valueRight={30}
        />
      </div>
    </div>
  ),
}

export const WeekdayHourHeatmap: StoryObj = {
  render: () => (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
      <h3 className="text-sm font-semibold text-white">Global Activity Heatmap</h3>
      <HeatmapChart data={mockWeekdayData} peakInsight={{ day: 'Wednesday', views: 820 }} />
    </div>
  ),
}

export const InteractiveWorldMap: StoryObj = {
  render: () => (
    <div className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4">
      <h3 className="text-sm font-semibold text-white">Geographic Distribution</h3>
      <WorldMap countries={mockCountryData} />
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ShareReportModal } from './ShareReportModal'

const mockReportData = {
  username: 'Igorcbraz',
  period: '30d' as const,
  metrics: {
    totalViews: 42850,
    uniqueVisitors: 8420,
    cacheHitRatio: '98.4%',
    avgDailyViews: 1428,
    growthRateViews: '18.5%',
    avgLatencyMs: 18,
  },
  topCountries: [
    { name: 'United States', count: 18500, percentage: 43 },
    { name: 'Brazil', count: 9800, percentage: 23 },
    { name: 'Germany', count: 5400, percentage: 13 },
  ],
  topSources: [
    { name: 'GitHub', count: 28000, percentage: 65 },
    { name: 'Direct / README', count: 9500, percentage: 22 },
  ],
  timeSeries: Array.from({ length: 30 }, (_, i) => ({
    date: `2026-08-${String(i + 1).padStart(2, '0')}`,
    views: Math.floor(1000 + Math.sin(i / 3) * 500),
    uniques: Math.floor(400 + Math.sin(i / 3) * 200),
    cacheHits: Math.floor(950 + Math.sin(i / 3) * 450),
    camoViews: 300,
    directViews: 700,
    status200: 700,
    status304: 300,
    avgLatencyMs: 18,
  })),
}

const meta: Meta<typeof ShareReportModal> = {
  title: 'Pro/Modals/ShareReportModal',
  component: ShareReportModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="relative w-screen h-screen bg-[#0a0a0a]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ShareReportModal>

export const OpenModal: Story = {
  args: {
    isOpen: true,
    data: mockReportData,
    onClose: () => console.log('Closed ShareReportModal'),
  },
}

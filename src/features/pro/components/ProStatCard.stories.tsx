import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Activity, AlertTriangle, Eye, Users } from 'lucide-react'
import React from 'react'

import { ProStatCard } from './ProStatCard'

const meta: Meta<typeof ProStatCard> = {
  title: 'Pro/Components/ProStatCard',
  component: ProStatCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] text-white w-[340px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProStatCard>

export const TotalViewsPositiveTrend: Story = {
  args: {
    title: 'Total Views',
    value: '42,850',
    tooltipText: 'Total SVG profile requests across all READMEs',
    trend: 18.5,
    icon: <Eye className="w-4 h-4" />,
    variant: 'lime',
  },
}

export const UniqueVisitorsNegativeTrend: Story = {
  args: {
    title: 'Unique Visitors',
    value: '8,420',
    tooltipText: 'Pseudonymized daily HyperLogLog unique visitor estimates',
    trend: -4.2,
    icon: <Users className="w-4 h-4" />,
    variant: 'default',
  },
}

export const ActiveErrorsWarning: Story = {
  args: {
    title: 'Active Errors',
    value: '3',
    tooltipText: 'Widgets failing on GitHub README embeds',
    trend: 0,
    icon: <AlertTriangle className="w-4 h-4" />,
    variant: 'rose',
  },
}

export const LatencyLive: Story = {
  args: {
    title: 'Avg Render Latency',
    value: '18ms',
    tooltipText: 'Global edge SVG rendering time',
    icon: <Activity className="w-4 h-4" />,
    variant: 'amber',
  },
}

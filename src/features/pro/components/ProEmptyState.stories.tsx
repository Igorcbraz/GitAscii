import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Activity, BellOff, CheckCircle2 } from 'lucide-react'
import React from 'react'

import { ProEmptyState } from './ProEmptyState'

const meta: Meta<typeof ProEmptyState> = {
  title: 'Pro/Components/ProEmptyState',
  component: ProEmptyState,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] text-white w-[500px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProEmptyState>

export const NoErrorsHealthy: Story = {
  args: {
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
    title: 'All Widgets Healthy',
    description:
      'Zero widget runtime failures detected across all your GitHub README embeds in the last 90 days.',
    actionLabel: 'Simulate Test Error',
    onAction: () => console.log('Simulate error clicked'),
  },
}

export const NoEmailsDispatched: Story = {
  args: {
    icon: <BellOff className="w-6 h-6 text-[#8a8a8a]" />,
    title: 'No Dispatched Notifications',
    description:
      'You have not received any email alerts yet. Automated alerts will appear here when widget outages or monthly reports trigger.',
    actionLabel: 'Send Test Digest',
    onAction: () => console.log('Test digest clicked'),
  },
}

export const NoTrafficYet: Story = {
  args: {
    icon: <Activity className="w-6 h-6 text-[#c5ff4a]" />,
    title: 'Awaiting First Telemetry',
    description:
      'Embed your SVG profile URL on your GitHub profile README. Once visitors load your profile, real-time analytics will populate here.',
    actionLabel: 'Copy Markdown Embed',
    onAction: () => console.log('Copy embed clicked'),
    secondaryActionLabel: 'Open Profile Editor',
    onSecondaryAction: () => console.log('Open editor clicked'),
  },
}

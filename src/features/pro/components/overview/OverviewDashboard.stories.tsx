import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { OverviewDashboard } from './OverviewDashboard'

const meta: Meta<typeof OverviewDashboard> = {
  title: 'Pro/Dashboards/OverviewDashboard',
  component: OverviewDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#080808] min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof OverviewDashboard>

export const Default: Story = {}

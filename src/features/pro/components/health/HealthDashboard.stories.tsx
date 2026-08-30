import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { HealthDashboard } from './HealthDashboard'

const meta: Meta<typeof HealthDashboard> = {
  title: 'Pro/Dashboards/HealthDashboard',
  component: HealthDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/health',
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
type Story = StoryObj<typeof HealthDashboard>

export const Default: Story = {}

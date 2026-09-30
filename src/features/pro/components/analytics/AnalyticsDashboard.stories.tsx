import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { mockProDashboardApi } from '../../../../../.storybook/proDashboardFixtures'
import { AnalyticsDashboard } from './AnalyticsDashboard'

const meta: Meta<typeof AnalyticsDashboard> = {
  title: 'Pro/Dashboards/AnalyticsDashboard',
  component: AnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/analytics',
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
type Story = StoryObj<typeof AnalyticsDashboard>

export const Default: Story = { beforeEach: () => mockProDashboardApi('populated') }
export const Empty: Story = { beforeEach: () => mockProDashboardApi('empty') }
export const ServiceError: Story = { beforeEach: () => mockProDashboardApi('error') }

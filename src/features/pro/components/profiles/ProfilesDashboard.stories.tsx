import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { mockProDashboardApi } from '../../../../../.storybook/proDashboardFixtures'
import { ProfilesDashboard } from './ProfilesDashboard'

const meta: Meta<typeof ProfilesDashboard> = {
  title: 'Pro/Dashboards/ProfilesDashboard',
  component: ProfilesDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/profiles',
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
type Story = StoryObj<typeof ProfilesDashboard>

export const Default: Story = { beforeEach: () => mockProDashboardApi('populated') }
export const Empty: Story = { beforeEach: () => mockProDashboardApi('empty') }
export const ServiceError: Story = { beforeEach: () => mockProDashboardApi('error') }

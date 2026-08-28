import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ReportsDashboard } from './ReportsDashboard'

const meta: Meta<typeof ReportsDashboard> = {
  title: 'Pro/Dashboards/ReportsDashboard',
  component: ReportsDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/reports',
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
type Story = StoryObj<typeof ReportsDashboard>

export const Default: Story = {}

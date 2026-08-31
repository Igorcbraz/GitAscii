import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { WidgetErrorsDashboard } from './WidgetErrorsDashboard'

const meta: Meta<typeof WidgetErrorsDashboard> = {
  title: 'Pro/Dashboards/WidgetErrorsDashboard',
  component: WidgetErrorsDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/errors',
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
type Story = StoryObj<typeof WidgetErrorsDashboard>

export const Default: Story = {}

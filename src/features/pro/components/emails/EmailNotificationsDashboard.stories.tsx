import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { EmailNotificationsDashboard } from './EmailNotificationsDashboard'

const meta: Meta<typeof EmailNotificationsDashboard> = {
  title: 'Pro/Dashboards/EmailNotificationsDashboard',
  component: EmailNotificationsDashboard,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/pro/emails',
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
type Story = StoryObj<typeof EmailNotificationsDashboard>

export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ProSidebar } from './ProSidebar'

const meta: Meta<typeof ProSidebar> = {
  title: 'Pro/Layout/ProSidebar',
  component: ProSidebar,
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
      <div className="h-screen bg-[#080808] text-white flex">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProSidebar>

export const LoggedInProUser: Story = {
  args: {
    username: 'Igorcbraz',
    activeErrorsCount: 2,
  },
}

export const GuestUser: Story = {
  args: {
    username: undefined,
    activeErrorsCount: 0,
  },
}

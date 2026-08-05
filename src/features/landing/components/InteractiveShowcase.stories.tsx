import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import InteractiveShowcase from './InteractiveShowcase'

const meta: Meta<typeof InteractiveShowcase> = {
  title: 'Landing/InteractiveShowcase',
  component: InteractiveShowcase,
  parameters: {
    nextjs: {
      appDirectory: true,
      pathname: '/',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InteractiveShowcase>

export const Default: Story = {}

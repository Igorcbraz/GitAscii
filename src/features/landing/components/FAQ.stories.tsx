import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { FAQ } from './FAQ'

const meta: Meta<typeof FAQ> = {
  title: 'Landing/FAQ',
  component: FAQ,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FAQ>

export const Default: Story = {}

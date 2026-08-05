import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { HowItWorks } from './HowItWorks'

const meta: Meta<typeof HowItWorks> = {
  title: 'Landing/HowItWorks',
  component: HowItWorks,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof HowItWorks>

export const Default: Story = {}

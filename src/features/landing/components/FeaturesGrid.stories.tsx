import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { FeaturesGrid } from './FeaturesGrid'

const meta: Meta<typeof FeaturesGrid> = {
  title: 'Landing/FeaturesGrid',
  component: FeaturesGrid,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FeaturesGrid>

export const Default: Story = {}

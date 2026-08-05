import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { SummarySection } from './SummarySection'

const meta: Meta<typeof SummarySection> = {
  title: 'Landing/SummarySection',
  component: SummarySection,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SummarySection>

export const Default: Story = {}

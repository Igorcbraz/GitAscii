import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import DemoSection from './DemoSection'

const meta: Meta<typeof DemoSection> = {
  title: 'Landing/DemoSection',
  component: DemoSection,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DemoSection>

export const Default: Story = {}

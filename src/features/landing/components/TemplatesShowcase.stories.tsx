import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import TemplatesShowcase from './TemplatesShowcase'

const meta: Meta<typeof TemplatesShowcase> = {
  title: 'Landing/TemplatesShowcase',
  component: TemplatesShowcase,
  decorators: [
    (Story) => (
      <div className="w-full bg-carbon text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TemplatesShowcase>

export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { Footer } from './Footer'

const meta: Meta<typeof Footer> = {
  title: 'Landing/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <div className="w-full bg-void-black text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Footer>

export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ProBadge } from './ProBadge'

const meta: Meta<typeof ProBadge> = {
  title: 'Pro/Components/ProBadge',
  component: ProBadge,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] text-white flex items-center justify-center gap-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProBadge>

export const LimeDefault: Story = {
  args: {
    children: 'PRO',
    variant: 'lime',
    size: 'sm',
  },
}

export const Emerald: Story = {
  args: {
    children: 'ACTIVE',
    variant: 'emerald',
    size: 'sm',
  },
}

export const Amber: Story = {
  args: {
    children: 'UPGRADE',
    variant: 'amber',
    size: 'md',
  },
}

export const Rose: Story = {
  args: {
    children: 'ERROR',
    variant: 'rose',
    size: 'sm',
  },
}

export const Muted: Story = {
  args: {
    children: 'FREE TIER',
    variant: 'muted',
    size: 'sm',
  },
}

export const Outline: Story = {
  args: {
    children: 'OUTLINE',
    variant: 'outline',
    size: 'md',
  },
}

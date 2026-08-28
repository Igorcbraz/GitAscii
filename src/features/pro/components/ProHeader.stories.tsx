import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ProHeader } from './ProHeader'

const meta: Meta<typeof ProHeader> = {
  title: 'Pro/Layout/ProHeader',
  component: ProHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-[120px] bg-[#080808] text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProHeader>

export const Default: Story = {
  args: {
    title: 'Traffic & Telemetry Analytics',
    subtitle: 'Real-time multi-dimensional view analytics across your GitHub profiles',
    username: 'Igorcbraz',
    profiles: [
      { slug: 'default', name: 'Primary GitHub Profile' },
      { slug: 'minimal', name: 'Minimal Dark' },
      { slug: 'stats', name: 'Detailed Stats Profile' },
    ],
    selectedProfile: 'default',
    onSelectProfile: (slug) => console.log('Selected:', slug),
  },
}

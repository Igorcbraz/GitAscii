import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import KineticGrid from './kinetic-grid'

const meta: Meta<typeof KineticGrid> = {
  title: 'UI/KineticGrid',
  component: KineticGrid,
  argTypes: {
    globalColor: {
      control: 'select',
      options: ['default', 'monochrome'],
    },
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="w-full min-h-screen relative overflow-hidden">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof KineticGrid>

export const DefaultSignalLime: Story = {
  args: {
    globalColor: 'default',
    children: (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 select-none">
        <h1 className="font-serif text-display-lg text-signal-lime uppercase tracking-tight mb-4">
          GitAscii
        </h1>
        <p className="font-inter-tight text-body text-bone max-w-md">
          Move your cursor around the screen or click anywhere to see the kinetic grid warp and
          react dynamically.
        </p>
      </div>
    ),
  },
}

export const Monochrome: Story = {
  args: {
    globalColor: 'monochrome',
    children: (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 select-none">
        <h1 className="font-serif text-display-lg text-white uppercase tracking-tight mb-4">
          Monochrome Grid
        </h1>
        <p className="font-inter-tight text-body text-ash max-w-md">
          A minimalist black & white grid ripple variant.
        </p>
      </div>
    ),
  },
}

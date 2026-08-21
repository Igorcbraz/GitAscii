import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import AsciiHands from './ascii-hands'

const meta: Meta<typeof AsciiHands> = {
  title: 'UI/AsciiHands',
  component: AsciiHands,
  argTypes: {
    imageSrc: { control: 'text' },
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[400px] bg-carbon border border-graphite p-4 flex items-center justify-center overflow-hidden">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AsciiHands>

export const Default: Story = {
  args: {
    imageSrc: '/hands.png',
    className: 'w-full h-full',
  },
}

export const AltImage: Story = {
  args: {
    imageSrc: '/gitfest.webp',
    className: 'w-full h-full',
  },
}

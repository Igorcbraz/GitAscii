import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { CountryFlag } from './CountryFlag'

const meta: Meta<typeof CountryFlag> = {
  title: 'Pro/Components/CountryFlag',
  component: CountryFlag,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] text-white flex items-center justify-center gap-6">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CountryFlag>

export const Brazil: Story = {
  args: {
    code: 'BR',
    name: 'Brazil',
    size: 'lg',
  },
}

export const UnitedStates: Story = {
  args: {
    code: 'US',
    name: 'United States',
    size: 'lg',
  },
}

export const Germany: Story = {
  args: {
    code: 'DE',
    name: 'Germany',
    size: 'lg',
  },
}

export const Japan: Story = {
  args: {
    code: 'JP',
    name: 'Japan',
    size: 'lg',
  },
}

export const UnknownLocation: Story = {
  args: {
    code: 'XX',
    name: 'Unknown Location',
    size: 'lg',
  },
}

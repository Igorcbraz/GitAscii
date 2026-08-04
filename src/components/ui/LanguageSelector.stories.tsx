import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import LanguageSelector from './LanguageSelector'

const meta: Meta<typeof LanguageSelector> = {
  title: 'UI/LanguageSelector',
  component: LanguageSelector,
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'right'],
    },
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="p-12 bg-carbon border border-graphite min-h-[250px] flex items-start justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof LanguageSelector>

export const Default: Story = {
  args: {
    align: 'right',
  },
}

export const LeftAligned: Story = {
  args: {
    align: 'left',
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { StarPromptModal } from './StarPromptModal'

const meta: Meta<typeof StarPromptModal> = {
  title: 'Editor/Toolbar/StarPromptModal',
  component: StarPromptModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4 bg-onyx min-h-screen text-white">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'onClose' },
    source: {
      control: 'radio',
      options: ['export', 'commit'],
    },
  },
}

export default meta
type Story = StoryObj<typeof StarPromptModal>

export const ExportSource: Story = {
  args: {
    isOpen: true,
    source: 'export',
  },
}

export const CommitSource: Story = {
  args: {
    isOpen: true,
    source: 'commit',
  },
}

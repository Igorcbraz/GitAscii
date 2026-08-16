import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { GuestLoginModal } from './GuestLoginModal'

const meta: Meta<typeof GuestLoginModal> = {
  title: 'Editor/Toolbar/GuestLoginModal',
  component: GuestLoginModal,
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
  },
}

export default meta
type Story = StoryObj<typeof GuestLoginModal>

export const Default: Story = {
  args: {
    isOpen: true,
    username: 'octocat',
  },
}

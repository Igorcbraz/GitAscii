import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { EmailButton } from './EmailButton'

const meta: Meta<typeof EmailButton> = {
  title: 'Emails/Components/EmailButton',
  component: EmailButton,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex min-h-[200px] items-center justify-center bg-[#09090b] p-8">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    href: { control: 'text', description: 'Destination link URL' },
    children: { control: 'text', description: 'Button text content' },
  },
}

export default meta
type Story = StoryObj<typeof EmailButton>

export const Default: Story = {
  args: {
    href: 'https://gitascii.com/octocat',
    children: 'Open Your GitAscii Editor',
  },
}

export const StarRepository: Story = {
  args: {
    href: 'https://github.com/Igorcbraz/GitAscii',
    children: '⭐ Star GitAscii on GitHub',
  },
}

export const LongTextAction: Story = {
  args: {
    href: 'https://github.com/apps/gitascii/installations/new',
    children: 'Reconnect GitAscii Application Permissions on GitHub',
  },
}

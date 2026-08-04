import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { Breadcrumbs } from './Breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
  argTypes: {
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-carbon border border-graphite min-h-[100px] flex items-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Breadcrumbs>

export const SingleItem: Story = {
  args: {
    items: [{ label: 'Editor', href: '/editor' }],
  },
}

export const MultipleItems: Story = {
  args: {
    items: [
      { label: 'Explore', href: '/explore' },
      { label: 'Templates', href: '/templates' },
      { label: 'Minimal Template' },
    ],
  },
}

export const LongLabels: Story = {
  args: {
    items: [
      { label: 'Open Source Community Profiles', href: '/explore' },
      { label: 'Very Long Developer Workspace Name', href: '/workspace' },
      { label: 'Current Configuration File' },
    ],
  },
}

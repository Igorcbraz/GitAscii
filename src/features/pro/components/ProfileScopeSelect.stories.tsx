import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useState } from 'react'

import { ProfileScopeSelect } from './ProfileScopeSelect'

const mockOptions = [
  { slug: 'all', name: 'All Profiles Combined' },
  { slug: 'default', name: 'Primary GitHub Profile', isDefault: true },
  { slug: 'minimal', name: 'Minimal Dark' },
  { slug: 'stats', name: 'Detailed Stats Profile' },
]

const meta: Meta<typeof ProfileScopeSelect> = {
  title: 'Pro/Components/ProfileScopeSelect',
  component: ProfileScopeSelect,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-[#0a0a0a] text-white w-[300px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProfileScopeSelect>

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState('all')
    return (
      <ProfileScopeSelect
        options={mockOptions}
        value={selected}
        onChange={(slug) => setSelected(slug)}
      />
    )
  },
}

export const SpecificProfileSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState('minimal')
    return (
      <ProfileScopeSelect
        options={mockOptions}
        value={selected}
        onChange={(slug) => setSelected(slug)}
      />
    )
  },
}

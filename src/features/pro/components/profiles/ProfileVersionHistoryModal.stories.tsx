import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import type { ProProfileRecord } from '../../types'
import { ProfileVersionHistoryModal } from './ProfileVersionHistoryModal'

const mockProfile: ProProfileRecord = {
  id: 'prof_default',
  slug: 'default',
  name: 'Primary GitHub Profile',
  description: 'Main README dashboard',
  status: 'active',
  isDefault: true,
  widgetsCount: 5,
  totalViews: 28400,
  createdAt: '2026-08-01T00:00:00Z',
  lastUpdated: '2026-08-27T12:00:00Z',
  publicUrl: 'http://localhost:3000/Igorcbraz',
  rawSvgUrl: 'http://localhost:3000/Igorcbraz.svg',
}

const meta: Meta<typeof ProfileVersionHistoryModal> = {
  title: 'Pro/Modals/ProfileVersionHistoryModal',
  component: ProfileVersionHistoryModal,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="bg-[#080808] p-8 text-white min-h-[600px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProfileVersionHistoryModal>

export const Default: Story = {
  args: {
    profile: mockProfile,
    onClose: () => {},
    onVersionRestored: () => {},
  },
}

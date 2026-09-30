import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { mockStoryFetch } from '../../../../../.storybook/mockFetch'
import type { ProfileVersionRecord, ProProfileRecord } from '../../types'
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

const versions: ProfileVersionRecord[] = [
  {
    id: 'version_3',
    profileSlug: 'default',
    versionNumber: 3,
    label: 'Improved project layout',
    description: 'Updated cards and repository activity.',
    widgetsCount: 5,
    createdAt: '2026-08-27T12:00:00Z',
    createdBy: 'Igorcbraz',
  },
  {
    id: 'version_2',
    profileSlug: 'default',
    versionNumber: 2,
    label: 'First public version',
    widgetsCount: 4,
    createdAt: '2026-08-15T12:00:00Z',
    createdBy: 'Igorcbraz',
  },
]

const mockVersions = (items: ProfileVersionRecord[]) =>
  mockStoryFetch((url) =>
    url.includes('/api/pro/profiles/default/versions') ? { body: { versions: items } } : undefined
  )

const meta: Meta<typeof ProfileVersionHistoryModal> = {
  title: 'Pro/Modals/ProfileVersionHistoryModal',
  component: ProfileVersionHistoryModal,
  args: {
    profile: mockProfile,
    onClose: () => {},
    onVersionRestored: () => {},
  },
  parameters: {
    layout: 'centered',
  },
  beforeEach: () => mockVersions(versions),
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

export const Default: Story = {}

export const NoSnapshots: Story = { beforeEach: () => mockVersions([]) }

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ExploreCommunityGallery } from './ExploreCommunityGallery'
import type { CommunityProfileItem } from './getCommunityProfiles'

const mockProfiles: CommunityProfileItem[] = [
  {
    username: 'Igorcbraz',
    profileSlug: 'default',
    templateId: 'terminal',
    widgetsCount: 5,
    hasAsciiArt: true,
    tags: ['Terminal', 'ASCII Art', 'Full Stack'],
    isStored: true,
  },
  {
    username: 'dracula-theme',
    profileSlug: 'default',
    templateId: 'dracula',
    widgetsCount: 4,
    hasAsciiArt: false,
    tags: ['Dracula', 'SVG Widgets', 'Theme Spec'],
    isStored: true,
  },
  {
    username: 'sublime-coder',
    profileSlug: 'default',
    templateId: 'tokyo-night',
    widgetsCount: 6,
    hasAsciiArt: true,
    tags: ['Tokyo Night', 'ASCII Art', 'Integrations'],
    isStored: false,
  },
  {
    username: 'minimalist-dev',
    profileSlug: 'default',
    templateId: 'minimal',
    widgetsCount: 3,
    hasAsciiArt: false,
    tags: ['Minimal', 'Simple Layout', 'Verified'],
    isStored: true,
  },
]

const meta: Meta<typeof ExploreCommunityGallery> = {
  title: 'Explore/ExploreCommunityGallery',
  component: ExploreCommunityGallery,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 bg-carbon min-h-screen text-chalk">
        <div className="max-w-6xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ExploreCommunityGallery>

export const Default: Story = {
  args: {
    initialProfiles: mockProfiles,
  },
}

export const EmptyGallery: Story = {
  args: {
    initialProfiles: [],
  },
}

export const StoredOnly: Story = {
  args: {
    initialProfiles: mockProfiles.filter((p) => p.isStored),
  },
}

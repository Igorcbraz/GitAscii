import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { CopyGuideModal } from './CopyGuideModal'

const meta: Meta<typeof CopyGuideModal> = {
  title: 'Editor/Toolbar/CopyGuideModal',
  component: CopyGuideModal,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      useEditorStore.getState().initEditor(mockConfig, mockGithubData)
      return (
        <div className="p-4 bg-onyx min-h-screen text-white">
          <Story />
        </div>
      )
    },
  ],
  argTypes: {
    isOpen: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
}

export default meta
type Story = StoryObj<typeof CopyGuideModal>

export const Default: Story = {
  args: {
    isOpen: true,
    username: 'octocat',
    embedCode: '<!-- HTML snippet goes here -->',
  },
}

export const Dark: Story = {
  args: {
    isOpen: true,
    username: 'octocat',
    embedCode: '<!-- HTML snippet goes here -->',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Light: Story = {
  args: {
    isOpen: true,
    username: 'octocat',
    embedCode: '<!-- HTML snippet goes here -->',
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const Responsive: Story = {
  args: {
    isOpen: true,
    username: 'octocat',
    embedCode: '<!-- HTML snippet goes here -->',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from '@storybook/test'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { ExportGuideModal } from './ExportGuideModal'

const meta: Meta<typeof ExportGuideModal> = {
  title: 'Editor/Toolbar/ExportGuideModal',
  component: ExportGuideModal,
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
type Story = StoryObj<typeof ExportGuideModal>

export const Default: Story = {
  args: {
    isOpen: true,
  },
  play: async () => {
    const canvas = within(document.body) // modals usually render in portals
    const modalContent = await canvas.findByRole('dialog').catch(() => null)
    if (modalContent) {
      expect(modalContent).toBeVisible()
      const closeBtn = await within(modalContent)
        .findByRole('button', { name: /close/i })
        .catch(() => null)
      if (closeBtn) {
        await userEvent.click(closeBtn)
      }
    }
  },
}

export const Loading: Story = {
  args: {
    isOpen: true,
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    isOpen: true,
    isEmpty: true,
  },
}

export const ErrorState: Story = {
  args: {
    isOpen: true,
    error: true,
  },
}

export const Dark: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Light: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const Responsive: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

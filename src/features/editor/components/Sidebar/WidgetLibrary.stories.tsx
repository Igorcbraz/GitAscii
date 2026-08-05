import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { WidgetLibrary } from './WidgetLibrary'

const meta: Meta<typeof WidgetLibrary> = {
  title: 'Editor/WidgetLibrary',
  component: WidgetLibrary,
  decorators: [
    (Story) => {
      // Synchronously initialize the store for this story
      useEditorStore.getState().initEditor(mockConfig, mockGithubData)
      return (
        <div className="h-[600px] w-[300px] border border-graphite bg-onyx flex overflow-hidden">
          <Story />
        </div>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof WidgetLibrary>

export const Default: Story = {}

export const TemplatesTab: Story = {
  play: async ({ canvasElement }) => {
    // Interacts with the story DOM to switch to the templates tab automatically
    const templatesBtn = canvasElement.querySelector(
      '[data-testid="templates-tab-btn"]'
    ) as HTMLButtonElement
    if (templatesBtn) {
      templatesBtn.click()
    }
  },
}

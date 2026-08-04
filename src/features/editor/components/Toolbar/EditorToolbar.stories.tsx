import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from '@storybook/test'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { EditorToolbar } from './EditorToolbar'

const meta: Meta<typeof EditorToolbar> = {
  title: 'Editor/EditorToolbar',
  component: EditorToolbar,
  decorators: [
    (Story) => {
      // Synchronously initialize the store for this story
      useEditorStore.getState().initEditor(mockConfig, mockGithubData)
      useEditorStore.getState().setSession(null)
      return (
        <div className="bg-carbon p-4 border border-graphite rounded-sm">
          <Story />
        </div>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof EditorToolbar>

export const Default: Story = {}

export const WithSelectedWidget: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      state.initEditor(mockConfig, mockGithubData)
      state.setSession(null)
      if (mockConfig.widgets[1]) {
        state.selectWidget(mockConfig.widgets[1].instanceId)
      }
      return <Story />
    },
  ],
}

export const LoggedInOwner: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      state.initEditor(mockConfig, mockGithubData)
      state.setSession({
        username: mockConfig.username,
        githubId: mockConfig.githubId,
      })
      return <Story />
    },
  ],
}

export const WithUndoRedo: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      state.initEditor(mockConfig, mockGithubData)
      state.setSession(null)
      // Simulate past/future states manually
      // We can trigger an update to push to past
      state.updateWidgetConfig(mockConfig.widgets[0].instanceId, { title: 'Test 1' })
      state.updateWidgetConfig(mockConfig.widgets[0].instanceId, { title: 'Test 2' })
      // Now undo once to have both past and future
      state.undo()
      return <Story />
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Grab buttons
    const undoBtn = canvas.getByTestId('undo-btn')
    const redoBtn = canvas.getByTestId('redo-btn')

    // Initially, both should be enabled based on our decorator setup
    expect(undoBtn).not.toBeDisabled()
    expect(redoBtn).not.toBeDisabled()

    // Click Undo
    await userEvent.click(undoBtn)

    // Click Redo
    await userEvent.click(redoBtn)
  },
}

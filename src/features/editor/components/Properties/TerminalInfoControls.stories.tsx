import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { TerminalInfoControls } from './TerminalInfoControls'

const meta: Meta<typeof TerminalInfoControls> = {
  title: 'Editor/Properties/TerminalInfoControls',
  component: TerminalInfoControls,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      useEditorStore.getState().initEditor(mockConfig, mockGithubData)
      return (
        <div className="p-4 w-[320px] bg-onyx border border-graphite text-white">
          <Story />
        </div>
      )
    },
  ],
  argTypes: {
    instanceId: { control: 'text' },
    config: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof TerminalInfoControls>

export const Default: Story = {
  args: {
    instanceId: 'test-instance',
    config: {},
  },
}

export const Loading: Story = {
  args: {
    instanceId: 'test-instance',
    config: { isLoading: true },
  },
}

export const Empty: Story = {
  args: {
    instanceId: 'test-instance',
    config: { isEmpty: true },
  },
}

export const ErrorState: Story = {
  args: {
    instanceId: 'test-instance',
    config: { hasError: true },
  },
}

export const Dark: Story = {
  args: {
    instanceId: 'test-instance',
    config: { theme: 'dark' },
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Light: Story = {
  args: {
    instanceId: 'test-instance',
    config: { theme: 'light' },
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const Responsive: Story = {
  args: {
    instanceId: 'test-instance',
    config: {},
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

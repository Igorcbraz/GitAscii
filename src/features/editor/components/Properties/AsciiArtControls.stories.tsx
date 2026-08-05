import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { userEvent, within } from '@storybook/test'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { AsciiArtControls } from './AsciiArtControls'

const meta: Meta<typeof AsciiArtControls> = {
  title: 'Editor/Properties/AsciiArtControls',
  component: AsciiArtControls,
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
type Story = StoryObj<typeof AsciiArtControls>

export const Default: Story = {
  args: {
    instanceId: 'test-instance',
    config: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Interact with inputs (like detail level or charset dropdown)
    const buttons = await canvas.findAllByRole('button').catch(() => [])
    if (buttons.length > 0) {
      await userEvent.click(buttons[0])
    }
    const sliders = await canvas.findAllByRole('slider').catch(() => [])
    if (sliders.length > 0) {
      await userEvent.click(sliders[0])
    }
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

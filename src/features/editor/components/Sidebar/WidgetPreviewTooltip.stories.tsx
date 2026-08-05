import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { WidgetPreviewTooltip } from './WidgetPreviewTooltip'

const meta: Meta<typeof WidgetPreviewTooltip> = {
  title: 'Editor/Sidebar/WidgetPreviewTooltip',
  component: WidgetPreviewTooltip,
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
    widgetItem: { control: 'object' },
    targetRect: { control: 'object' },
    globalStyles: { control: 'object' },
    githubData: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof WidgetPreviewTooltip>

const mockRect: DOMRect = {
  bottom: 100,
  height: 50,
  left: 200,
  right: 250,
  top: 50,
  width: 50,
  x: 200,
  y: 50,
  toJSON: () => ({}),
}

const mockWidgetItem = {
  id: 'header',
  name: 'Header Widget',
  desc: 'Preview of header widget',
  icon: () => null,
}

export const Default: Story = {
  args: {
    widgetItem: mockWidgetItem,
    targetRect: mockRect,
    globalStyles: {
      fontFamily: 'Inter',
      borderRadius: 8,
      textColor: '#ffffff',
      accentColor: '#00ff00',
      backgroundColor: '#000000',
      borderColor: '#333333',
      padding: 16,
      themeMode: 'dark',
    },
    githubData: mockGithubData,
  },
}

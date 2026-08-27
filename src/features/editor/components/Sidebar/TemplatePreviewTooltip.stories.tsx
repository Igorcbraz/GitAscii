import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { TEMPLATE_PRESETS } from '../../../../engine/core/TemplateRenderer'
import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { TemplatePreviewTooltip } from './TemplatePreviewTooltip'

const meta: Meta<typeof TemplatePreviewTooltip> = {
  title: 'Editor/Sidebar/TemplatePreviewTooltip',
  component: TemplatePreviewTooltip,
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
    template: { control: 'object' },
    targetRect: { control: 'object' },
    githubData: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof TemplatePreviewTooltip>

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

export const Default: Story = {
  args: {
    template: TEMPLATE_PRESETS.native || Object.values(TEMPLATE_PRESETS)[0],
    targetRect: mockRect,
    githubData: mockGithubData,
  },
}

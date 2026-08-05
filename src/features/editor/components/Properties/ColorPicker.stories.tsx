import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { ColorPicker } from './ColorPicker'

const meta: Meta<typeof ColorPicker> = {
  title: 'Editor/Properties/ColorPicker',
  component: ColorPicker,
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
    label: { control: 'text' },
    value: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof ColorPicker>

export const Default: Story = {
  args: {
    label: 'Background',
    value: '#123456',
    onChange: () => {},
  },
}

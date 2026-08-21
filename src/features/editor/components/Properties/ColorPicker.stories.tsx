import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { GITHUB_THEME_KEYS } from '@/constants'

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
    value: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ColorPicker>

export const Default: Story = {
  args: {
    label: 'Background',
    value: '#1f1f1f',
    onChange: () => {},
  },
}

export const GitHubAuto: Story = {
  args: {
    label: 'Background (Adaptive)',
    value: GITHUB_THEME_KEYS.AUTO,
    onChange: () => {},
  },
}

export const GitHubDark: Story = {
  args: {
    label: 'GitHub Dark (#0D1117)',
    value: GITHUB_THEME_KEYS.DARK,
    onChange: () => {},
  },
}

export const GitHubDarkDimmed: Story = {
  args: {
    label: 'GitHub Dark Dimmed (#212830)',
    value: GITHUB_THEME_KEYS.DARK_DIMMED,
    onChange: () => {},
  },
}

export const GitHubLight: Story = {
  args: {
    label: 'GitHub Light (#FFFFFF)',
    value: GITHUB_THEME_KEYS.LIGHT,
    onChange: () => {},
  },
}

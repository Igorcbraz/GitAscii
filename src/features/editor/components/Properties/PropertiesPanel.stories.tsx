import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { useEditorStore } from '../../store/editorStore'
import { mockConfig, mockGithubData } from '../stories/mockData'
import { PropertiesPanel } from './PropertiesPanel'

const meta: Meta<typeof PropertiesPanel> = {
  title: 'Editor/PropertiesPanel',
  component: PropertiesPanel,
  decorators: [
    (Story) => {
      // Synchronously initialize the store for this story
      useEditorStore.getState().initEditor(mockConfig, mockGithubData)
      return (
        <div className="h-[600px] w-[320px] border border-graphite bg-onyx flex overflow-y-auto">
          <Story />
        </div>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof PropertiesPanel>

export const NoWidgetSelected: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      state.initEditor(mockConfig, mockGithubData)
      state.selectWidget(null)
      return <Story />
    },
  ],
}

export const HeaderSelected: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      state.initEditor(mockConfig, mockGithubData)
      const headerWidget = mockConfig.widgets.find((w) => w.widgetId === 'header')
      if (headerWidget) {
        state.selectWidget(headerWidget.instanceId)
      }
      return <Story />
    },
  ],
}

export const BioSelected: Story = {
  decorators: [
    (Story) => {
      const state = useEditorStore.getState()
      const configWithBio = JSON.parse(JSON.stringify(mockConfig))
      let bioWidget = configWithBio.widgets.find((w: any) => w.widgetId === 'bio')
      if (!bioWidget) {
        bioWidget = {
          instanceId: 'widget_mock_bio',
          widgetId: 'bio',
          name: 'Bio Widget',
          position: { x: 0, y: 300 },
          size: { width: 800, height: 120 },
          config: {
            customBio: 'Full Stack Developer | AI Enthusiast',
            customLocation: 'San Francisco, CA',
            customBlog: 'https://gitascii.dev',
          },
          locked: false,
          visible: true,
          zIndex: 10,
        }
        configWithBio.widgets.push(bioWidget)
      }
      state.initEditor(configWithBio, mockGithubData)
      state.selectWidget(bioWidget.instanceId)
      return <Story />
    },
  ],
}

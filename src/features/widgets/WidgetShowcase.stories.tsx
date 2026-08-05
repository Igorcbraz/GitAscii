import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ToastProvider } from '@/components/ui/toast'

import { WidgetShowcase } from './WidgetShowcase'

const meta: Meta<typeof WidgetShowcase> = {
  title: 'Widgets/WidgetShowcase',
  component: WidgetShowcase,
  parameters: {
    nextjs: {
      appDirectory: true,
      pathname: '/widgets',
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="p-8 bg-carbon min-h-screen text-chalk">
          <div className="max-w-6xl mx-auto">
            <Story />
          </div>
        </div>
      </ToastProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WidgetShowcase>

export const Default: Story = {}

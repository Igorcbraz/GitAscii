import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ToastProvider } from '@/components/ui/toast'

import { TemplateGallery } from './TemplateGallery'

const meta: Meta<typeof TemplateGallery> = {
  title: 'Templates/TemplateGallery',
  component: TemplateGallery,
  parameters: {
    nextjs: {
      appDirectory: true,
      pathname: '/templates',
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
type Story = StoryObj<typeof TemplateGallery>

export const Default: Story = {}

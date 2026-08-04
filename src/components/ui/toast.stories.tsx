import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ToastProvider, useToast } from './toast'

// Helper component to trigger toast messages inside the provider context
const ToastTriggerControls = () => {
  const { success, error, info } = useToast()

  return (
    <div className="flex flex-col gap-4 max-w-sm w-full bg-onyx border border-graphite p-6">
      <h3 className="font-jetbrains-mono text-caption text-ash uppercase tracking-wider mb-2">
        Toast Controller
      </h3>
      <button
        onClick={() =>
          success('Success! Your profile layout has been saved successfully to the edge.')
        }
        className="w-full bg-signal-lime text-black py-2.5 font-medium uppercase tracking-wider text-label hover:brightness-110 transition-all cursor-pointer"
      >
        Trigger Success Toast
      </button>
      <button
        onClick={() =>
          error('Error! Failed to retrieve GitHub data. Please check your username and retry.')
        }
        className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-2.5 font-medium uppercase tracking-wider text-label hover:bg-red-500/30 transition-all cursor-pointer"
      >
        Trigger Error Toast
      </button>
      <button
        onClick={() => info('Information: GitHub API rate limits will reset in 45 minutes.')}
        className="w-full bg-carbon text-ash border border-graphite py-2.5 font-medium uppercase tracking-wider text-label hover:text-white hover:border-ash/50 transition-all cursor-pointer"
      >
        Trigger Info Toast
      </button>
    </div>
  )
}

const meta: Meta<typeof ToastProvider> = {
  title: 'UI/ToastNotification',
  component: ToastProvider,
  decorators: [
    (Story) => (
      <div className="p-12 bg-carbon border border-graphite min-h-[400px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ToastProvider>

export const InteractiveDemo: Story = {
  render: () => (
    <ToastProvider>
      <ToastTriggerControls />
    </ToastProvider>
  ),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useEffect } from 'react'

import { EditorLayout } from './EditorLayout'
import { mockGithubData } from './stories/mockData'

const meta: Meta<typeof EditorLayout> = {
  title: 'Editor/EditorLayout',
  component: EditorLayout,
  args: {
    username: 'Igorcbraz',
    profileSlug: 'default',
    autoGenerate: false,
  },
  decorators: [
    (Story) => {
      // Mock window.fetch for API routes inside the story environment
      useEffect(() => {
        const originalFetch = window.fetch
        window.fetch = async (input, init) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : ''

          if (url.includes('/api/github/')) {
            return new Response(JSON.stringify(mockGithubData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
          if (url.includes('/api/auth/session')) {
            return new Response(JSON.stringify({ session: null }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          return originalFetch(input, init)
        }

        return () => {
          window.fetch = originalFetch
        }
      }, [])

      return (
        <div className="h-screen w-screen bg-carbon overflow-hidden">
          <Story />
        </div>
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof EditorLayout>

export const Default: Story = {}

export const AutoGenerate: Story = {
  args: {
    username: 'Igorcbraz',
    profileSlug: 'default',
    autoGenerate: true,
  },
}

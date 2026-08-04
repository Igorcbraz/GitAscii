import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useEffect } from 'react'

import { ToastProvider } from '@/components/ui/toast'

import Hero from './Hero'

const meta: Meta<typeof Hero> = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: {
    nextjs: {
      appDirectory: true,
      pathname: '/',
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="w-full bg-carbon text-white relative min-h-screen">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Hero>

export const Anonymous: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = window.fetch
        window.fetch = async (input) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : ''
          if (url.includes('/api/auth/session')) {
            return new Response(JSON.stringify({ session: null }), { status: 200 })
          }
          return originalFetch(input)
        }
        return () => {
          window.fetch = originalFetch
        }
      }, [])
      return <Story />
    },
  ],
}

export const LoggedIn: Story = {
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = window.fetch
        window.fetch = async (input) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : ''
          if (url.includes('/api/auth/session')) {
            return new Response(
              JSON.stringify({ session: { username: 'Igorcbraz', githubId: 40432351 } }),
              { status: 200 }
            )
          }
          return originalFetch(input)
        }
        return () => {
          window.fetch = originalFetch
        }
      }, [])
      return <Story />
    },
  ],
}

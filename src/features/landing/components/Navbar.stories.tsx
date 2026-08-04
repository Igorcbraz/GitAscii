import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useEffect } from 'react'

import Navbar from './Navbar'

const meta: Meta<typeof Navbar> = {
  title: 'Landing/Navbar',
  component: Navbar,
  parameters: {
    nextjs: {
      appDirectory: true,
      pathname: '/',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full bg-void-black text-white">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Navbar>

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
          if (url.includes('api.github.com')) {
            return new Response(JSON.stringify({ stargazers_count: 563 }), { status: 200 })
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
          if (url.includes('api.github.com')) {
            return new Response(JSON.stringify({ stargazers_count: 1042 }), { status: 200 })
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

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const originalFetch = window.fetch
        window.fetch = async (input) => {
          const url = typeof input === 'string' ? input : input instanceof URL ? input.href : ''
          if (url.includes('/api/auth/session')) {
            return new Response(JSON.stringify({ session: null }), { status: 200 })
          }
          if (url.includes('api.github.com')) {
            return new Response(JSON.stringify({ stargazers_count: 563 }), { status: 200 })
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

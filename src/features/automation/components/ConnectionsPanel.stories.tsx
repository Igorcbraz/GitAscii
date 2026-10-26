import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ConnectionsPanel } from './ConnectionsPanel'

const meta: Meta<typeof ConnectionsPanel> = {
  title: 'Automation/Connections',
  component: ConnectionsPanel,
  parameters: { layout: 'fullscreen' },
  args: { endpoint: 'https://gitascii.example/mcp', username: 'octocat', enabled: true },
  beforeEach: () => {
    const original = globalThis.fetch
    globalThis.fetch = async (input, init) =>
      String(input) === '/api/account/connections'
        ? Response.json(
            init?.method === 'DELETE'
              ? { revoked: true }
              : {
                  connections: [
                    {
                      id: '11111111-1111-4111-8111-111111111111',
                      name: 'Example assistant',
                      scopes: ['account:read', 'profiles:read'],
                      created_at: '2026-10-01T00:00:00Z',
                      expires_at: '2026-10-31T00:00:00Z',
                    },
                  ],
                }
          )
        : original(input, init)
    return () => {
      globalThis.fetch = original
    }
  },
}
export default meta
type Story = StoryObj<typeof ConnectionsPanel>
export const Connected: Story = {}
export const Disabled: Story = { args: { enabled: false } }

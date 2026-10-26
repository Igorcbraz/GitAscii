import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ConsentForm } from './ConsentForm'

const meta: Meta<typeof ConsentForm> = {
  title: 'Automation/Consent',
  component: ConsentForm,
  parameters: { layout: 'fullscreen' },
  args: {
    ticket: 'storybook-only',
    clientName: 'Example assistant',
    callbackHost: 'assistant.example',
    username: 'octocat',
    scopes: ['account:read', 'profiles:read'],
  },
  beforeEach: () => {
    const original = globalThis.fetch
    globalThis.fetch = async (input, init) =>
      String(input) === '/oauth/consent'
        ? Response.json({ error: 'Preview only: no account is connected.' }, { status: 503 })
        : original(input, init)
    return () => {
      globalThis.fetch = original
    }
  },
}
export default meta
type Story = StoryObj<typeof ConsentForm>
export const ReadOnly: Story = {}
export const PublicationAccess: Story = {
  args: {
    scopes: [
      'account:read',
      'profiles:read',
      'profiles:write',
      'profiles:publish',
      'analytics:read',
      'rules:write',
    ],
  },
}

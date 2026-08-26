import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { UnsubscribeClient } from './UnsubscribeClient'

const meta: Meta<typeof UnsubscribeClient> = {
  title: 'Pages/Unsubscribe',
  component: UnsubscribeClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    status: {
      control: 'radio',
      options: ['success', 'invalid', 'manage'],
      description: 'Status of the unsubscribe link resolution',
    },
    email: {
      control: 'text',
      description: 'Email address being unsubscribed',
    },
    username: {
      control: 'text',
      description: 'GitHub username associated with the account',
    },
  },
}

export default meta
type Story = StoryObj<typeof UnsubscribeClient>

export const SuccessWithEmail: Story = {
  args: {
    status: 'success',
    email: 'developer@example.com',
    username: 'octocat',
  },
}

export const SuccessGeneric: Story = {
  args: {
    status: 'success',
  },
}

export const InvalidToken: Story = {
  args: {
    status: 'invalid',
  },
}

export const ManagePreferences: Story = {
  args: {
    status: undefined,
    username: 'octocat',
    email: 'octocat@github.com',
  },
}

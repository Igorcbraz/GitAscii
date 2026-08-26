import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ReengagementEmail } from './ReengagementEmail'

const meta: Meta<typeof ReengagementEmail> = {
  title: 'Emails/ReengagementEmail',
  component: ReengagementEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    inactiveDays: { control: 'number', description: 'Days since last edit activity' },
    editorUrl: { control: 'text', description: 'GitAscii editor link' },
    exploreUrl: { control: 'text', description: 'Community gallery link' },
  },
}

export default meta
type Story = StoryObj<typeof ReengagementEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa Octocat',
    email: 'octocat@github.com',
    inactiveDays: 15,
    editorUrl: 'https://gitascii.com/octocat',
    exploreUrl: 'https://gitascii.com/explore',
  },
}

export const LongInactiveUser: Story = {
  args: {
    username: 'dev-veteran',
    name: 'Alex Developer',
    email: 'alex@example.com',
    inactiveDays: 45,
    editorUrl: 'https://gitascii.com/dev-veteran',
    exploreUrl: 'https://gitascii.com/explore',
  },
}

export const MinimalProps: Story = {
  args: {
    username: 'solo-hacker',
    email: 'hacker@example.com',
  },
}

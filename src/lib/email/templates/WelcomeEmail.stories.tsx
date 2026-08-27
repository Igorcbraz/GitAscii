import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WelcomeEmail } from './WelcomeEmail'

const meta: Meta<typeof WelcomeEmail> = {
  title: 'Emails/WelcomeEmail',
  component: WelcomeEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    editorUrl: { control: 'text', description: 'Deep link to GitAscii visual editor' },
  },
}

export default meta
type Story = StoryObj<typeof WelcomeEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa Octocat',
    email: 'octocat@github.com',
    editorUrl: 'https://gitascii.com/octocat',
  },
}

export const WithoutDisplayName: Story = {
  args: {
    username: 'torvalds',
    email: 'linus@kernel.org',
  },
}

export const CustomEditorDestination: Story = {
  args: {
    username: 'developer-pro',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    editorUrl: 'https://gitascii.com/developer-pro?template=cyberpunk',
  },
}

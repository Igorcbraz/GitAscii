import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StarThankYouEmail } from './StarThankYouEmail'

const meta: Meta<typeof StarThankYouEmail> = {
  title: 'Emails/StarThankYouEmail',
  component: StarThankYouEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    repoUrl: { control: 'text', description: 'GitAscii repository URL' },
    badgeSnippet: { control: 'text', description: 'Markdown snippet for README backer badge' },
  },
}

export default meta
type Story = StoryObj<typeof StarThankYouEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa',
    email: 'octocat@github.com',
    repoUrl: 'https://github.com/Igorcbraz/GitAscii',
    badgeSnippet:
      '[![GitAscii Backer](https://img.shields.io/badge/GitAscii-Backer-%23c5ff4a?style=for-the-badge&logo=github&logoColor=black)](https://github.com/Igorcbraz/GitAscii)',
  },
}

export const MinimalProps: Story = {
  args: {
    username: 'backer-dev',
    email: 'backer@example.com',
  },
}

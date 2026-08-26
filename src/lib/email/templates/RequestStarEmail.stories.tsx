import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { RequestStarEmail } from './RequestStarEmail'

const meta: Meta<typeof RequestStarEmail> = {
  title: 'Emails/RequestStarEmail',
  component: RequestStarEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    repoUrl: { control: 'text', description: 'GitAscii GitHub repository URL' },
    editorUrl: { control: 'text', description: 'GitAscii editor URL' },
  },
}

export default meta
type Story = StoryObj<typeof RequestStarEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa',
    email: 'octocat@github.com',
    repoUrl: 'https://github.com/Igorcbraz/GitAscii',
    editorUrl: 'https://gitascii.com/octocat',
  },
}

export const WithoutDisplayName: Story = {
  args: {
    username: 'torvalds',
    email: 'linus@kernel.org',
  },
}

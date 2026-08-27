import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AppDisconnectedEmail } from './AppDisconnectedEmail'

const meta: Meta<typeof AppDisconnectedEmail> = {
  title: 'Emails/AppDisconnectedEmail',
  component: AppDisconnectedEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    installUrl: { control: 'text', description: 'GitHub App re-installation URL' },
    repoName: { control: 'text', description: 'Target profile repository name' },
  },
}

export default meta
type Story = StoryObj<typeof AppDisconnectedEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa',
    email: 'octocat@github.com',
    installUrl: 'https://github.com/apps/gitascii/installations/new',
    repoName: 'octocat/octocat',
  },
}

export const CustomOrganizationRepo: Story = {
  args: {
    username: 'company-admin',
    name: 'DevOps Lead',
    email: 'admin@acme-corp.com',
    installUrl: 'https://github.com/apps/gitascii/installations/new',
    repoName: 'acme-corp/readme-profile',
  },
}

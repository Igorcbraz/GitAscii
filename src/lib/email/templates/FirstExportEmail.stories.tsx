import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FirstExportEmail } from './FirstExportEmail'

const meta: Meta<typeof FirstExportEmail> = {
  title: 'Emails/FirstExportEmail',
  component: FirstExportEmail,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    username: { control: 'text', description: 'GitHub username' },
    name: { control: 'text', description: 'User display name' },
    email: { control: 'text', description: 'Recipient email address' },
    profileSlug: { control: 'text', description: 'Exported profile layout slug' },
    widgetCount: { control: 'number', description: 'Number of active widgets in layout' },
    previewUrl: { control: 'text', description: 'Dynamic SVG preview URL' },
    githubProfileUrl: { control: 'text', description: 'GitHub user profile URL' },
    editorUrl: { control: 'text', description: 'GitAscii editor URL' },
  },
}

export default meta
type Story = StoryObj<typeof FirstExportEmail>

export const Default: Story = {
  args: {
    username: 'octocat',
    name: 'Mona Lisa Octocat',
    email: 'octocat@github.com',
    profileSlug: 'default',
    widgetCount: 5,
    previewUrl: 'https://gitascii.com/api/octocat',
    githubProfileUrl: 'https://github.com/octocat',
    editorUrl: 'https://gitascii.com/octocat',
  },
}

export const CustomSlugAndManyWidgets: Story = {
  args: {
    username: 'torvalds',
    name: 'Linus Torvalds',
    email: 'linus@kernel.org',
    profileSlug: 'terminal-pro',
    widgetCount: 12,
    previewUrl: 'https://gitascii.com/api/torvalds/terminal-pro',
    githubProfileUrl: 'https://github.com/torvalds',
    editorUrl: 'https://gitascii.com/torvalds?slug=terminal-pro',
  },
}

export const MinimalDetails: Story = {
  args: {
    username: 'coder123',
    email: 'coder@example.com',
  },
}

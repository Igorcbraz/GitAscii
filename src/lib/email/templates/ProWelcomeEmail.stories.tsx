import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProWelcomeEmail } from './ProWelcomeEmail'

const meta = {
  title: 'Emails/Pro Welcome',
  component: ProWelcomeEmail,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'octocat',
    name: 'Mona Octocat',
    email: 'octocat@example.com',
    dashboardUrl: 'https://gitascii.com/pro',
    locale: 'en',
  },
} satisfies Meta<typeof ProWelcomeEmail>

export default meta
type Story = StoryObj<typeof meta>

export const NamedRecipient: Story = {}
export const WithoutDisplayName: Story = { args: { name: undefined } }
export const Portuguese: Story = { args: { locale: 'pt' } }

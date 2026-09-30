import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SubscriptionCancelledEmail } from './SubscriptionCancelledEmail'

const meta = {
  title: 'Emails/Subscription Cancelled',
  component: SubscriptionCancelledEmail,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'octocat',
    name: 'Mona Octocat',
    email: 'octocat@example.com',
    feedbackUrl: 'https://gitascii.com/feedback',
    locale: 'en',
  },
} satisfies Meta<typeof SubscriptionCancelledEmail>

export default meta
type Story = StoryObj<typeof meta>

export const WithFeedbackLink: Story = {}
export const WithoutFeedbackLink: Story = { args: { feedbackUrl: undefined } }
export const Portuguese: Story = { args: { locale: 'pt' } }

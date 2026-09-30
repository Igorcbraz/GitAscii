import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { DailyDigestEmail } from './DailyDigestEmail'

const meta = {
  title: 'Emails/Daily Digest',
  component: DailyDigestEmail,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'octocat',
    email: 'octocat@example.com',
    totalViews: 1284,
    uniqueVisitors: 463,
    topWidget: 'GitHub Stats',
    locale: 'en',
  },
} satisfies Meta<typeof DailyDigestEmail>

export default meta
type Story = StoryObj<typeof meta>

export const WithActivity: Story = {}
export const NoActivity: Story = {
  args: { totalViews: 0, uniqueVisitors: 0, topWidget: undefined },
}
export const Portuguese: Story = { args: { locale: 'pt' } }

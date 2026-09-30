import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WidgetErrorAlertEmail } from './WidgetErrorAlertEmail'

const meta = {
  title: 'Emails/Widget Error Alert',
  component: WidgetErrorAlertEmail,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'octocat',
    email: 'octocat@example.com',
    widgetName: 'GitHub Stats',
    errorMessage: 'GitHub returned a temporary rate limit response.',
    profileSlug: 'default',
    dashboardUrl: 'https://gitascii.com/pro/errors',
    locale: 'en',
  },
} satisfies Meta<typeof WidgetErrorAlertEmail>

export default meta
type Story = StoryObj<typeof meta>

export const TransientFailure: Story = {}
export const LongErrorMessage: Story = {
  args: {
    errorMessage:
      'The upstream data source did not respond before the configured timeout. Existing profile content remains available while the next refresh is attempted.',
  },
}
export const Portuguese: Story = { args: { locale: 'pt' } }

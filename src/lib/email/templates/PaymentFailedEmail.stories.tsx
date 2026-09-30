import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PaymentFailedEmail } from './PaymentFailedEmail'

const meta = {
  title: 'Emails/Payment Failed',
  component: PaymentFailedEmail,
  parameters: { layout: 'fullscreen' },
  args: {
    username: 'octocat',
    email: 'octocat@example.com',
    amountDue: '$12.00',
    billingUrl: 'https://gitascii.com/pro/settings/billing',
    locale: 'en',
  },
} satisfies Meta<typeof PaymentFailedEmail>

export default meta
type Story = StoryObj<typeof meta>

export const WithAmount: Story = {}
export const WithoutAmount: Story = { args: { amountDue: undefined } }
export const Portuguese: Story = { args: { locale: 'pt' } }

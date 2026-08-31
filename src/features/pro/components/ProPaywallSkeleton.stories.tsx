import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProPaywallSkeleton } from './ProPaywallSkeleton'

const meta: Meta<typeof ProPaywallSkeleton> = {
  title: 'Pro/Components/ProPaywallSkeleton',
  component: ProPaywallSkeleton,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ProPaywallSkeleton>

export const Default: Story = {}

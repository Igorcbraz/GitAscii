import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProPaywall } from './ProPaywall'

const meta: Meta<typeof ProPaywall> = {
  title: 'Pro/Components/ProPaywall',
  component: ProPaywall,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ProPaywall>

export const Default: Story = {
  args: {
    username: 'octocat',
    isUpgrading: false,
    upgradeSuccess: false,
    onUpgrade: () => console.log('Upgrade clicked'),
  },
}

export const Processing: Story = {
  args: {
    username: 'octocat',
    isUpgrading: true,
    upgradeSuccess: false,
    onUpgrade: () => console.log('Upgrade clicked'),
  },
}

export const Success: Story = {
  args: {
    username: 'octocat',
    isUpgrading: false,
    upgradeSuccess: true,
    onUpgrade: () => console.log('Upgrade clicked'),
  },
}

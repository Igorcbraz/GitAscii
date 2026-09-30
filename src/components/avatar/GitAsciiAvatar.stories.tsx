import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GitAsciiAvatar } from './GitAsciiAvatar'
import { GitAsciiLogo } from './GitAsciiLogo'

const meta = {
  title: 'Brand/GitAscii Avatar',
  component: GitAsciiAvatar,
  args: { size: 120, expression: 'happy', theme: 'dark' },
  argTypes: {
    expression: {
      control: 'select',
      options: ['neutral', 'happy', 'curious', 'focused', 'sleeping', 'playful'],
    },
    theme: { control: 'select', options: ['dark', 'light', 'terminal', 'monochrome'] },
    variant: { control: 'select', options: ['default', 'octo'] },
  },
  decorators: [
    (Story) => (
      <div className="rounded-lg bg-carbon p-10 text-chalk">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GitAsciiAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Static: Story = {}
export const Animated: Story = { args: { animated: true, animation: 'idle' } }
export const LightTheme: Story = {
  args: { theme: 'light', expression: 'curious' },
  decorators: [
    (Story) => (
      <div className="bg-white p-6">
        <Story />
      </div>
    ),
  ],
}
export const OctoVariant: Story = { args: { variant: 'octo', expression: 'playful' } }
export const Logo: Story = { render: () => <GitAsciiLogo size={48} /> }
export const IconOnly: Story = { render: () => <GitAsciiLogo size={72} iconOnly animated /> }

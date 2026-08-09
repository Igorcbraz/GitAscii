import type { Meta, StoryObj } from '@storybook/nextjs'

import { CanvasStatusBar } from './CanvasStatusBar'

const meta: Meta<typeof CanvasStatusBar> = {
  title: 'Editor/CanvasStatusBar',
  component: CanvasStatusBar,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full flex items-end justify-center min-h-[100px] border border-graphite bg-black">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CanvasStatusBar>

export const Default: Story = {
  args: {
    showInfo: true,
  },
}

export const WithoutInfo: Story = {
  args: {
    showInfo: false,
  },
}

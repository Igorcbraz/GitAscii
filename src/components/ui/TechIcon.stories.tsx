import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { TechIcon } from './TechIcon'

const meta: Meta<typeof TechIcon> = {
  title: 'UI/TechIcon',
  component: TechIcon,
  argTypes: {
    name: {
      control: 'select',
      options: ['react', 'nextjs', 'python', 'node', 'go', 'rust', 'unknown'],
    },
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-carbon border border-graphite min-h-[100px] flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TechIcon>

export const SingleIcon: Story = {
  args: {
    name: 'react',
    className: 'size-12 text-signal-lime',
  },
}

export const AllIconsGrid: Story = {
  render: (args) => {
    const icons = ['react', 'nextjs', 'python', 'node', 'go', 'rust', 'fallback-placeholder']
    return (
      <div className="grid grid-cols-4 gap-6 text-chalk">
        {icons.map((icon) => (
          <div
            key={icon}
            className="flex flex-col items-center gap-2 border border-graphite p-4 bg-onyx min-w-[100px]"
          >
            <TechIcon {...args} name={icon} className="size-8 text-signal-lime" />
            <span className="font-jetbrains-mono text-caption text-ash">{icon}</span>
          </div>
        ))}
      </div>
    )
  },
}

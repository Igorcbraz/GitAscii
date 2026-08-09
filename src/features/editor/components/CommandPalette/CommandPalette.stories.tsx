import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import { CommandPalette } from './CommandPalette'

const meta: Meta<typeof CommandPalette> = {
  title: 'Editor/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof CommandPalette>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <div className="w-full h-screen bg-black">
        <button onClick={() => setOpen(true)} className="p-4 text-white">
          Open Command Palette
        </button>
        <CommandPalette
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          onCommit={() => console.log('commit')}
          onExport={() => console.log('export')}
        />
      </div>
    )
  },
}

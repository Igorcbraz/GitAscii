import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mockSession } from '../../../../.storybook/mockFetch'
import Navbar from './Navbar'

const meta = {
  title: 'Landing/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
  },
  decorators: [
    (Story) => (
      <div className="w-full min-h-screen bg-void-black text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Anonymous: Story = { beforeEach: () => mockSession() }
export const LoggedIn: Story = { beforeEach: () => mockSession('Igorcbraz', 1042) }
export const Mobile: Story = {
  beforeEach: () => mockSession(),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mockSession } from '../../../../.storybook/mockFetch'
import { ToastProvider } from '../../../components/ui/toast'
import { ProLayout } from './ProLayout'

const meta = {
  title: 'Pro/Layout/Authenticated Shell',
  component: ProLayout,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/pro' } },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof ProLayout>

export default meta
type Story = StoryObj<typeof meta>

const content = (
  <div className="p-10">
    <h1 className="text-3xl font-semibold">Overview</h1>
    <p className="mt-4 text-ash">Authenticated dashboard content.</p>
  </div>
)

export const ProMember: Story = {
  args: { children: content },
  beforeEach: () => mockSession('octocat'),
}
export const FreeMember: Story = {
  args: { children: content },
  beforeEach: () => mockSession('octocat', 563, false),
}
export const Guest: Story = { args: { children: content }, beforeEach: () => mockSession() }

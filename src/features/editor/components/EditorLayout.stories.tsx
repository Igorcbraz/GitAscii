import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mockStoryFetch } from '../../../../.storybook/mockFetch'
import { EditorLayout } from './EditorLayout'
import { mockGithubData } from './stories/mockData'

const meta = {
  title: 'Editor/EditorLayout',
  component: EditorLayout,
  args: { username: 'Igorcbraz', profileSlug: 'default', autoGenerate: false },
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/Igorcbraz/default/edit' } },
  },
  beforeEach: () =>
    mockStoryFetch((url) => {
      if (url.includes('/api/github/')) return { body: mockGithubData }
      if (url.includes('/api/auth/session')) return { body: { session: null } }
      return undefined
    }),
  decorators: [
    (Story) => (
      <div className="h-screen w-screen overflow-hidden bg-carbon">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditorLayout>

export default meta
type Story = StoryObj<typeof meta>

export const ExistingProfile: Story = {}
export const AutoGenerate: Story = { args: { autoGenerate: true } }

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mockSession } from '../../../../.storybook/mockFetch'
import { ToastProvider } from '../../../components/ui/toast'
import { StrobiRoot } from '../../mascot/components/StrobiRoot'
import Hero from './Hero'

const meta = {
  title: 'Landing/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
    docs: {
      description: {
        component:
          'Hero with its real entrance and pointer interactions. Authentication is fixed before render for reproducible variants.',
      },
    },
  },
  decorators: [
    (Story) => (
      <StrobiRoot>
        <ToastProvider>
          <div className="relative min-h-screen w-full bg-carbon text-white">
            <Story />
          </div>
        </ToastProvider>
      </StrobiRoot>
    ),
  ],
} satisfies Meta<typeof Hero>

export default meta
type Story = StoryObj<typeof meta>

export const Anonymous: Story = { beforeEach: () => mockSession() }
export const LoggedIn: Story = { beforeEach: () => mockSession('Igorcbraz') }

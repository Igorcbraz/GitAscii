import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LandingMascotClient } from '../landing/components/LandingMascotClient'
import { StrobiAnchor } from './components/StrobiAnchor'
import { StrobiRoot } from './components/StrobiRoot'

const meta = {
  title: 'Mascot/Landing Companion',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The production mascot host and landing journey. The character appears after the normal idle delay; move the pointer to inspect gaze and hover behavior.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Landing: Story = {
  render: () => (
    <StrobiRoot>
      <div className="min-h-screen bg-carbon p-12 text-chalk">
        <LandingMascotClient />
        <h1 className="font-pt-serif text-5xl">Meet Strobi</h1>
        <p className="mt-4 max-w-md font-inter-tight text-bone">
          The mascot follows the anchor and responds to pointer movement.
        </p>
        <div className="mt-20">
          <StrobiAnchor id="hero-cta" size={100} restingMood="happy" />
        </div>
      </div>
    </StrobiRoot>
  ),
}

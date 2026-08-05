import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Shield, Terminal, Zap } from 'lucide-react'
import React from 'react'

import { FeatureCard } from './grid-feature-cards'

const meta: Meta<typeof FeatureCard> = {
  title: 'UI/FeatureCard',
  component: FeatureCard,
  argTypes: {
    index: { control: 'number' },
    className: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div className="p-12 bg-carbon border border-graphite min-h-[300px] flex items-center justify-center">
        <div className="max-w-md w-full">
          <Story />
        </div>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FeatureCard>

export const SingleCard: Story = {
  args: {
    index: 0,
    feature: {
      title: 'ASCII Art Engine',
      icon: Terminal,
      description:
        'Convert any image to high-fidelity character grids directly in your browser with optimized contrast mapping.',
    },
  },
}

export const GridOfCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-chalk bg-carbon p-6">
      <FeatureCard
        index={0}
        feature={{
          title: 'ASCII Art Engine',
          icon: Terminal,
          description:
            'Convert any image to high-fidelity character grids directly in your browser with optimized contrast mapping.',
        }}
      />
      <FeatureCard
        index={1}
        feature={{
          title: 'Dynamic Statistics',
          icon: Zap,
          description:
            'Deploy SVGs that render live GitHub commit histories, language counts, and stars dynamically cached.',
        }}
      />
      <FeatureCard
        index={2}
        feature={{
          title: 'Edge Optimization',
          icon: Shield,
          description:
            'Ultra-fast Next.js Edge handlers delivering lightweight markup optimized for GitHub Camo caching mechanisms.',
        }}
      />
    </div>
  ),
}

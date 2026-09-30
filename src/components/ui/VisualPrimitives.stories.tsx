import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { AnimatedCounter } from './AnimatedCounter'
import { DecryptedText } from './DecryptedText'
import { DeferredWrapper } from './DeferredWrapper'
import { LaserFlow } from './LaserFlow'
import { MagicBentoCard } from './MagicBento'
import { Particles } from './Particles'
import { ScrollExpand } from './ScrollExpand'
import { SpotlightCard } from './SpotlightCard'
import { Squares } from './Squares'
import { Switch } from './Switch'
import { TiltCard } from './TiltCard'

const meta = {
  title: 'UI/Visual Primitives',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visual building blocks used across the landing and editor. Hover the cards, move the pointer over the canvases, and scroll the expansion example to inspect their real interactions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-carbon p-8 font-inter-tight text-chalk">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const cardContent = (
  <div className="space-y-3 p-8">
    <span className="font-jetbrains-mono text-xs uppercase tracking-widest text-signal-lime">
      Interactive surface
    </span>
    <h2 className="font-pt-serif text-3xl">Move your pointer here</h2>
    <p className="max-w-sm text-sm text-bone">The effect follows focus or pointer movement.</p>
  </div>
)

export const AnimatedValue: Story = {
  render: () => (
    <div className="flex items-baseline gap-3">
      <AnimatedCounter
        value={12400}
        duration={1.4}
        className="text-5xl font-bold text-signal-lime"
      />
      <span className="text-ash">profiles created</span>
    </div>
  ),
}

export const DecryptOnView: Story = {
  render: () => (
    <DecryptedText text="BUILD SOMETHING REMARKABLE" className="font-jetbrains-mono text-2xl" />
  ),
}

export const DecryptOnHover: Story = {
  render: () => (
    <DecryptedText
      text="HOVER TO DECRYPT"
      animateOn="hover"
      className="font-jetbrains-mono text-2xl"
    />
  ),
}

export const DeferredContent: Story = {
  render: () => (
    <DeferredWrapper minHeight="160px">
      <div className="border border-graphite bg-onyx p-8">
        Loaded when this region approaches the viewport.
      </div>
    </DeferredWrapper>
  ),
}

export const LaserBorder: Story = {
  render: () => (
    <div className="relative w-80 rounded-xl p-8">
      <LaserFlow />
      <div className="relative z-10">Animated signal border</div>
    </div>
  ),
}

export const MagicBento: Story = {
  render: () => <MagicBentoCard className="max-w-lg">{cardContent}</MagicBentoCard>,
}

export const Spotlight: Story = {
  render: () => <SpotlightCard className="max-w-lg">{cardContent}</SpotlightCard>,
}

export const Tilt: Story = {
  render: () => (
    <TiltCard className="max-w-lg border border-graphite bg-onyx">{cardContent}</TiltCard>
  ),
}

export const ParticlesField: Story = {
  render: () => (
    <div className="relative h-80 max-w-2xl overflow-hidden border border-graphite bg-onyx">
      <Particles quantity={55} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center font-pt-serif text-3xl">
        Particles
      </div>
    </div>
  ),
}

export const SquaresField: Story = {
  render: () => (
    <div className="relative h-80 max-w-2xl overflow-hidden border border-graphite bg-onyx">
      <Squares direction="diagonal" squareSize={48} />
      <div className="pointer-events-none absolute inset-0 grid place-items-center font-pt-serif text-3xl">
        Squares
      </div>
    </div>
  ),
}

export const ScrollExpansion: Story = {
  render: () => (
    <div className="space-y-24">
      <p className="text-ash">Scroll to see the section enter the viewport.</p>
      <ScrollExpand innerClassName="border border-signal-lime/30 bg-onyx p-12">
        <h2 className="font-pt-serif text-4xl">A section with motion</h2>
      </ScrollExpand>
      <div className="h-screen" />
    </div>
  ),
}

function InteractiveSwitch() {
  const [checked, setChecked] = useState(false)
  return <Switch checked={checked} onChange={setChecked} />
}

export const SwitchStates: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <label className="flex items-center gap-3">
        Interactive <InteractiveSwitch />
      </label>
      <label className="flex items-center gap-3">
        On <Switch checked onChange={() => {}} />
      </label>
      <label className="flex items-center gap-3">
        Off <Switch checked={false} onChange={() => {}} />
      </label>
    </div>
  ),
}

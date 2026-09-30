import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StrobiRoot } from '../../mascot/components/StrobiRoot'
import { CommunityProfiles } from './CommunityProfiles'
import { ProPricingSection } from './ComparisonTable'
import { DeferredTractionBar } from './DeferredLandingPreviews'
import { EcosystemHub } from './EcosystemHub'
import { FinalCTA } from './FinalCTA'
import { InteractiveEditorDemo } from './InteractiveEditorDemo'
import { LandingBackgroundDecorations } from './LandingBackgroundDecorations'
import { LandingMiniEditor } from './LandingMiniEditor'
import { TemplatesPreview } from './TemplatesPreview'
import { TractionBar } from './TractionBar'
import { WhyGitAscii } from './WhyGitAscii'
import { WidgetsShowcase } from './WidgetsShowcase'

const meta = {
  title: 'Landing/Sections',
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
    docs: {
      description: {
        component:
          'Production landing sections shown in isolation. Their interactive content, animations, and links are preserved. Use a wide viewport for desktop and a narrow viewport to inspect responsive layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <StrobiRoot>
        <div className="min-h-screen bg-carbon text-chalk">
          <Story />
        </div>
      </StrobiRoot>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Community: Story = { render: () => <CommunityProfiles /> }
export const Pricing: Story = {
  render: () => <ProPricingSection proCustomers={124} proUsernames={['octocat', 'developer']} />,
}
export const Ecosystem: Story = { render: () => <EcosystemHub /> }
export const FinalCallToAction: Story = { render: () => <FinalCTA /> }
export const InteractiveDemo: Story = { render: () => <InteractiveEditorDemo /> }
export const MiniEditor: Story = { render: () => <LandingMiniEditor /> }
export const TemplatePreview: Story = { render: () => <TemplatesPreview count={18} /> }
export const Traction: Story = { render: () => <TractionBar /> }
export const WhyGitAsciiSection: Story = { render: () => <WhyGitAscii /> }
export const WidgetPreview: Story = { render: () => <WidgetsShowcase count={70} /> }
export const DeferredTraction: Story = {
  render: () => <DeferredTractionBar />,
  parameters: {
    docs: {
      description: {
        story: 'Shows the viewport triggered loading boundary used on the landing page.',
      },
    },
  },
}
export const BackgroundDecorations: Story = {
  render: () => (
    <div className="relative min-h-screen overflow-hidden">
      <LandingBackgroundDecorations />
      <div className="relative z-10 px-8 py-24 font-pt-serif text-4xl">Landing background</div>
    </div>
  ),
}

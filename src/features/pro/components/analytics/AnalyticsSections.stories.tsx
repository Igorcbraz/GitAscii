import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { analyticsFixture } from './analyticsFixture'
import { AnalyticsGeoSection } from './AnalyticsGeoSection'
import { AnalyticsKpiStrip } from './AnalyticsKpiStrip'

const meta = {
  title: 'Pro/Analytics/Sections',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Analytics sections with stable populated and empty API states. Country selection is interactive.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-[#080808] p-8 text-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Geography({ empty = false }: { empty?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <AnalyticsGeoSection
      summary={empty ? null : analyticsFixture}
      selectedCountryCode={selected}
      setSelectedCountryCode={setSelected}
    />
  )
}

export const GeographyWithData: Story = { render: () => <Geography /> }
export const GeographyEmpty: Story = { render: () => <Geography empty /> }
export const KpisWithData: Story = {
  render: () => <AnalyticsKpiStrip summary={analyticsFixture} activeLiveCount={8} />,
}
export const KpisEmpty: Story = {
  render: () => <AnalyticsKpiStrip summary={null} activeLiveCount={0} />,
}

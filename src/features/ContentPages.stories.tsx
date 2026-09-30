import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { mockSession } from '../../.storybook/mockFetch'
import ExploreClientPage from '../app/explore/ExploreClientPage'
import { COMPETITORS_MAP, WIDGET_DOCS_MAP } from '../constants'
import { PrivacyPolicyClient } from './legal/PrivacyPolicyClient'
import { RefundPolicyClient } from './legal/RefundPolicyClient'
import { SupportClient } from './legal/SupportClient'
import { TermsOfUseClient } from './legal/TermsOfUseClient'
import { type StackData, TemplateDetailClient } from './templates/TemplateDetailClient'
import { CompetitorDetailClient } from './vs/CompetitorDetailClient'
import { WidgetDetailClient } from './widgets/WidgetDetailClient'

const reactStack: StackData = {
  slug: 'react',
  name: 'React.js',
  title: 'React Developer GitHub Profile README Template',
  description: 'Showcase a React developer profile with dynamic GitAscii widgets.',
  vibe: 'Component-driven',
  accent: '#61dafb',
  bg: '#0d1117',
  badges: ['React', 'TypeScript', 'Next.js'],
  codeSnippet: '![React Stats](https://gitascii.com/api/octocat?theme=terminal)',
  bestPractices: ['Highlight maintained libraries.', 'Use live contribution data.'],
  commonMistakes: ['Too many static badges without context.'],
  faqs: [{ question: 'Can I customize this template?', answer: 'Yes. Open the visual editor.' }],
}

const meta = {
  title: 'Pages/Content',
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: '/' } },
    docs: {
      description: {
        component:
          'Content page compositions with fixed example data. Navigation and calls to the session API are isolated in Storybook.',
      },
    },
  },
  beforeEach: () => mockSession(),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ExploreWithProfiles: Story = {
  render: () => (
    <ExploreClientPage
      profiles={[
        {
          username: 'octocat',
          profileSlug: 'default',
          templateId: 'terminal',
          widgetsCount: 5,
          hasAsciiArt: true,
          tags: ['React', 'Open Source'],
          isStored: true,
        },
      ]}
    />
  ),
}
export const ExploreEmpty: Story = { render: () => <ExploreClientPage profiles={[]} /> }
export const TemplateDetail: Story = {
  render: () => (
    <TemplateDetailClient
      data={reactStack}
      allStackKeys={['react']}
      stacks={{ react: reactStack }}
    />
  ),
}
export const WidgetDetail: Story = {
  render: () => (
    <WidgetDetailClient
      data={WIDGET_DOCS_MAP.stats}
      allWidgets={['stats']}
      widgetMap={{ stats: WIDGET_DOCS_MAP.stats }}
    />
  ),
}
export const CompetitorDetail: Story = {
  render: () => (
    <CompetitorDetailClient data={COMPETITORS_MAP['readme-so']} allCompetitors={['readme-so']} />
  ),
}
export const PrivacyPolicy: Story = { render: () => <PrivacyPolicyClient /> }
export const RefundPolicy: Story = { render: () => <RefundPolicyClient /> }
export const TermsOfUse: Story = { render: () => <TermsOfUseClient /> }
export const Support: Story = { render: () => <SupportClient /> }

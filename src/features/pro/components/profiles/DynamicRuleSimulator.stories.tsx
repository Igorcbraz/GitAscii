import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React, { useState } from 'react'

import type { DynamicEvaluationResult, ProProfileRecord } from '../../types'
import { DynamicRuleSimulator } from './DynamicRuleSimulator'

const profiles: ProProfileRecord[] = [
  {
    id: 'profile_default',
    slug: 'default',
    name: 'Primary profile',
    status: 'active',
    isDefault: true,
    widgetsCount: 8,
    totalViews: 18240,
    lastUpdated: '2026-08-20T00:00:00Z',
    createdAt: '2026-01-10T00:00:00Z',
    publicUrl: 'https://gitascii.com/demo',
    rawSvgUrl: 'https://gitascii.com/api/demo',
  },
  {
    id: 'profile_minimal',
    slug: 'minimal',
    name: 'Weekend minimal',
    status: 'active',
    isDefault: false,
    widgetsCount: 4,
    totalViews: 3650,
    lastUpdated: '2026-08-20T00:00:00Z',
    createdAt: '2026-02-10T00:00:00Z',
    publicUrl: 'https://gitascii.com/demo/minimal',
    rawSvgUrl: 'https://gitascii.com/api/demo/minimal',
  },
]

const matchedResult: DynamicEvaluationResult = {
  selectedProfileSlug: 'minimal',
  matchedRule: {
    id: 'weekend',
    name: 'Weekend minimal',
    targetProfileSlug: 'minimal',
    priority: 100,
    enabled: true,
    type: 'weekend',
    daysOfWeek: [0, 6],
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
  },
  isFallback: false,
  evaluationReason: 'The weekend rule matched Saturday at 15:00.',
  evaluationTimestamp: '2026-08-22T18:00:00Z',
  simulatedTimezone: 'America/Sao_Paulo',
  evaluatedRules: [
    {
      ruleId: 'weekend',
      ruleName: 'Weekend minimal',
      priority: 100,
      targetProfileSlug: 'minimal',
      matched: true,
      reason: 'Saturday is within the configured days.',
    },
  ],
}

const fallbackResult: DynamicEvaluationResult = {
  ...matchedResult,
  selectedProfileSlug: 'default',
  matchedRule: null,
  isFallback: true,
  evaluationReason: 'No active rule matched; showing the default profile.',
  evaluatedRules: matchedResult.evaluatedRules.map((step) => ({
    ...step,
    matched: false,
    reason: 'Tuesday is outside the configured days.',
  })),
}

const timezoneOptions = [
  { value: 'America/Sao_Paulo', label: 'São Paulo', sublabel: 'UTC−03:00' },
  { value: 'UTC', label: 'UTC', sublabel: 'UTC+00:00' },
]

type SimulatorProps = React.ComponentProps<typeof DynamicRuleSimulator>

function InteractiveSimulator(props: SimulatorProps) {
  const [simDate, setSimDate] = useState(props.simDate)
  const [simTimezone, setSimTimezone] = useState(props.simTimezone)
  const [simResult, setSimResult] = useState(props.simResult)

  const runSimulation = async (date = simDate) => {
    setSimResult(date.startsWith('2026-08-22') ? matchedResult : fallbackResult)
  }

  return (
    <DynamicRuleSimulator
      {...props}
      simDate={simDate}
      setSimDate={setSimDate}
      simTimezone={simTimezone}
      setSimTimezone={setSimTimezone}
      simResult={simResult}
      onRunSimulation={runSimulation}
      onQuickPreset={(preset) => {
        const date = preset === 'weekend' ? '2026-08-22T15:00' : '2026-08-25T14:30'
        setSimDate(date)
        void runSimulation(date)
      }}
    />
  )
}

const meta = {
  title: 'Pro/Profiles/DynamicRuleSimulator',
  component: DynamicRuleSimulator,
  render: (args) => <InteractiveSimulator {...args} />,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="bg-[#080808] p-8 text-white max-w-2xl w-full">
        <Story />
      </div>
    ),
  ],
  args: {
    username: 'demo',
    profiles,
    simDate: '2026-08-22T15:00',
    setSimDate: () => {},
    simTimezone: 'America/Sao_Paulo',
    setSimTimezone: () => {},
    simulating: false,
    simResult: matchedResult,
    timezoneOptions,
    onRunSimulation: async () => {},
    onQuickPreset: () => {},
  },
} satisfies Meta<typeof DynamicRuleSimulator>

export default meta
type Story = StoryObj<typeof meta>

export const MatchedRule: Story = {}
export const DefaultFallback: Story = { args: { simResult: fallbackResult } }
export const BeforeSimulation: Story = { args: { simResult: null } }
export const Simulating: Story = { args: { simulating: true, simResult: null } }

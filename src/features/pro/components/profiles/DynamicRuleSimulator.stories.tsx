import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import type { ProDynamicRuleRecord } from '../../types'
import { DynamicRuleSimulator } from './DynamicRuleSimulator'

const mockRules: ProDynamicRuleRecord[] = [
  {
    id: 'rule_1',
    name: 'Weekend Minimalist',
    description: 'Switch to minimal view during weekends',
    targetProfileSlug: 'minimal',
    priority: 10,
    isActive: true,
    conditionType: 'day_of_week',
    conditionConfig: {
      days: [0, 6],
    },
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z',
    matchCount: 42,
  },
]

const meta: Meta<typeof DynamicRuleSimulator> = {
  title: 'Pro/Profiles/DynamicRuleSimulator',
  component: DynamicRuleSimulator,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="bg-[#080808] p-8 text-white max-w-2xl w-full">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DynamicRuleSimulator>

export const Default: Story = {
  args: {
    rules: mockRules,
    defaultSlug: 'default',
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { ConfirmDialog } from './ConfirmDialog'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Pro/Components/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="relative w-[500px] h-[350px] bg-[#0a0a0a]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const DangerDeleteProfile: Story = {
  args: {
    isOpen: true,
    title: 'Delete Custom Profile?',
    description:
      'Are you sure you want to delete profile "compact"? This action is irreversible and all associated telemetry will be purged.',
    confirmLabel: 'Delete Profile',
    cancelLabel: 'Cancel',
    variant: 'danger',
    isLoading: false,
    onConfirm: () => console.log('Confirmed delete'),
    onClose: () => console.log('Closed dialog'),
  },
}

export const WarningResetErrors: Story = {
  args: {
    isOpen: true,
    title: 'Clear All Widget Errors',
    description:
      'This will remove all error tracking history from your dashboard. Active alerts will be marked as resolved.',
    confirmLabel: 'Clear All',
    cancelLabel: 'Keep Logs',
    variant: 'warning',
    isLoading: false,
    onConfirm: () => console.log('Confirmed clear'),
    onClose: () => console.log('Closed dialog'),
  },
}

export const LoadingState: Story = {
  args: {
    isOpen: true,
    title: 'Processing Request',
    description: 'Please wait while we update your profile configuration on edge servers.',
    confirmLabel: 'Confirm',
    variant: 'primary',
    isLoading: true,
    onConfirm: () => {},
    onClose: () => {},
  },
}

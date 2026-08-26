import { Heading, Text } from '@react-email/components'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import React from 'react'

import { EmailButton } from './EmailButton'
import { EmailLayout } from './EmailLayout'

const meta: Meta<typeof EmailLayout> = {
  title: 'Emails/Components/EmailLayout',
  component: EmailLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    previewText: { control: 'text', description: 'Email inbox preview line' },
    email: { control: 'text', description: 'Recipient email address' },
    username: { control: 'text', description: 'Recipient GitHub username' },
    showUnsubscribe: {
      control: 'boolean',
      description: 'Whether to render the unsubscribe footer',
    },
  },
}

export default meta
type Story = StoryObj<typeof EmailLayout>

export const Default: Story = {
  args: {
    previewText: 'Sample notification preview line for testing layout',
    email: 'developer@example.com',
    username: 'octocat',
    showUnsubscribe: true,
    children: (
      <div>
        <Heading
          as="h1"
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#f4f4f5',
            margin: '0 0 16px 0',
          }}
        >
          Custom Email Header
        </Heading>
        <Text
          style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#d4d4d8',
            margin: '0 0 24px 0',
          }}
        >
          This is a sample email body demonstrating how arbitrary React Email elements render inside
          the unified GitAscii dark editorial layout wrapper.
        </Text>
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <EmailButton href="https://gitascii.com">Test Action Button</EmailButton>
        </div>
      </div>
    ),
  },
}

export const WithoutUnsubscribe: Story = {
  args: {
    previewText: 'Transactional notification',
    email: 'admin@example.com',
    username: 'admin',
    showUnsubscribe: false,
    children: (
      <div>
        <Heading as="h1" style={{ fontSize: '20px', color: '#f4f4f5' }}>
          Essential System Notification
        </Heading>
        <Text style={{ fontSize: '14px', color: '#a1a1aa' }}>
          This transactional layout omits marketing unsubscribe links in compliance with RFC
          standards.
        </Text>
      </div>
    ),
  },
}

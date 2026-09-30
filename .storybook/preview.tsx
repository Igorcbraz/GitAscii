// @ts-expect-error CSS module declaration is provided by the Next.js build/runtime.
import '../src/app/globals.css'
import './preview.css'

import type { Preview } from '@storybook/nextjs-vite'
import React from 'react'

import { StrobiProvider } from '../src/features/mascot/core/StrobiContext'
import { I18nProvider } from '../src/i18n'
import { EmailCanvas } from './EmailCanvas'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    (Story, context) => (
      <I18nProvider>
        <StrobiProvider initialAnchor="hero-cta">
          {context.title.startsWith('Emails/') ? <EmailCanvas story={<Story />} /> : <Story />}
        </StrobiProvider>
      </I18nProvider>
    ),
  ],
}

export default preview

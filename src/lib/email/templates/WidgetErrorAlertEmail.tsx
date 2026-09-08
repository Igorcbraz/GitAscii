import { CodeInline, Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { WidgetErrorAlertEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { EmailLayout } from './components/EmailLayout'

export function WidgetErrorAlertEmail({
  username,
  email,
  widgetName,
  errorMessage,
  profileSlug,
  dashboardUrl,
  locale = 'en',
}: WidgetErrorAlertEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const targetUrl = dashboardUrl || `${baseUrl}/pro/errors`

  return (
    <EmailLayout
      previewText={t('email.widget_error.preview', 'Alert: Widget {widgetName} failed to render.', {
        widgetName,
      })}
      email={email}
      username={username}
      locale={locale}
    >
      <div style={{ marginBottom: '12px' }}>
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '11px',
            fontWeight: '700',
            color: '#ef4444',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.widget_error.badge', '[ WIDGET ALERT ]')}
        </span>
      </div>

      <Heading
        as="h1"
        style={{
          fontSize: '22px',
          fontWeight: '400',
          color: '#ffffff',
          margin: '0 0 12px 0',
          lineHeight: '1.3',
          letterSpacing: '-0.3px',
        }}
      >
        {t('email.widget_error.headline', 'Widget Failure on')}{' '}
        <span style={{ color: '#c5ff4a' }}>{profileSlug}</span>
      </Heading>

      <Text
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#a1a1aa',
          margin: '0 0 24px 0',
        }}
      >
        {t(
          'email.widget_error.intro',
          'One of the widgets on your profile is failing to render. This alert was sent automatically as part of your Pro subscription.'
        )}
      </Text>

      <Section style={{ margin: '0 0 24px 0' }}>
        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            padding: '16px',
          }}
        >
          <Text
            style={{
              margin: '0 0 8px 0',
              fontWeight: '700',
              fontSize: '13px',
              color: '#ffffff',
            }}
          >
            {t('email.widget_error.widget_label', 'Widget:')}{' '}
            <CodeInline style={{ color: '#ef4444' }}>{widgetName}</CodeInline>
          </Text>
          <Text
            style={{
              margin: '0',
              fontSize: '12px',
              color: '#a1a1aa',
              lineHeight: '1.5',
            }}
          >
            {t('email.widget_error.message_label', 'Error:')} {errorMessage}
          </Text>
        </div>
      </Section>

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetUrl}>
          {t('email.widget_error.cta', 'View Error Details →')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />
    </EmailLayout>
  )
}

WidgetErrorAlertEmail.PreviewProps = {
  username: 'octocat',
  email: 'octocat@github.com',
  widgetName: 'GitHubContributionGraph',
  errorMessage: 'Timeout fetching from GitHub API',
  profileSlug: 'octocat/octocat',
} satisfies WidgetErrorAlertEmailPayload

export default WidgetErrorAlertEmail

import { Heading, Hr, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { SubscriptionCancelledEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { EmailLayout } from './components/EmailLayout'

export function SubscriptionCancelledEmail({
  username,
  email,
  feedbackUrl,
  locale = 'en',
}: SubscriptionCancelledEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const targetUrl = feedbackUrl || `${baseUrl}/pro/feedback`

  return (
    <EmailLayout
      previewText={t(
        'email.subscription_cancelled.preview',
        'Your GitAscii Pro subscription has been cancelled.'
      )}
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
            color: '#a1a1aa',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.subscription_cancelled.badge', '[ SUBSCRIPTION CANCELLED ]')}
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
        {t('email.subscription_cancelled.headline', 'Your Pro subscription has ended.')}
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
          'email.subscription_cancelled.intro',
          'Your GitAscii Pro subscription has been successfully cancelled. Your account has been moved to the free plan. You will no longer be charged.'
        )}
      </Text>

      <Text
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#a1a1aa',
          margin: '0 0 24px 0',
        }}
      >
        {t(
          'email.subscription_cancelled.feedback',
          "We'd love to know how we can improve. If you have a minute, please let us know why you left."
        )}
      </Text>

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetUrl} variant="secondary">
          {t('email.subscription_cancelled.cta', 'Leave Feedback')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />
    </EmailLayout>
  )
}

SubscriptionCancelledEmail.PreviewProps = {
  username: 'octocat',
  email: 'octocat@github.com',
} satisfies SubscriptionCancelledEmailPayload

export default SubscriptionCancelledEmail

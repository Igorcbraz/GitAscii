import { Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { PaymentFailedEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { EmailLayout } from './components/EmailLayout'

export function PaymentFailedEmail({
  username,
  email,
  billingUrl,
  amountDue,
  locale = 'en',
}: PaymentFailedEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const targetUrl = billingUrl || `${baseUrl}/pro/settings/billing`

  return (
    <EmailLayout
      previewText={t(
        'email.payment_failed.preview',
        'Action Required: Your GitAscii payment failed.'
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
            color: '#ef4444',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.payment_failed.badge', '[ ACTION REQUIRED ]')}
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
        {t('email.payment_failed.headline', 'Payment Failed for @{username}', { username })}
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
          'email.payment_failed.intro',
          'We were unable to process your latest subscription payment. To avoid interruption to your Pro features, please update your payment method.'
        )}
      </Text>

      {amountDue && (
        <Section style={{ margin: '0 0 24px 0' }}>
          <div
            style={{
              backgroundColor: '#18181c',
              border: '1px solid #27272a',
              borderRadius: '4px',
              padding: '16px',
            }}
          >
            <Text
              style={{
                margin: '0 0 4px 0',
                fontWeight: '700',
                fontSize: '13px',
                color: '#ffffff',
              }}
            >
              {t('email.payment_failed.amount_due', 'Amount Due:')}{' '}
              <span style={{ color: '#ef4444' }}>{amountDue}</span>
            </Text>
          </div>
        </Section>
      )}

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetUrl}>
          {t('email.payment_failed.cta', 'Update Payment Method →')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />
    </EmailLayout>
  )
}

PaymentFailedEmail.PreviewProps = {
  username: 'octocat',
  email: 'octocat@github.com',
  amountDue: '$9.00',
} satisfies PaymentFailedEmailPayload

export default PaymentFailedEmail

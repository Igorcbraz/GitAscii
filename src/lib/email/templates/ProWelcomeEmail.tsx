import { Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { ProWelcomeEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { RocketIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function ProWelcomeEmail({
  username,
  name,
  email,
  dashboardUrl,
  locale = 'en',
}: ProWelcomeEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const displayName = name || username
  const targetUrl = dashboardUrl || `${baseUrl}/pro`

  return (
    <EmailLayout
      previewText={t(
        'email.pro_welcome.preview',
        'Welcome to GitAscii Pro! Your account is upgraded.'
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
            color: '#c5ff4a',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.pro_welcome.badge', '[ UPGRADED TO PRO ]')}
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
        {t('email.pro_welcome.headline', 'Welcome to Pro,')}{' '}
        <span style={{ color: '#c5ff4a', fontStyle: 'italic' }}>@{username}</span>
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
          'email.pro_welcome.intro',
          'Thank you for upgrading! You now have access to advanced analytics, custom domains, error alerts, and up to 10 unique profiles.'
        )}
      </Text>

      <Section style={{ margin: '0 0 24px 0' }}>
        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '10px',
          }}
        >
          <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
            <tr>
              <td style={{ verticalAlign: 'top', width: '28px', paddingTop: '2px' }}>
                <RocketIcon color="#c5ff4a" />
              </td>
              <td style={{ paddingLeft: '10px' }}>
                <Text
                  style={{
                    margin: '0 0 4px 0',
                    fontWeight: '700',
                    fontSize: '13px',
                    color: '#ffffff',
                  }}
                >
                  {t('email.pro_welcome.dashboard_title', 'Go to your Pro Dashboard')}
                </Text>
                <Text
                  style={{
                    margin: '0',
                    fontSize: '12px',
                    color: '#a1a1aa',
                    lineHeight: '1.5',
                  }}
                >
                  {t(
                    'email.pro_welcome.dashboard_desc',
                    'Start tracking views, unique visitors, and setting up your custom profiles.'
                  )}
                </Text>
              </td>
            </tr>
          </table>
        </div>
      </Section>

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetUrl}>
          {t('email.pro_welcome.cta', 'Open Pro Dashboard →')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />
    </EmailLayout>
  )
}

ProWelcomeEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa',
  email: 'pro@github.com',
} satisfies ProWelcomeEmailPayload

export default ProWelcomeEmail

import { CodeInline, Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { DailyDigestEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { EmailLayout } from './components/EmailLayout'

export function DailyDigestEmail({
  username,
  email,
  totalViews,
  uniqueVisitors,
  topWidget,
  dashboardUrl,
  locale = 'en',
}: DailyDigestEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const targetUrl = dashboardUrl || `${baseUrl}/pro/analytics`

  return (
    <EmailLayout
      previewText={t('email.daily_digest.preview', 'You had {totalViews} views yesterday.', {
        totalViews: String(totalViews),
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
            color: '#c5ff4a',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.daily_digest.badge', '[ DAILY DIGEST ]')}
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
        {t('email.daily_digest.headline', 'Your Profile Performance')}
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
          'email.daily_digest.intro',
          'Here is a quick summary of how your GitAscii profile performed yesterday.'
        )}
      </Text>

      <Section style={{ margin: '0 0 24px 0' }}>
        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <div>
            <Text style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#a1a1aa' }}>
              {t('email.daily_digest.views', 'Total Views')}
            </Text>
            <Text style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
              {totalViews.toLocaleString()}
            </Text>
          </div>
          <div style={{ marginLeft: '16px' }}>
            <Text style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#a1a1aa' }}>
              {t('email.daily_digest.uniques', 'Unique Visitors')}
            </Text>
            <Text style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>
              {uniqueVisitors.toLocaleString()}
            </Text>
          </div>
        </div>

        {topWidget && (
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
              {t('email.daily_digest.top_widget_title', 'Top Widget:')}
            </Text>
            <Text
              style={{
                margin: '0',
                fontSize: '12px',
                color: '#a1a1aa',
                lineHeight: '1.5',
              }}
            >
              <CodeInline style={{ color: '#c5ff4a' }}>{topWidget}</CodeInline>
            </Text>
          </div>
        )}
      </Section>

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetUrl}>
          {t('email.daily_digest.cta', 'View Full Analytics →')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />
    </EmailLayout>
  )
}

DailyDigestEmail.PreviewProps = {
  username: 'octocat',
  email: 'octocat@github.com',
  totalViews: 1254,
  uniqueVisitors: 843,
  topWidget: 'GitHubContributionGraph',
} satisfies DailyDigestEmailPayload

export default DailyDigestEmail

import { Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { AppDisconnectedEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { AlertTriangleIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function AppDisconnectedEmail({
  username,
  name,
  email,
  installUrl,
  repoName,
  locale = 'en',
}: AppDisconnectedEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const displayName = name || username
  const targetInstallUrl = installUrl || `${baseUrl}/api/github/install-url`
  const targetRepo = repoName || `${username}/${username}`

  return (
    <EmailLayout
      previewText={t(
        'email.app_disconnected.preview',
        'GitAscii needs write permission to update your {targetRepo} repository',
        { targetRepo }
      )}
      email={email}
      username={username}
      locale={locale}
    >
      {/* Dialog-style Badge */}
      <div style={{ marginBottom: '12px' }}>
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '11px',
            fontWeight: '700',
            color: '#eab308',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.app_disconnected.badge', '[ GITHUB APP · PERMISSION REQUIRED ]')}
        </span>
      </div>

      {/* Editorial Headline */}
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
        {t('email.app_disconnected.headline', 'GitHub App permission')}{' '}
        <span style={{ color: '#eab308', fontStyle: 'italic' }}>
          {t('email.app_disconnected.needed_text', 'needed')}
        </span>
      </Heading>

      <Text
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#a1a1aa',
          margin: '0 0 20px 0',
        }}
      >
        {t(
          'email.app_disconnected.intro',
          'Hi {displayName}, GitAscii requires write access to your repository to commit your README updates.',
          { displayName }
        )}
      </Text>

      {/* Target Repo & Status Card */}
      <div
        style={{
          backgroundColor: '#18181c',
          border: '1px solid #27272a',
          borderRadius: '4px',
          padding: '14px 16px',
          marginBottom: '20px',
        }}
      >
        <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td style={{ verticalAlign: 'top', width: '36px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  lineHeight: '26px',
                }}
              >
                <AlertTriangleIcon size={14} color="#eab308" />
              </div>
            </td>
            <td>
              <div
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '2px',
                }}
              >
                {targetRepo}
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                {t(
                  'email.app_disconnected.status_text',
                  'GitHub App write access disconnected or pending authorization'
                )}
              </div>
            </td>
          </tr>
        </table>
      </div>

      {/* Info Card */}
      <Section
        style={{
          backgroundColor: '#141418',
          border: '1px solid #27272a',
          borderRadius: '4px',
          padding: '16px',
          margin: '0 0 24px 0',
        }}
      >
        <div
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '11px',
            color: '#c5ff4a',
            marginBottom: '8px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          {t('email.app_disconnected.resolution_title', '// RESOLUTION STEPS:')}
        </div>

        <Text
          style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}
        >
          {t(
            'email.app_disconnected.step1',
            '1. The GitAscii App installation may have been revoked or adjusted in GitHub settings.'
          )}
        </Text>
        <Text
          style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}
        >
          {t('email.app_disconnected.step2_prefix', '2. Ensure the repository')}{' '}
          <strong style={{ color: '#ffffff' }}>{targetRepo}</strong>{' '}
          {t('email.app_disconnected.step2_suffix', 'is included under authorized repositories.')}
        </Text>
        <Text style={{ margin: '0', fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}>
          {t(
            'email.app_disconnected.step3',
            '3. 1-click README sync will automatically resume once reauthorized.'
          )}
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', margin: '28px 0 20px 0' }}>
        <EmailButton href={targetInstallUrl}>
          {t('email.app_disconnected.cta', 'Reconnect on GitHub')}
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: '#27272a', margin: '20px 0' }} />

      <Text
        style={{
          fontSize: '12px',
          color: '#71717a',
          lineHeight: '1.5',
          margin: '0',
        }}
      >
        {t(
          'email.app_disconnected.disclaimer',
          'This is an account security and integration status notification.'
        )}
      </Text>
    </EmailLayout>
  )
}

AppDisconnectedEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa',
  email: 'octocat@github.com',
  installUrl: 'https://github.com/apps/gitascii/installations/new',
  repoName: 'octocat/octocat',
} satisfies AppDisconnectedEmailPayload

export default AppDisconnectedEmail

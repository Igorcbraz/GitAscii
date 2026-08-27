import { CodeInline, Heading, Hr, Link, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { WelcomeEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { CompassIcon, LayersIcon, RocketIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function WelcomeEmail({
  username,
  name,
  email,
  editorUrl,
  locale = 'en',
}: WelcomeEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const displayName = name || username
  const targetEditorUrl = editorUrl || `${baseUrl}/${encodeURIComponent(username)}`

  return (
    <EmailLayout
      previewText={t(
        'email.welcome.preview',
        'Welcome to GitAscii, {displayName}! Start building your dynamic README.',
        { displayName }
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
          {t('email.welcome.badge', '[ ONBOARDING · GETTING STARTED ]')}
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
        {t('email.welcome.headline', 'Welcome to GitAscii,')}{' '}
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
          'email.welcome.intro',
          'Hi {displayName}, your visual studio for high-craft GitHub profile READMEs is ready. Compose dynamic SVGs, ASCII art widgets, and live developer stats that render at the edge.',
          { displayName }
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
                  {t('email.welcome.feature1_title', 'Visual Canvas & Drag-and-Drop Editor')}
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
                    'email.welcome.feature1_desc',
                    'Craft multi-layered SVGs with real-time preview, alignment guides, and responsive layout scaling.'
                  )}
                </Text>
              </td>
            </tr>
          </table>
        </div>

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
                <LayersIcon color="#c5ff4a" />
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
                  {t('email.welcome.feature2_title', '40+ Modular Widget Templates')}
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
                    'email.welcome.feature2_desc',
                    'GitHub stats, streak counters, music visualizers, terminal banners, ASCII typography, and surveillance monitors.'
                  )}
                </Text>
              </td>
            </tr>
          </table>
        </div>

        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '16px',
          }}
        >
          <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
            <tr>
              <td style={{ verticalAlign: 'top', width: '28px', paddingTop: '2px' }}>
                <CompassIcon color="#c5ff4a" />
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
                  {t('email.welcome.feature3_title', '1-Click GitHub Export')}
                </Text>
                <Text
                  style={{
                    margin: '0',
                    fontSize: '12px',
                    color: '#a1a1aa',
                    lineHeight: '1.5',
                  }}
                >
                  {t('email.welcome.feature3_desc', 'Export directly to your special')}{' '}
                  <CodeInline style={{ color: '#c5ff4a' }}>
                    {username}/{username}
                  </CodeInline>{' '}
                  {t(
                    'email.welcome.feature3_desc_end',
                    'repository via our official GitHub App integration.'
                  )}
                </Text>
              </td>
            </tr>
          </table>
        </div>
      </Section>

      <div style={{ textAlign: 'center', margin: '32px 0 28px 0' }}>
        <EmailButton href={targetEditorUrl}>
          {t('email.welcome.cta', 'Open Visual Studio →')}
        </EmailButton>
      </div>

      <Hr style={{ borderColor: '#27272a', margin: '24px 0' }} />

      <div
        style={{
          borderLeft: '2px solid #c5ff4a',
          paddingLeft: '12px',
          margin: '0 0 8px 0',
        }}
      >
        <Text
          style={{
            fontSize: '12px',
            color: '#a1a1aa',
            margin: '0',
            lineHeight: '1.5',
          }}
        >
          <strong style={{ color: '#ffffff' }}>{t('email.welcome.tip_title', 'Pro-tip:')}</strong>{' '}
          {t(
            'email.welcome.tip_desc',
            'You can load community-crafted templates directly from the'
          )}{' '}
          <Link
            href={`${baseUrl}/explore`}
            style={{ color: '#c5ff4a', textDecoration: 'underline' }}
          >
            {t('email.welcome.tip_link', 'Community Showcase')}
          </Link>{' '}
          {t('email.welcome.tip_desc_end', 'to get inspired with bespoke layouts in seconds.')}
        </Text>
      </div>
    </EmailLayout>
  )
}

WelcomeEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa Octocat',
  email: 'octocat@github.com',
  editorUrl: 'https://gitascii.com/octocat',
} satisfies WelcomeEmailPayload

export default WelcomeEmail

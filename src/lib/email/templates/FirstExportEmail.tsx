import { CodeInline, Heading, Hr, Link, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { FirstExportEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { CheckIcon, GithubIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function FirstExportEmail({
  username,
  name: _name,
  email,
  profileSlug = 'default',
  widgetCount,
  previewUrl,
  githubProfileUrl,
  editorUrl,
  locale = 'en',
}: FirstExportEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const targetGithubUrl = githubProfileUrl || `https://github.com/${encodeURIComponent(username)}`
  const targetEditorUrl = editorUrl || `${baseUrl}/${encodeURIComponent(username)}`
  const targetPreviewUrl =
    previewUrl ||
    (profileSlug === 'default'
      ? `${baseUrl}/api/${encodeURIComponent(username)}`
      : `${baseUrl}/api/${encodeURIComponent(username)}/${encodeURIComponent(profileSlug)}`)

  return (
    <EmailLayout
      previewText={t(
        'email.first_export.preview',
        'Your GitAscii README is live on GitHub, @{username}!',
        { username }
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
          {t('email.first_export.badge', '[ GITHUB EXPORT · LIVE PROFILE ]')}
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
        {t('email.first_export.headline', 'Your GitAscii README is')}{' '}
        <span style={{ color: '#c5ff4a', fontStyle: 'italic' }}>
          {t('email.first_export.live_text', 'Live')}
        </span>
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
          'email.first_export.intro',
          'Your profile repository on GitHub has been updated with your new visual layout and dynamic SVG embed.'
        )}
      </Text>

      <div
        style={{
          backgroundColor: '#18181c',
          border: '1px solid #27272a',
          borderRadius: '4px',
          padding: '14px 16px',
          marginBottom: '16px',
        }}
      >
        <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td style={{ verticalAlign: 'top', width: '36px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#27272a',
                  borderRadius: '4px',
                  textAlign: 'center',
                  lineHeight: '26px',
                }}
              >
                <GithubIcon size={14} color="#f4f4f5" />
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
                {username}/{username}
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                {t(
                  'email.first_export.card_subtitle',
                  'Profile README · Updated via GitAscii Studio'
                )}
              </div>
            </td>
            <td align="right" style={{ verticalAlign: 'middle' }}>
              <span
                style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#c5ff4a',
                  backgroundColor: 'rgba(197, 255, 74, 0.1)',
                  border: '1px solid rgba(197, 255, 74, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckIcon size={10} color="#c5ff4a" />{' '}
                {t('email.first_export.synced_badge', 'SYNCED')}
              </span>
            </td>
          </tr>
        </table>
      </div>

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
            marginBottom: '10px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          {t('email.first_export.asset_config_title', '// LIVE ASSET CONFIGURATION:')}
        </div>

        <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
          <tr>
            <td style={{ padding: '3px 0', fontSize: '13px', color: '#71717a', width: '110px' }}>
              {t('email.first_export.slug_label', 'Profile Slug:')}
            </td>
            <td style={{ padding: '3px 0', fontSize: '13px', color: '#ffffff' }}>
              <CodeInline
                style={{ color: '#c5ff4a', backgroundColor: '#1f241a', fontSize: '11px' }}
              >
                {profileSlug}
              </CodeInline>
            </td>
          </tr>
          {typeof widgetCount === 'number' && widgetCount > 0 && (
            <tr>
              <td style={{ padding: '3px 0', fontSize: '13px', color: '#71717a' }}>
                {t('email.first_export.widgets_label', 'Active Widgets:')}
              </td>
              <td
                style={{ padding: '3px 0', fontSize: '13px', color: '#ffffff', fontWeight: '600' }}
              >
                {widgetCount}
              </td>
            </tr>
          )}
        </table>

        <div style={{ marginTop: '12px' }}>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: '#71717a',
              marginBottom: '4px',
            }}
          >
            {t('email.first_export.endpoint_label', 'EDGE SVG ENDPOINT:')}
          </div>
          <div
            style={{
              backgroundColor: '#0c0c0e',
              border: '1px solid #222226',
              borderRadius: '3px',
              padding: '8px 10px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '11px',
              color: '#c5ff4a',
              wordBreak: 'break-all',
            }}
          >
            {targetPreviewUrl}
          </div>
        </div>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0 16px 0' }}>
        <EmailButton href={targetGithubUrl}>
          {t('email.first_export.cta', 'View Profile on GitHub')}
        </EmailButton>
      </Section>

      <Section style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        <Link
          href={targetEditorUrl}
          style={{
            fontSize: '12px',
            color: '#a1a1aa',
            textDecoration: 'underline',
          }}
        >
          {t('email.first_export.customize_link', 'Open GitAscii studio to customize more widgets')}
        </Link>
      </Section>

      <Hr style={{ borderColor: '#27272a', margin: '20px 0' }} />

      <div style={{ fontSize: '12px', color: '#71717a', lineHeight: '1.5' }}>
        <div style={{ fontWeight: '600', color: '#a1a1aa', marginBottom: '4px' }}>
          {t('email.first_export.notes_title', 'Dynamic Edge Architecture')}
        </div>
        {t(
          'email.first_export.notes_desc',
          'GitHub caches profile images through their Camo proxy. Your GitAscii dynamic SVG automatically updates when visitors load your profile, keeping commit stats and widget data current.'
        )}
      </div>
    </EmailLayout>
  )
}

FirstExportEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa Octocat',
  email: 'octocat@github.com',
  profileSlug: 'default',
  widgetCount: 4,
  previewUrl: 'https://gitascii.com/api/octocat',
  githubProfileUrl: 'https://github.com/octocat',
  editorUrl: 'https://gitascii.com/octocat',
} satisfies FirstExportEmailPayload

export default FirstExportEmail

import { Heading, Hr, Link, Section, Text } from '@react-email/components'
import React from 'react'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { ReengagementEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { LayersIcon, SparklesIcon, TerminalIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function ReengagementEmail({
  username,
  name,
  email,
  inactiveDays = 15,
  editorUrl,
  exploreUrl,
  locale = 'en',
}: ReengagementEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const displayName = name || username
  const targetEditorUrl = editorUrl || `${baseUrl}/${encodeURIComponent(username)}`
  const targetExploreUrl = exploreUrl || `${baseUrl}/explore`

  return (
    <EmailLayout
      previewText={t(
        'email.reengagement.preview',
        'New widgets and layouts are waiting for your GitHub README, @{username}.',
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
          {t('email.reengagement.badge', '[ PRODUCT UPDATE · STUDIO DISCOVERY ]')}
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
        {t('email.reengagement.headline', 'Level up your GitHub README,')}{' '}
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
          'email.reengagement.intro',
          "Hi {displayName}, it's been {inactiveDays} days since you last updated your profile. We've added new community widgets and theme customization options to the studio.",
          { displayName, inactiveDays }
        )}
      </Text>

      <Section style={{ margin: '0 0 24px 0' }}>
        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '14px 16px',
            marginBottom: '10px',
          }}
        >
          <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
            <tr>
              <td style={{ verticalAlign: 'top', width: '36px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'rgba(197, 255, 74, 0.1)',
                    border: '1px solid rgba(197, 255, 74, 0.3)',
                    borderRadius: '4px',
                    textAlign: 'center',
                    lineHeight: '26px',
                  }}
                >
                  <TerminalIcon size={14} color="#c5ff4a" />
                </div>
              </td>
              <td>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '2px',
                  }}
                >
                  {t('email.reengagement.feature1_title', 'Contribution Snake Workflow')}
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}>
                  {t(
                    'email.reengagement.feature1_desc',
                    'Configure an automated GitHub Action that generates a live snake animation on your contribution grid.'
                  )}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '14px 16px',
            marginBottom: '10px',
          }}
        >
          <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
            <tr>
              <td style={{ verticalAlign: 'top', width: '36px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'rgba(197, 255, 74, 0.1)',
                    border: '1px solid rgba(197, 255, 74, 0.3)',
                    borderRadius: '4px',
                    textAlign: 'center',
                    lineHeight: '26px',
                  }}
                >
                  <LayersIcon size={14} color="#c5ff4a" />
                </div>
              </td>
              <td>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '2px',
                  }}
                >
                  {t('email.reengagement.feature2_title', 'Interactive Cards & Widgets')}
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}>
                  {t(
                    'email.reengagement.feature2_desc',
                    'Add Pokemon TCG holographic cards, scouting profiles, streak badges, and tech stack grids.'
                  )}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <div
          style={{
            backgroundColor: '#18181c',
            border: '1px solid #27272a',
            borderRadius: '4px',
            padding: '14px 16px',
          }}
        >
          <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
            <tr>
              <td style={{ verticalAlign: 'top', width: '36px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'rgba(197, 255, 74, 0.1)',
                    border: '1px solid rgba(197, 255, 74, 0.3)',
                    borderRadius: '4px',
                    textAlign: 'center',
                    lineHeight: '26px',
                  }}
                >
                  <SparklesIcon size={14} color="#c5ff4a" />
                </div>
              </td>
              <td>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '2px',
                  }}
                >
                  {t('email.reengagement.feature3_title', 'Adaptive Theme Engine')}
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa', lineHeight: '1.5' }}>
                  {t(
                    'email.reengagement.feature3_desc',
                    "Edge SVGs automatically match visitors' GitHub dark/light mode settings seamlessly."
                  )}
                </div>
              </td>
            </tr>
          </table>
        </div>
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0 16px 0' }}>
        <EmailButton href={targetEditorUrl}>
          {t('email.reengagement.cta', 'Open Studio & Update Profile')}
        </EmailButton>
      </Section>

      <Section style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
        <Link
          href={targetExploreUrl}
          style={{
            fontSize: '12px',
            color: '#a1a1aa',
            textDecoration: 'underline',
          }}
        >
          {t('email.reengagement.explore_link', 'Browse community README gallery')}
        </Link>
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
          'email.reengagement.disclaimer',
          'You are receiving this update because you are registered on GitAscii. We limit re-engagement notifications to at most once per month.'
        )}
      </Text>
    </EmailLayout>
  )
}

ReengagementEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa Octocat',
  email: 'octocat@github.com',
  inactiveDays: 18,
  editorUrl: 'https://gitascii.com/octocat',
  exploreUrl: 'https://gitascii.com/explore',
} satisfies ReengagementEmailPayload

export default ReengagementEmail

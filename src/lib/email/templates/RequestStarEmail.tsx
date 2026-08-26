import { Heading, Hr, Link, Section, Text } from '@react-email/components'
import React from 'react'

import { EXTERNAL_LINKS } from '@/constants/links'

import { getAppBaseUrl } from '../client'
import { getEmailTranslator } from '../i18n'
import type { RequestStarEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { GithubIcon, StarIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function RequestStarEmail({
  username,
  name,
  email,
  repoUrl,
  editorUrl,
  locale = 'en',
}: RequestStarEmailPayload) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const displayName = name || username
  const targetRepoUrl = repoUrl || EXTERNAL_LINKS.GITHUB_REPO
  const targetEditorUrl = editorUrl || `${baseUrl}/${encodeURIComponent(username)}`

  return (
    <EmailLayout
      previewText={t(
        'email.request_star.preview',
        'Enjoying your dynamic README on GitHub, @{username}? Star GitAscii!',
        { username }
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
            color: '#c5ff4a',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          {t('email.request_star.badge', '[ COMMUNITY SUPPORT · OPEN SOURCE ]')}
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
        {t('email.request_star.headline', 'Leave your')}{' '}
        <span style={{ color: '#c5ff4a', fontStyle: 'italic' }}>
          {t('email.request_star.star_text', 'star')}
        </span>{' '}
        {t('email.request_star.headline_suffix', 'on GitAscii')}
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
          'email.request_star.intro',
          'Hi {displayName}, we hope your profile README is standing out on GitHub! If GitAscii helped you craft a high-impact profile, consider supporting the project with a star.',
          { displayName }
        )}
      </Text>

      {/* GitHub Repo Card - Matches StarPromptModal styling */}
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
                Igorcbraz/GitAscii
              </div>
              <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                {t('email.request_star.repo_tagline', 'GitHub Profile README Generator')}
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
                <StarIcon size={11} color="#c5ff4a" />{' '}
                {t('email.request_star.open_source_badge', 'OPEN SOURCE')}
              </span>
            </td>
          </tr>
        </table>
      </div>

      {/* CTA Button */}
      <Section style={{ textAlign: 'center', margin: '24px 0 16px 0' }}>
        <EmailButton href={targetRepoUrl}>
          {t('email.request_star.cta', 'Star on GitHub')}
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
          {t(
            'email.request_star.continue_link',
            'Or continue customizing more widgets in the studio'
          )}
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
          'email.request_star.disclaimer',
          'This is a one-time request sent to active GitAscii creators. You will not receive this message again.'
        )}
      </Text>
    </EmailLayout>
  )
}

RequestStarEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa',
  email: 'octocat@github.com',
  repoUrl: 'https://github.com/Igorcbraz/GitAscii',
  editorUrl: 'https://gitascii.com/octocat',
} satisfies RequestStarEmailPayload

export default RequestStarEmail

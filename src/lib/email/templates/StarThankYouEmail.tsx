import { CodeBlock, dracula, Heading, Hr, Section, Text } from '@react-email/components'
import React from 'react'

import { EXTERNAL_LINKS } from '@/constants/links'

import { getEmailTranslator } from '../i18n'
import type { StarThankYouEmailPayload } from '../types'
import { EmailButton } from './components/EmailButton'
import { GithubIcon, StarIcon } from './components/EmailIcons'
import { EmailLayout } from './components/EmailLayout'

export function StarThankYouEmail({
  username,
  name,
  email,
  repoUrl,
  badgeSnippet,
  locale = 'en',
}: StarThankYouEmailPayload) {
  const t = getEmailTranslator(locale)
  const displayName = name || username
  const targetRepoUrl = repoUrl || EXTERNAL_LINKS.GITHUB_REPO
  const targetBadge =
    badgeSnippet ||
    `[![GitAscii Backer](https://img.shields.io/badge/GitAscii-Backer-%23c5ff4a?style=for-the-badge&logo=github&logoColor=black)](${targetRepoUrl})`

  return (
    <EmailLayout
      previewText={t(
        'email.star_thank_you.preview',
        'Thank you for starring GitAscii on GitHub, @{username}!',
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
          {t('email.star_thank_you.badge', '[ GITHUB · SUPPORTER ACKNOWLEDGEMENT ]')}
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
        {t('email.star_thank_you.headline', 'Thank you for your support,')}{' '}
        <span style={{ color: '#c5ff4a', fontStyle: 'italic' }}>@{username}</span>
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
          'email.star_thank_you.intro',
          'Hi {displayName}, your star was received on the GitAscii GitHub repository. Independent open-source projects rely on community feedback and visibility to keep thriving.',
          { displayName }
        )}
      </Text>

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
                {t('email.star_thank_you.repo_tagline', 'GitHub Profile README Generator')}
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
                {t('email.star_thank_you.starred_badge', 'STARRED')}
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
            marginBottom: '8px',
            fontWeight: '600',
            letterSpacing: '0.5px',
          }}
        >
          {t('email.star_thank_you.badge_section_title', '// BACKER BADGE SNIPPET:')}
        </div>

        <Text style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#a1a1aa' }}>
          {t(
            'email.star_thank_you.badge_instruction',
            'Copy this snippet if you want to feature a backer badge in your GitHub repository:'
          )}
        </Text>

        <CodeBlock
          code={targetBadge}
          language="markdown"
          theme={dracula}
          style={{
            fontSize: '11px',
            borderRadius: '4px',
            padding: '10px 12px',
            border: '1px solid #27272a',
            margin: '0',
          }}
        />
      </Section>

      <Section style={{ textAlign: 'center', margin: '28px 0 20px 0' }}>
        <EmailButton href={targetRepoUrl}>
          {t('email.star_thank_you.cta', 'Open GitHub Repository')}
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
          'email.star_thank_you.disclaimer',
          'This is a one-time acknowledgement message sent to developers who star GitAscii on GitHub.'
        )}
      </Text>
    </EmailLayout>
  )
}

StarThankYouEmail.PreviewProps = {
  username: 'octocat',
  name: 'Mona Lisa',
  email: 'octocat@github.com',
  repoUrl: 'https://github.com/Igorcbraz/GitAscii',
  badgeSnippet:
    '[![GitAscii Backer](https://img.shields.io/badge/GitAscii-Backer-%23c5ff4a?style=for-the-badge&logo=github&logoColor=black)](https://github.com/Igorcbraz/GitAscii)',
} satisfies StarThankYouEmailPayload

export default StarThankYouEmail

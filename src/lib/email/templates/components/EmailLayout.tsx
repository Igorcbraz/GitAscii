import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import React from 'react'

import type { AppLocale } from '@/i18n/locales'

import { getAppBaseUrl } from '../../client'
import { getEmailTranslator } from '../../i18n'
import { getPreferencesUrl, getUnsubscribeUrl } from '../../tokens'

interface EmailLayoutProps {
  previewText: string
  children?: React.ReactNode
  email?: string
  username?: string
  locale?: AppLocale
  showUnsubscribe?: boolean
}

export function EmailLayout({
  previewText,
  children,
  email,
  username,
  locale = 'en',
  showUnsubscribe = true,
}: EmailLayoutProps) {
  const t = getEmailTranslator(locale)
  const baseUrl = getAppBaseUrl()
  const currentYear = new Date().getFullYear()

  const unsubscribeUrl =
    email && username ? getUnsubscribeUrl(email, username) : `${baseUrl}/unsubscribe`
  const preferencesUrl =
    email && username ? getPreferencesUrl(email, username) : `${baseUrl}/unsubscribe`

  return (
    <Html lang={locale} dir="ltr">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: '#09090b',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          margin: '0 auto',
          padding: '32px 16px',
          color: '#f4f4f5',
        }}
      >
        <Container
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            backgroundColor: '#121215',
            borderRadius: '4px',
            border: '1px solid #27272a',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          }}
        >
          <Section
            style={{
              backgroundColor: '#18181c',
              padding: '16px 24px',
              borderBottom: '1px solid #27272a',
            }}
          >
            <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
              <tr>
                <td>
                  <Link
                    href={baseUrl}
                    style={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                        fontSize: '15px',
                        fontWeight: '800',
                        color: '#f4f4f5',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      GIT<span style={{ color: '#c5ff4a' }}>ASCII</span>
                    </span>
                  </Link>
                </td>
                <td align="right">
                  <span
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#c5ff4a',
                      backgroundColor: 'rgba(197, 255, 74, 0.08)',
                      border: '1px solid rgba(197, 255, 74, 0.25)',
                      padding: '4px 8px',
                      borderRadius: '2px',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t('email.badge_notification', '[ STUDIO NOTIFICATION ]')}
                  </span>
                </td>
              </tr>
            </table>
          </Section>

          <Section style={{ padding: '28px 24px' }}>{children}</Section>

          <Section
            style={{
              backgroundColor: '#0e0e11',
              padding: '24px 32px',
              borderTop: '1px solid #222226',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                fontSize: '13px',
                color: '#a1a1aa',
                margin: '0 0 12px 0',
                lineHeight: '1.6',
              }}
            >
              {t(
                'email.footer_tagline',
                'GitAscii — Where cryptic terminals meet editorial newspaper design.'
              )}
            </Text>

            <table
              width="100%"
              border={0}
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{ margin: '8px 0 16px 0' }}
            >
              <tr>
                <td align="center">
                  <Link
                    href={`${baseUrl}/templates`}
                    style={{
                      color: '#d4d4d8',
                      fontSize: '12px',
                      textDecoration: 'none',
                      margin: '0 8px',
                    }}
                  >
                    {t('email.nav_templates', 'Templates')}
                  </Link>
                  <span style={{ color: '#52525b' }}>•</span>
                  <Link
                    href={`${baseUrl}/explore`}
                    style={{
                      color: '#d4d4d8',
                      fontSize: '12px',
                      textDecoration: 'none',
                      margin: '0 8px',
                    }}
                  >
                    {t('email.nav_community', 'Community')}
                  </Link>
                  <span style={{ color: '#52525b' }}>•</span>
                  <Link
                    href="https://github.com/Igorcbraz/GitAscii"
                    style={{
                      color: '#d4d4d8',
                      fontSize: '12px',
                      textDecoration: 'none',
                      margin: '0 8px',
                    }}
                  >
                    GitHub
                  </Link>
                </td>
              </tr>
            </table>

            {showUnsubscribe && (
              <Text
                style={{
                  fontSize: '11px',
                  color: '#71717a',
                  margin: '12px 0 0 0',
                  lineHeight: '1.5',
                }}
              >
                {t(
                  'email.footer_reason',
                  'You received this email because you signed up on GitAscii.'
                )}
                <br />
                <Link
                  href={preferencesUrl}
                  style={{ color: '#a1a1aa', textDecoration: 'underline', margin: '0 4px' }}
                >
                  {t('email.manage_preferences', 'Manage Preferences')}
                </Link>
                {' · '}
                <Link
                  href={unsubscribeUrl}
                  style={{ color: '#a1a1aa', textDecoration: 'underline', margin: '0 4px' }}
                >
                  {t('email.unsubscribe', 'Unsubscribe')}
                </Link>
              </Text>
            )}

            <Hr style={{ borderColor: '#222226', margin: '16px 0 12px 0' }} />

            <Text
              style={{
                fontSize: '11px',
                color: '#52525b',
                margin: '0',
              }}
            >
              © {currentYear} GitAscii.{' '}
              {t('email.footer_built_for', 'Built for developers worldwide.')}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

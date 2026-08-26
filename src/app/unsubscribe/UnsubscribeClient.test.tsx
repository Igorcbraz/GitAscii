import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { I18nProvider } from '@/i18n'

import { UnsubscribeClient } from './UnsubscribeClient'

describe('UnsubscribeClient Component Suite', () => {
  it('renders success state when status is success', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(UnsubscribeClient, {
          status: 'success',
          email: 'developer@example.com',
          username: 'octocat',
        })
      )
    )

    expect(html).toContain('GIT')
    expect(html).toContain('ASCII')
    expect(html).toContain('developer@example.com')
    expect(html).toContain('✓')
    expect(html).toContain('href="/"')
  })

  it('renders generic success state when email is not provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(UnsubscribeClient, {
          status: 'success',
        })
      )
    )

    expect(html).toContain('✓')
    expect(html).toContain('href="/"')
  })

  it('renders invalid token state when status is invalid', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(UnsubscribeClient, {
          status: 'invalid',
        })
      )
    )

    expect(html).toContain('!')
    expect(html).toContain('href="/"')
  })

  it('renders default manage preferences state when status is omitted', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(UnsubscribeClient, {
          username: 'octocat',
        })
      )
    )

    expect(html).toContain('octocat')
    expect(html).toContain('href="/"')
  })
})

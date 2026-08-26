import { render } from '@react-email/components'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { AppDisconnectedEmail } from './templates/AppDisconnectedEmail'
import { EmailButton } from './templates/components/EmailButton'
import { EmailLayout } from './templates/components/EmailLayout'
import { FirstExportEmail } from './templates/FirstExportEmail'
import { ReengagementEmail } from './templates/ReengagementEmail'
import { RequestStarEmail } from './templates/RequestStarEmail'
import { StarThankYouEmail } from './templates/StarThankYouEmail'
import { WelcomeEmail } from './templates/WelcomeEmail'

describe('React Email Components & Templates Rendering Suite', () => {
  describe('EmailButton', () => {
    it('renders button with correct href and children', async () => {
      const html = await render(
        React.createElement(
          EmailButton,
          { href: 'https://gitascii.com/octocat' },
          'Open Your Editor'
        )
      )

      expect(html).toContain('href="https://gitascii.com/octocat"')
      expect(html).toContain('Open Your Editor')
    })
  })

  describe('EmailLayout', () => {
    it('renders layout header banner, children, and unsubscribe footer by default', async () => {
      const html = await render(
        React.createElement(
          EmailLayout,
          {
            previewText: 'Hello World Preview',
            email: 'dev@example.com',
            username: 'devuser',
            showUnsubscribe: true,
          },
          React.createElement('div', null, 'Main Email Body Content')
        )
      )

      expect(html).toContain('Hello World Preview')
      expect(html).toContain('GIT')
      expect(html).toContain('ASCII')
      expect(html).toContain('STUDIO NOTIFICATION')
      expect(html).toContain('Main Email Body Content')
      expect(html).toContain('Manage Preferences')
      expect(html).toContain('Unsubscribe')
      expect(html).toContain('/api/email/unsubscribe?token=')
    })

    it('hides unsubscribe links when showUnsubscribe is false', async () => {
      const html = await render(
        React.createElement(
          EmailLayout,
          {
            previewText: 'Transactional alert',
            email: 'dev@example.com',
            username: 'devuser',
            showUnsubscribe: false,
          },
          React.createElement('div', null, 'Security Alert')
        )
      )

      expect(html).toContain('Security Alert')
      expect(html).not.toContain('Manage Preferences')
      expect(html).not.toContain('You received this email because you signed up on GitAscii')
    })

    it('handles layout when email/username are omitted', async () => {
      const html = await render(
        React.createElement(
          EmailLayout,
          { previewText: 'Generic preview' },
          React.createElement('span', null, 'Generic content')
        )
      )

      expect(html).toContain('Generic content')
      expect(html).toContain('/unsubscribe')
    })
  })

  describe('WelcomeEmail', () => {
    it('renders full welcome email with steps, default displayName, and editor link in default en locale', async () => {
      const html = await render(
        React.createElement(WelcomeEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          editorUrl: 'https://gitascii.com/octocat',
        })
      )

      expect(html).toContain('Welcome to GitAscii')
      expect(html).toContain('octocat')
      expect(html).toContain('Visual Canvas &amp; Drag-and-Drop Editor')
      expect(html).toContain('1-Click GitHub Export')
      expect(html).toContain('Open Visual Studio')
      expect(html).toContain('Community Showcase')
    })

    it('renders welcome email translated in pt locale', async () => {
      const html = await render(
        React.createElement(WelcomeEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          editorUrl: 'https://gitascii.com/octocat',
          locale: 'pt',
        })
      )

      expect(html).toContain('Bem-vindo ao GitAscii')
      expect(html).toContain('Canvas Visual e Editor Drag-and-Drop')
      expect(html).toContain('Abrir Studio Visual')
    })

    it('falls back to username when name is omitted', async () => {
      const html = await render(
        React.createElement(WelcomeEmail, {
          username: 'solo_hacker',
          email: 'hacker@example.com',
        })
      )

      expect(html).toContain('solo_hacker')
    })
  })

  describe('FirstExportEmail', () => {
    it('renders celebration details with custom slug, widget count, and endpoints', async () => {
      const html = await render(
        React.createElement(FirstExportEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          profileSlug: 'terminal',
          widgetCount: 8,
          previewUrl: 'https://gitascii.com/api/octocat/terminal',
          githubProfileUrl: 'https://github.com/octocat',
          editorUrl: 'https://gitascii.com/octocat',
        })
      )

      expect(html).toContain('Your GitAscii README is')
      expect(html).toContain('Live')
      expect(html).toContain('terminal')
      expect(html).toContain('8')
      expect(html).toContain('https://gitascii.com/api/octocat/terminal')
      expect(html).toContain('View Profile on GitHub')
      expect(html).toContain('Dynamic Edge Architecture')
    })

    it('renders with default profileSlug and falls back on URLs gracefully', async () => {
      const html = await render(
        React.createElement(FirstExportEmail, {
          username: 'torvalds',
          email: 'linus@kernel.org',
        })
      )

      expect(html).toContain('default')
      expect(html).toContain('https://github.com/torvalds')
      expect(html).toContain('/api/torvalds')
    })
  })

  describe('ReengagementEmail', () => {
    it('renders inactive duration, new features, and reactivation CTA', async () => {
      const html = await render(
        React.createElement(ReengagementEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          inactiveDays: 25,
          editorUrl: 'https://gitascii.com/octocat',
          exploreUrl: 'https://gitascii.com/explore',
        })
      )

      expect(html).toContain('Level up your GitHub README')
      expect(html).toContain('25')
      expect(html).toContain('Contribution Snake Workflow')
      expect(html).toContain('Interactive Cards')
      expect(html).toContain('Adaptive Theme Engine')
      expect(html).toContain('Open Studio')
      expect(html).toContain('Browse community README gallery')
    })
  })

  describe('AppDisconnectedEmail', () => {
    it('renders alert warning, repo target, and reconnect CTA', async () => {
      const html = await render(
        React.createElement(AppDisconnectedEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          installUrl: 'https://github.com/apps/gitascii/installations/new',
          repoName: 'octocat/custom-repo',
        })
      )

      expect(html).toContain('GitHub App permission')
      expect(html).toContain('needed')
      expect(html).toContain('octocat/custom-repo')
      expect(html).toContain('Reconnect on GitHub')
      expect(html).toContain('RESOLUTION STEPS')
    })
  })

  describe('StarThankYouEmail', () => {
    it('renders thank you message and backer badge code snippet', async () => {
      const html = await render(
        React.createElement(StarThankYouEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          repoUrl: 'https://github.com/Igorcbraz/GitAscii',
        })
      )

      expect(html).toContain('Thank you for your support')
      expect(html).toContain('BACKER BADGE SNIPPET')
      expect(html).toContain('GitAscii-Backer')
      expect(html).toContain('Open GitHub Repository')
    })
  })

  describe('RequestStarEmail', () => {
    it('renders polite community star appeal and repository CTA', async () => {
      const html = await render(
        React.createElement(RequestStarEmail, {
          username: 'octocat',
          name: 'Mona Lisa',
          email: 'octocat@github.com',
          repoUrl: 'https://github.com/Igorcbraz/GitAscii',
          editorUrl: 'https://gitascii.com/octocat',
        })
      )

      expect(html).toContain('Leave your')
      expect(html).toContain('star')
      expect(html).toContain('Star on GitHub')
      expect(html).toContain('one-time request')
    })
  })
})

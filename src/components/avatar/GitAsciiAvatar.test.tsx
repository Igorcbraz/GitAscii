import { validateAvatarDefinition } from '@bible-strong/avatar-core'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  getGitAsciiAvatarDefinition,
  GitAsciiAvatar,
  GitAsciiLogo,
  resolveGitAsciiExpression,
} from './index'

describe('GitAsciiAvatar (Bible Strong Avatar Lab Integration)', () => {
  it('has a strictly valid AvatarDefinition according to @bible-strong/avatar-core', () => {
    const darkDef = getGitAsciiAvatarDefinition('default', 'dark')
    const darkVal = validateAvatarDefinition(darkDef)
    expect(darkVal.ok).toBe(true)

    const octoDef = getGitAsciiAvatarDefinition('octo', 'light')
    const octoVal = validateAvatarDefinition(octoDef)
    expect(octoVal.ok).toBe(true)
  })

  it('correctly maps friendly expression aliases to Bible Strong keys', () => {
    expect(resolveGitAsciiExpression('happy')).toBe('joyful-wide')
    expect(resolveGitAsciiExpression('curious')).toBe('curious-left')
    expect(resolveGitAsciiExpression('focused')).toBe('small-attentive')
    expect(resolveGitAsciiExpression('neutral')).toBe('neutral')
  })

  it('renders static SVG avatar cleanly with Signal Lime body in dark mode', () => {
    const html = renderToStaticMarkup(
      React.createElement(GitAsciiAvatar, { size: 128, expression: 'happy' })
    )
    expect(html).toContain('viewBox="-150 -150 300 300"')
    expect(html).toContain('fill="#c5ff4a"')
    expect(html).toContain('fill="#000000"')
  })

  it('renders light theme with Carbon body and Signal Lime eyes', () => {
    const html = renderToStaticMarkup(
      React.createElement(GitAsciiAvatar, { size: 64, theme: 'light', expression: 'neutral' })
    )
    expect(html).toContain('fill="#060606"')
    expect(html).toContain('fill="#c5ff4a"')
  })

  it('renders octo variant with developer ear nodes from 3D geometry', () => {
    const html = renderToStaticMarkup(
      React.createElement(GitAsciiAvatar, { size: 128, variant: 'octo' })
    )
    // The rendered SVG must contain the ear back paths
    expect(html).toContain('viewBox="-150 -150 300 300"')
    const pathCount = (html.match(/<path/g) || []).length
    expect(pathCount).toBeGreaterThanOrEqual(4) // 2 ears, 1 head, eyes
  })

  it('renders GitAsciiLogo with both avatar and wordmark', () => {
    const html = renderToStaticMarkup(React.createElement(GitAsciiLogo, { size: 40 }))
    expect(html).toContain('Git')
    expect(html).toContain('Ascii')
    expect(html).toContain('viewBox="-150 -150 300 300"')
  })
})

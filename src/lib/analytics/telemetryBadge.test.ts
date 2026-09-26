import { describe, expect, it } from 'vitest'

import { getTelemetryStyle, hasTelemetryBadge, upsertTelemetryBlock } from './telemetryBadge'

describe('README telemetry badge', () => {
  const readme = `# My profile
<picture><img src="https://raw.githubusercontent.com/igor/igor/gitascii/profiles/default/dark.svg"></picture>

My own content.\n`

  it('adds a transparent badge without changing other README content and detects it', () => {
    const updated = upsertTelemetryBlock(readme, 'igor', 'default', 'transparent')
    expect(updated).toContain('# My profile')
    expect(updated).toContain('My own content.')
    expect(updated).toContain('style=transparent')
    expect(updated).toContain('width="1" height="1"')
    expect(hasTelemetryBadge(updated, 'igor', 'default')).toBe(true)
    expect(getTelemetryStyle(updated, 'igor', 'default')).toBe('transparent')
    expect(upsertTelemetryBlock(updated, 'igor', 'default', 'transparent')).toBe(updated)
  })

  it('replaces only the chosen profile block', () => {
    const withDefault = upsertTelemetryBlock(readme, 'igor', 'default', 'classic')
    const withOther = upsertTelemetryBlock(withDefault, 'igor', 'other', 'outline')
    const updated = upsertTelemetryBlock(withOther, 'igor', 'default', 'compact')
    expect(updated).toContain('slug=default&amp;style=compact')
    expect(updated).toContain('slug=other&amp;style=outline')
    expect((updated.match(/GITASCII:TELEMETRY:START/g) || []).length).toBe(2)
    expect(hasTelemetryBadge(updated, 'igor', 'other')).toBe(true)
  })

  it('recognizes a legacy badge and avoids adding a duplicate', () => {
    const legacy = `${readme}<p><img src="https://gitascii.com/api/badge/igor"></p>`
    expect(hasTelemetryBadge(legacy, 'igor', 'default')).toBe(true)
    const updated = upsertTelemetryBlock(legacy, 'igor', 'default', 'outline')
    expect((updated.match(/api\/badge\/igor/g) || []).length).toBe(1)
    expect(getTelemetryStyle(updated, 'igor', 'default')).toBe('outline')
  })

  it('does not count a commented URL or another profile as installed', () => {
    const content =
      '<!-- <img src="https://gitascii.com/api/badge/igor?slug=default"> -->\n```html\n<img src="https://gitascii.com/api/badge/igor?slug=default">\n```\n<img src="https://gitascii.com/api/badge/igor?slug=other">'
    expect(hasTelemetryBadge(content, 'igor', 'default')).toBe(false)
  })

  it('ignores badge URLs inside malformed, unterminated HTML comments', () => {
    const content =
      '<!-- <img src="https://gitascii.com/api/badge/igor?slug=default">\n<img src="https://gitascii.com/api/badge/igor?slug=default">'
    expect(hasTelemetryBadge(content, 'igor', 'default')).toBe(false)
  })

  it('does not replace a profile whose slug only shares a prefix', () => {
    const other = upsertTelemetryBlock(readme, 'igor', 'foobar', 'outline')
    const updated = upsertTelemetryBlock(other, 'igor', 'foo', 'compact')
    expect(updated).toContain('slug=foobar&amp;style=outline')
    expect(updated).toContain('slug=foo&amp;style=compact')
  })
})

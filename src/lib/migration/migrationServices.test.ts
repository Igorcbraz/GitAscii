import { describe, expect, it } from 'vitest'

import type { SavedConfiguration } from '@/engine/types'

import { generateV2EmbedCode, updateReadmeContent } from './markdownGenerator'
import {
  computeDeterministicCron,
  generateWorkflowYaml,
  shouldIncludeSchedule,
} from './workflowGenerator'

describe('V2 Migration Services Suite', () => {
  describe('Workflow Generator', () => {
    it('generates minimal workflow without schedule for purely static profiles', () => {
      const staticConfig: SavedConfiguration = {
        version: 1,
        githubId: 123,
        username: 'alice',
        profileSlug: 'default',
        profileName: 'Default',
        templateId: 'terminal',
        widgets: [
          {
            widgetId: 'bio',
            instanceId: 'bio_1',
            name: 'Bio',
            position: { x: 0, y: 0 },
            size: { width: 800, height: 100 },
            config: {},
            locked: false,
            visible: true,
            zIndex: 1,
          },
        ],
        globalStyles: {} as any,
        metadata: {} as any,
      }

      expect(shouldIncludeSchedule(staticConfig)).toBe(false)

      const yaml = generateWorkflowYaml('alice', staticConfig, {
        actionSha: 'abcdef1234567890',
        isPro: false,
      })

      expect(yaml).toContain('uses: Igorcbraz/GitAscii/action@abcdef1234567890')
      expect(yaml).toContain('permissions:\n  contents: write')
      expect(yaml).not.toContain('id-token: write')
      expect(yaml).not.toContain('schedule:')
      expect(yaml).not.toContain('pro_telemetry: true')
    })

    it('generates scheduled workflow with distributed deterministic cron for dynamic profiles', () => {
      const dynamicConfig: SavedConfiguration = {
        version: 1,
        githubId: 123,
        username: 'bob',
        profileSlug: 'default',
        profileName: 'Default',
        templateId: 'terminal',
        widgets: [
          {
            widgetId: 'stats-cards',
            instanceId: 'stats_1',
            name: 'Stats',
            position: { x: 0, y: 0 },
            size: { width: 800, height: 100 },
            config: {},
            locked: false,
            visible: true,
            zIndex: 1,
          },
        ],
        globalStyles: {} as any,
        metadata: {} as any,
      }

      expect(shouldIncludeSchedule(dynamicConfig)).toBe(true)

      const cron1 = computeDeterministicCron('bob')
      const cron2 = computeDeterministicCron('bob')
      const cronAlice = computeDeterministicCron('alice')

      expect(cron1).toBe(cron2) // Deterministic
      expect(cronAlice).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/)
      expect(cron1).toMatch(/^\d{1,2} \d{1,2} \* \* \*$/)

      const yaml = generateWorkflowYaml('bob', dynamicConfig, { isPro: true })
      expect(yaml).toContain('schedule:')
      expect(yaml).toContain(`cron: '${cron1}'`)
      expect(yaml).toContain('id-token: write')
      expect(yaml).toContain('pro_telemetry: true')
    })
  })

  describe('Markdown Generator', () => {
    it('generates standard <picture> tag pointing to raw.githubusercontent.com', () => {
      const code = generateV2EmbedCode({ username: 'carol', profileSlug: 'default' })
      expect(code).toContain('<picture>')
      expect(code).toContain(
        'https://raw.githubusercontent.com/carol/carol/gitascii/profiles/default/dark.svg'
      )
      expect(code).toContain(
        'https://raw.githubusercontent.com/carol/carol/gitascii/profiles/default/light.svg'
      )
    })

    it('replaces legacy V1 widget URL in existing README content cleanly', () => {
      const oldReadme = `# Hi, I am Dave!
<a href="https://gitascii.com">
  <img src="https://gitascii.com/api/dave?v=123" alt="GitAscii Widget" width="100%" />
</a>

Thanks for visiting!`

      const newEmbed = generateV2EmbedCode({ username: 'dave' })
      const updated = updateReadmeContent(oldReadme, newEmbed, 'default')

      expect(updated).toContain('<picture>')
      expect(updated).not.toContain('https://gitascii.com/api/dave')
      expect(updated).toContain('# Hi, I am Dave!')
      expect(updated).toContain('Thanks for visiting!')
    })

    it('cleans duplicate or previous badges when updating README', () => {
      const readmeWithDupes = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/igor/igor/gitascii/profiles/default/dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/igor/igor/gitascii/profiles/default/light.svg">
  <img alt="GitAscii Profile" src="https://raw.githubusercontent.com/igor/igor/gitascii/profiles/default/dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://gitascii.com">
    <img alt="Made with GitAscii" src="https://gitascii.com/api/badge/igor" width="100%">
  </a>
</p>
<p align="right"><a href="https://gitascii.com"><img alt="Powered by GitAscii" src="https://gitascii.com/api/badge/igor" height="20"></a></p>`

      const newEmbed = generateV2EmbedCode({ username: 'igor', includeBadge: true })
      const updated = updateReadmeContent(readmeWithDupes, newEmbed, 'default')

      // Should only have exactly 1 occurrence of made with GitAscii badge and no legacy right aligned badge
      const occurrences = (updated.match(/api\/badge\/igor/g) || []).length
      expect(occurrences).toBe(1)
      expect(updated).not.toContain('align="right"')
      expect(updated).toContain('align="center"')
    })
  })
})

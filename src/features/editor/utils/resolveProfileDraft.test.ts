import { describe, expect, it } from 'vitest'

import { createConfiguration } from '@/engine/core/TemplateRenderer'

import { resolveProfileDraft } from './resolveProfileDraft'

const config = (updatedAt: string, profileName: string) => {
  const result = createConfiguration(1, 'testuser', 'blank', 'default', profileName)
  result.metadata.updatedAt = updatedAt
  return result
}

describe('editor and Pro configuration reconciliation', () => {
  it('loads a newer restored server version without deleting the local draft', () => {
    const draft = JSON.stringify(config('2026-09-01T00:00:00Z', 'local'))
    const server = config('2026-09-02T00:00:00Z', 'restored')
    expect(resolveProfileDraft(draft, server)).toBe(server)
  })
  it('preserves newer unsaved editing work', () => {
    const draft = config('2026-09-03T00:00:00Z', 'local edits')
    expect(
      resolveProfileDraft(JSON.stringify(draft), config('2026-09-02T00:00:00Z', 'published'))
    ).toEqual(draft)
  })
  it.each(['null', '{', '{}', '{"widgets":null}'])('rejects invalid local draft %s', (raw) => {
    const server = config('2026-09-02T00:00:00Z', 'server')
    expect(resolveProfileDraft(raw, server)).toBe(server)
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createConfiguration } from '@/engine/core/TemplateRenderer'
import { getMockGitHubData } from '@/features/github/api/mockProfile'

import { bootstrapGitasciiProfiles } from './branchBootstrap'

vi.mock('@/engine/core/SVGEngine', () => ({ renderSvg: () => '<svg></svg>' }))
vi.mock('@/engine/inliner/externalAssetInliner', () => ({
  processExternalAssets: async (svg: string) => ({ svg }),
}))

let calls: { url: string; method: string; body: Record<string, unknown> }[]
beforeEach(() => {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}'))
      calls.push({ url, method: init?.method || 'GET', body })
      if (url.includes('/branches/')) return Response.json({ commit: { sha: 'base-head' } })
      return Response.json({ sha: `sha-${calls.length}` })
    })
  )
})
afterEach(() => vi.unstubAllGlobals())

const profiles = () => [
  createConfiguration(1, 'owner', 'blank'),
  createConfiguration(1, 'owner', 'blank', 'work'),
]

describe('atomic multi-profile publication', () => {
  it('publishes both configurations and themes using a single guarded ref update', async () => {
    const result = await bootstrapGitasciiProfiles(
      'owner',
      'owner',
      'test-token',
      profiles(),
      getMockGitHubData('owner')
    )
    expect(result.success).toBe(true)
    const tree = calls.find((call) => call.url.endsWith('/git/trees'))
    expect(tree?.body.tree).toHaveLength(6)
    const writes = calls.filter((call) => call.method === 'PATCH')
    expect(writes).toHaveLength(1)
    expect(writes[0].body.force).toBe(false)
  })

  it('never updates the published ref if preparing the second profile fails', async () => {
    const original = vi.mocked(fetch).getMockImplementation()!
    vi.mocked(fetch).mockImplementation(async (url, init) => {
      if (
        String(url).endsWith('/git/blobs') &&
        calls.filter((call) => call.url.endsWith('/git/blobs')).length === 3
      ) {
        return Response.json({}, { status: 503 })
      }
      return original(url, init)
    })
    const result = await bootstrapGitasciiProfiles(
      'owner',
      'owner',
      'test-token',
      profiles(),
      getMockGitHubData('owner')
    )
    expect(result.success).toBe(false)
    expect(calls.some((call) => call.method === 'PATCH')).toBe(false)
  })
})

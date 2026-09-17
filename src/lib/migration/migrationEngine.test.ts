import { beforeEach, describe, expect, it, vi } from 'vitest'

import { checkGitHubRateLimit, processCandidateMigration } from './migrationEngine'

describe('Migration Engine Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calculates safe batch size according to remaining rate limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          resources: {
            core: {
              remaining: 300,
              limit: 5000,
              reset: Math.floor(Date.now() / 1000) + 3600,
            },
          },
        }),
        { status: 200 }
      )
    )

    const status = await checkGitHubRateLimit('mock_token', 25)
    expect(status.remaining).toBe(300)
    expect(status.canProceed).toBe(true)
    expect(status.safeBatchSize).toBe(20) // floor(300 / 15) = 20
  })

  it('pauses batch when rate limit remaining is below 100', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          resources: {
            core: {
              remaining: 45,
              limit: 5000,
              reset: Math.floor(Date.now() / 1000) + 1800,
            },
          },
        }),
        { status: 200 }
      )
    )

    const status = await checkGitHubRateLimit('mock_token', 20)
    expect(status.remaining).toBe(45)
    expect(status.canProceed).toBe(false)
  })

  it('detects already migrated V2 repository immediately', async () => {
    // 1. Repo info OK
    // 2. Workflow exists (status 200)
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'wf_123' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'gitascii' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'dark' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'light' }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sha: 'readme',
            content: Buffer.from(
              'https://raw.githubusercontent.com/charlie/charlie/gitascii/profiles/default/dark.svg'
            ).toString('base64'),
          }),
          { status: 200 }
        )
      )

    const result = await processCandidateMigration(
      { installationId: 1, owner: 'charlie', repo: 'charlie' },
      'mock_token'
    )

    expect(result.status).toBe('completed')
  })

  it('detects existing open PR without re-opening a duplicate', async () => {
    // 1. Repo info OK
    // 2. Workflow does not exist (status 404)
    // 3. Pull requests query returns open PR #42
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              number: 42,
              state: 'open',
              head: { ref: 'gitascii-v2-migration' },
            },
          ]),
          { status: 200 }
        )
      )

    const result = await processCandidateMigration(
      { installationId: 1, owner: 'eve', repo: 'eve' },
      'mock_token'
    )

    expect(result.status).toBe('pr_opened')
    expect(result.prNumber).toBe(42)
  })

  it('respects user decision if PR was closed unmerged (does not re-open spam PR)', async () => {
    // 1. Repo info OK
    // 2. Workflow does not exist (status 404)
    // 3. Pull requests query returns closed unmerged PR #17
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response('Not Found', { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              number: 17,
              state: 'closed',
              merged_at: null,
              head: { ref: 'gitascii-v2-migration' },
            },
          ]),
          { status: 200 }
        )
      )

    const result = await processCandidateMigration(
      { installationId: 1, owner: 'frank', repo: 'frank' },
      'mock_token'
    )

    expect(result.status).toBe('pr_closed_unmerged')
    expect(result.prNumber).toBe(17)
  })
})

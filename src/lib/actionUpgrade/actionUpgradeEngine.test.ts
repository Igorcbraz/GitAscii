import { beforeEach, describe, expect, it, vi } from 'vitest'

import { checkAndUpgradeActionInRepo } from './actionUpgradeEngine'

describe('Action Upgrade Engine Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('detects that the repository already has the latest SHA and skips PR', async () => {
    const mockWorkflowYaml = `
name: Update GitAscii
jobs:
  publish:
    steps:
      - uses: Igorcbraz/GitAscii/action@sha_latest_123
    `

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(mockWorkflowYaml).toString('base64'),
            sha: 'file_sha_1',
          }),
          { status: 200 }
        )
      )

    const result = await checkAndUpgradeActionInRepo(
      { owner: 'grace', repo: 'grace' },
      'sha_latest_123',
      'mock_token'
    )

    expect(result.status).toBe('up_to_date')
    expect(result.deployedSha).toBe('sha_latest_123')
  })

  it('opens an upgrade PR when the repository has an older SHA', async () => {
    const mockOldWorkflow = `
name: Update GitAscii
jobs:
  publish:
    steps:
      - uses: Igorcbraz/GitAscii/action@sha_old_000
    `

    vi.spyOn(globalThis, 'fetch')
      // 1. Repo info
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ default_branch: 'main' }), { status: 200 })
      )
      // 2. Workflow content
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(mockOldWorkflow).toString('base64'),
            sha: 'file_sha_1',
          }),
          { status: 200 }
        )
      )
      // 3. PRs list (no existing PRs)
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
      // 4. Default branch info
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            commit: { sha: 'base_commit_1' },
          }),
          { status: 200 }
        )
      )
      // 5. Delete existing branch (if any)
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      // 6. Create branch ref
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ref: 'refs/heads/gitascii-action-upgrade' }), { status: 201 })
      )
      // 7. Update file on branch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ content: { sha: 'new_file_sha' } }), { status: 200 })
      )
      // 8. Open PR
      .mockResolvedValueOnce(new Response(JSON.stringify({ number: 99 }), { status: 201 }))

    const result = await checkAndUpgradeActionInRepo(
      { owner: 'heidi', repo: 'heidi' },
      'sha_target_new_999',
      'mock_token'
    )

    expect(result.status).toBe('pr_opened')
    expect(result.prNumber).toBe(99)
  })
})

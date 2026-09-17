import { beforeEach, describe, expect, it, vi } from 'vitest'

import { computeSha256, GitOpsService } from './gitOps'

describe('GitOpsService Suite', () => {
  const owner = 'testuser'
  const repo = 'testuser'
  const token = 'ghp_mocktoken123'
  let gitOps: GitOpsService

  beforeEach(() => {
    vi.restoreAllMocks()
    gitOps = new GitOpsService(owner, repo, token)
  })

  it('computes consistent sha256 hashes for strings', () => {
    const hash1 = computeSha256('<svg>test</svg>')
    const hash2 = computeSha256('<svg>test</svg>')
    const hash3 = computeSha256('<svg>different</svg>')

    expect(hash1).toBe(hash2)
    expect(hash1).not.toBe(hash3)
  })

  it('detects missing gitascii branch gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Not Found', { status: 404 }))

    const state = await gitOps.getBranchState('gitascii')
    expect(state.exists).toBe(false)
    expect(state.latestCommitSha).toBeUndefined()
  })

  it('correctly reads branch state and parses gitascii.json', async () => {
    const mockBranchData = {
      commit: {
        sha: 'commit_sha_123',
        commit: {
          tree: { sha: 'tree_sha_456' },
        },
      },
    }

    const mockConfig = {
      version: 1,
      username: 'testuser',
      metadata: { revision: 'rev_100', updatedAt: '2026-09-15T00:00:00Z' },
    }

    const mockTreeData = {
      tree: [
        { path: 'profiles/default/dark.svg', type: 'blob', sha: 'blob_dark_1' },
        { path: 'profiles/default/light.svg', type: 'blob', sha: 'blob_light_1' },
      ],
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBranchData), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(mockConfig)).toString('base64'),
            sha: 'config_sha_789',
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTreeData), { status: 200 }))

    const state = await gitOps.getBranchState('gitascii')
    expect(state.exists).toBe(true)
    expect(state.latestCommitSha).toBe('commit_sha_123')
    expect(state.treeSha).toBe('tree_sha_456')
    expect(state.config?.username).toBe('testuser')
    expect(state.existingSvgHashes['profiles/default/dark.svg']).toBe('blob_dark_1')
  })

  it('skips commit when expected revision is older than remote revision (race condition protection)', async () => {
    const mockBranchData = {
      commit: { sha: 'commit_sha_123', commit: { tree: { sha: 'tree_sha_456' } } },
    }
    const mockConfig = {
      version: 1,
      metadata: { revision: 'rev_200' }, // Remote is already on rev_200
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBranchData), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(mockConfig)).toString('base64'),
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ tree: [] }), { status: 200 }))

    // Action was executing rev_100
    const result = await gitOps.publishAtomic(
      'gitascii',
      [{ path: 'profiles/default/dark.svg', content: '<svg>new</svg>' }],
      'rev_100'
    )

    expect(result.committed).toBe(false)
    expect(result.staleSkipped).toBe(true)
    expect(result.unchanged).toBe(true)
  })

  it('skips commit when generated blob SHAs match existing tree (svg_unchanged)', async () => {
    const mockBranchData = {
      commit: { sha: 'commit_sha_123', commit: { tree: { sha: 'tree_sha_456' } } },
    }
    const mockConfig = {
      version: 1,
      metadata: { revision: 'rev_100' },
    }
    const mockTreeData = {
      tree: [{ path: 'profiles/default/dark.svg', type: 'blob', sha: 'existing_blob_sha' }],
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBranchData), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(mockConfig)).toString('base64'),
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTreeData), { status: 200 }))
      // Blob creation returns same sha
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sha: 'existing_blob_sha' }), { status: 201 })
      )

    const result = await gitOps.publishAtomic(
      'gitascii',
      [{ path: 'profiles/default/dark.svg', content: '<svg>same</svg>' }],
      'rev_100'
    )

    expect(result.committed).toBe(false)
    expect(result.unchanged).toBe(true)
    expect(result.staleSkipped).toBe(false)
  })

  it('executes atomic commit and ref update when SVGs change', async () => {
    const mockBranchData = {
      commit: { sha: 'commit_sha_123', commit: { tree: { sha: 'tree_sha_456' } } },
    }
    const mockConfig = {
      version: 1,
      metadata: { revision: 'rev_100' },
    }
    const mockTreeData = {
      tree: [{ path: 'profiles/default/dark.svg', type: 'blob', sha: 'old_blob_sha' }],
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBranchData), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(mockConfig)).toString('base64'),
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTreeData), { status: 200 }))
      // 1. Create Blob -> new sha
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'new_blob_sha' }), { status: 201 }))
      // 2. Create Tree -> new tree sha
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sha: 'new_tree_sha_789' }), { status: 201 })
      )
      // 3. Create Commit -> new commit sha
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ sha: 'new_commit_sha_999' }), { status: 201 })
      )
      // 4. Update Ref -> 200 OK
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ref: 'refs/heads/gitascii' }), { status: 200 })
      )

    const result = await gitOps.publishAtomic(
      'gitascii',
      [{ path: 'profiles/default/dark.svg', content: '<svg>changed</svg>' }],
      'rev_100'
    )

    expect(result.committed).toBe(true)
    expect(result.commitSha).toBe('new_commit_sha_999')
    expect(result.unchanged).toBe(false)
    expect(result.staleSkipped).toBe(false)
  })

  it('discovers all multi-profile configuration files in branch tree', async () => {
    const mockBranchData = {
      commit: { sha: 'commit_sha_123', commit: { tree: { sha: 'tree_sha_456' } } },
    }
    const mockTreeData = {
      tree: [
        { path: 'gitascii.json', type: 'blob', sha: 'sha_default_cfg' },
        { path: 'gitascii_work.json', type: 'blob', sha: 'sha_work_cfg' },
        { path: 'profiles/default/dark.svg', type: 'blob', sha: 'blob_dark' },
      ],
    }

    const defaultCfg = { version: 1, profileSlug: 'default', templateId: 'terminal' }
    const workCfg = { version: 1, profileSlug: 'work', templateId: 'retro' }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockBranchData), { status: 200 })) // getBranchState -> branch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(defaultCfg)).toString('base64'),
            sha: 'sha_default_cfg',
          }),
          { status: 200 }
        )
      ) // getBranchState -> contents/gitascii.json
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTreeData), { status: 200 })) // getBranchState -> trees
      .mockResolvedValueOnce(new Response(JSON.stringify(mockTreeData), { status: 200 })) // getAllProfileConfigs -> trees
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(defaultCfg)).toString('base64'),
          }),
          { status: 200 }
        )
      ) // blob default
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            content: Buffer.from(JSON.stringify(workCfg)).toString('base64'),
          }),
          { status: 200 }
        )
      ) // blob work

    const res = await gitOps.getAllProfileConfigs('gitascii')
    expect(res.exists).toBe(true)
    expect(res.configs).toHaveLength(2)
    expect(res.configs[0].slug).toBe('default')
    expect(res.configs[1].slug).toBe('work')
  })
})

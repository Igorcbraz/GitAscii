import crypto from 'node:crypto'

import type { SavedConfiguration } from '@/engine/types'

export interface ProfileConfigFile {
  slug: string
  path: string
  sha: string
  config: SavedConfiguration
}

export interface BranchState {
  exists: boolean
  latestCommitSha?: string
  treeSha?: string
  config?: SavedConfiguration
  configSha?: string
  existingSvgHashes: Record<string, string> // path -> sha256
}

export interface PublishResult {
  committed: boolean
  commitSha?: string
  revision: string
  unchanged: boolean
  staleSkipped: boolean
}

export function computeSha256(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export class GitOpsService {
  private owner: string
  private repo: string
  private token: string
  private headers: Record<string, string>

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner
    this.repo = repo
    this.token = token
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'GitAscii-Action',
      Authorization: `Bearer ${token}`,
    }
  }

  async getBranchState(branchName = 'gitascii'): Promise<BranchState> {
    const branchRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/branches/${encodeURIComponent(branchName)}`,
      { headers: this.headers }
    )

    if (branchRes.status === 404) {
      return { exists: false, existingSvgHashes: {} }
    }

    if (!branchRes.ok) {
      throw new Error(`Failed to check branch ${branchName}: HTTP ${branchRes.status}`)
    }

    const branchData = await branchRes.json()
    const latestCommitSha = branchData.commit.sha
    const treeSha = branchData.commit.commit.tree.sha

    // Fetch gitascii.json
    const configRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/contents/gitascii.json?ref=${encodeURIComponent(branchName)}`,
      { headers: this.headers }
    )

    let config: SavedConfiguration | undefined
    let configSha: string | undefined

    if (configRes.ok) {
      const configData = await configRes.json()
      configSha = configData.sha
      const decoded = Buffer.from(configData.content, 'base64').toString('utf8')
      try {
        config = JSON.parse(decoded)
      } catch (err) {
        console.warn('Failed to parse gitascii.json from remote branch:', err)
      }
    }

    const treeRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${treeSha}?recursive=1`,
      { headers: this.headers }
    )

    const existingSvgHashes: Record<string, string> = {}
    if (treeRes.ok) {
      const treeData = await treeRes.json()
      if (Array.isArray(treeData.tree)) {
        for (const item of treeData.tree) {
          if (item.type === 'blob' && typeof item.path === 'string' && item.path.endsWith('.svg')) {
            existingSvgHashes[item.path] = item.sha
          }
        }
      }
    }

    return {
      exists: true,
      latestCommitSha,
      treeSha,
      config,
      configSha,
      existingSvgHashes,
    }
  }

  async getAllProfileConfigs(branchName = 'gitascii'): Promise<{
    exists: boolean
    branchState: BranchState
    configs: ProfileConfigFile[]
  }> {
    const branchState = await this.getBranchState(branchName)
    if (!branchState.exists || !branchState.treeSha) {
      return { exists: false, branchState, configs: [] }
    }

    const treeRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees/${branchState.treeSha}?recursive=1`,
      { headers: this.headers }
    )

    const configs: ProfileConfigFile[] = []
    const configFilesToFetch: Array<{ path: string; sha: string; slug: string }> = []

    if (treeRes.ok) {
      const treeData = await treeRes.json()
      if (Array.isArray(treeData.tree)) {
        for (const item of treeData.tree) {
          if (item.type === 'blob' && typeof item.path === 'string') {
            const fileName = item.path.split('/').pop() || item.path
            if (fileName === 'gitascii.json') {
              configFilesToFetch.push({ path: item.path, sha: item.sha, slug: 'default' })
            } else {
              const multiMatch = fileName.match(/^gitascii_([a-zA-Z0-9_-]+)\.json$/)
              if (multiMatch) {
                configFilesToFetch.push({
                  path: item.path,
                  sha: item.sha,
                  slug: multiMatch[1].toLowerCase(),
                })
              }
            }
          }
        }
      }
    }

    if (configFilesToFetch.length === 0 && branchState.config) {
      configs.push({
        slug: branchState.config.profileSlug || 'default',
        path: 'gitascii.json',
        sha: branchState.configSha || '',
        config: branchState.config,
      })
      return { exists: true, branchState, configs }
    }

    for (const f of configFilesToFetch) {
      try {
        const blobRes = await fetch(
          `https://api.github.com/repos/${this.owner}/${this.repo}/git/blobs/${f.sha}`,
          { headers: this.headers }
        )
        if (blobRes.ok) {
          const blobData = await blobRes.json()
          const decoded = Buffer.from(blobData.content, 'base64').toString('utf8')
          const parsed = JSON.parse(decoded) as SavedConfiguration
          configs.push({
            slug: parsed.profileSlug || f.slug,
            path: f.path,
            sha: f.sha,
            config: parsed,
          })
        }
      } catch (err) {
        console.warn(`[GitOps] Failed to fetch/parse config file ${f.path}:`, err)
      }
    }

    return { exists: true, branchState, configs }
  }

  async publishAtomic(
    branchName: string,
    files: Array<{ path: string; content: string }>,
    expectedRevision?: string,
    commitMessage = 'Update GitAscii SVGs [skip ci]'
  ): Promise<PublishResult> {
    const currentState = await this.getBranchState(branchName)

    if (!currentState.exists || !currentState.latestCommitSha) {
      throw new Error(`Branch ${branchName} does not exist. Please run initial setup.`)
    }

    const remoteRevision =
      currentState.config?.metadata?.revision || currentState.config?.metadata?.updatedAt
    if (expectedRevision && remoteRevision && remoteRevision !== expectedRevision) {
      console.log(
        `[GitOps] Newer revision (${remoteRevision}) detected on remote compared to current job (${expectedRevision}). Skipping publication.`
      )
      return {
        committed: false,
        revision: remoteRevision,
        unchanged: true,
        staleSkipped: true,
      }
    }

    interface TreeEntry {
      path: string
      mode: '100644'
      type: 'blob'
      sha: string
    }

    const treeEntries: TreeEntry[] = []
    let hasAnyChanges = false

    for (const file of files) {
      const blobRes = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            ...this.headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: Buffer.from(file.content, 'utf8').toString('base64'),
            encoding: 'base64',
          }),
        }
      )

      if (!blobRes.ok) {
        throw new Error(`Failed to create blob for ${file.path}: HTTP ${blobRes.status}`)
      }

      const blobData = await blobRes.json()
      const newBlobSha = blobData.sha

      const existingSha = currentState.existingSvgHashes[file.path]
      if (existingSha !== newBlobSha) {
        hasAnyChanges = true
      }

      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: newBlobSha,
      })
    }

    if (!hasAnyChanges) {
      console.log(
        '[GitOps] All generated SVGs match existing blobs. No commit needed (svg_unchanged).'
      )
      return {
        committed: false,
        revision: expectedRevision || 'latest',
        unchanged: true,
        staleSkipped: false,
      }
    }

    const treeRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/trees`,
      {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_tree: currentState.treeSha,
          tree: treeEntries,
        }),
      }
    )

    if (!treeRes.ok) {
      throw new Error(`Failed to create tree: HTTP ${treeRes.status}`)
    }

    const treeData = await treeRes.json()
    const newTreeSha = treeData.sha

    const commitRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/commits`,
      {
        method: 'POST',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          tree: newTreeSha,
          parents: [currentState.latestCommitSha],
          author: {
            name: 'github-actions[bot]',
            email: '41898282+github-actions[bot]@users.noreply.github.com',
            date: new Date().toISOString(),
          },
        }),
      }
    )

    if (!commitRes.ok) {
      throw new Error(`Failed to create commit: HTTP ${commitRes.status}`)
    }

    const commitData = await commitRes.json()
    const newCommitSha = commitData.sha

    const refRes = await fetch(
      `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${encodeURIComponent(branchName)}`,
      {
        method: 'PATCH',
        headers: {
          ...this.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sha: newCommitSha,
          force: false,
        }),
      }
    )

    if (!refRes.ok) {
      throw new Error(`Failed to update branch ref: HTTP ${refRes.status}`)
    }

    console.log(
      `[GitOps] Successfully published atomic commit ${newCommitSha} to branch ${branchName}`
    )

    return {
      committed: true,
      commitSha: newCommitSha,
      revision: expectedRevision || 'latest',
      unchanged: false,
      staleSkipped: false,
    }
  }
}

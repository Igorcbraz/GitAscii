import { renderSvg } from '@/engine/core/SVGEngine'
import { processExternalAssets } from '@/engine/inliner/externalAssetInliner'
import type { NormalizedGitHubData, SavedConfiguration } from '@/engine/types'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface BootstrapResult {
  success: boolean
  branchCreated: boolean
  commitSha: string
  revision: string
  error?: string
}

export async function bootstrapGitasciiBranch(
  owner: string,
  repo: string,
  token: string,
  config: SavedConfiguration,
  data: NormalizedGitHubData
): Promise<BootstrapResult> {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitAscii-App',
    Authorization: `Bearer ${token}`,
  }

  const branchName = 'gitascii'
  const slug = (config.profileSlug || 'default').toLowerCase()
  const revision = config.metadata?.revision || `rev_${Date.now()}`

  config.metadata = {
    ...config.metadata,
    revision,
    updatedAt: new Date().toISOString(),
  }

  try {
    let latestCommitSha: string | null = null
    let branchCreated = false

    const branchRes = await fetch(API_ENDPOINTS.GITHUB.REPO_BRANCHES(owner, repo, branchName), {
      headers,
    })

    if (branchRes.status === 200) {
      const branchData = await branchRes.json()
      latestCommitSha = branchData.commit.sha
    } else if (branchRes.status === 404) {
      const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(owner, repo), { headers })
      if (!repoRes.ok) {
        throw new Error(`Failed to fetch repo ${owner}/${repo}: HTTP ${repoRes.status}`)
      }
      const repoData = await repoRes.json()
      const defaultBranch = repoData.default_branch || 'main'

      const defaultBranchRes = await fetch(
        API_ENDPOINTS.GITHUB.REPO_BRANCHES(owner, repo, defaultBranch),
        { headers }
      )
      if (!defaultBranchRes.ok) {
        throw new Error(
          `Failed to fetch default branch ${defaultBranch}: HTTP ${defaultBranchRes.status}`
        )
      }
      const defaultBranchData = await defaultBranchRes.json()
      const baseCommitSha = defaultBranchData.commit.sha

      const createRefRes = await fetch(API_ENDPOINTS.GITHUB.GIT_REFS(owner, repo), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseCommitSha,
        }),
      })

      if (!createRefRes.ok) {
        throw new Error(`Failed to create branch ${branchName}: HTTP ${createRefRes.status}`)
      }

      latestCommitSha = baseCommitSha
      branchCreated = true
    } else {
      throw new Error(`Failed to check branch ${branchName}: HTTP ${branchRes.status}`)
    }

    const rawDarkSvg = renderSvg(config, data, { theme: 'dark' })
    const darkProcessed = await processExternalAssets(rawDarkSvg, {
      validateUrl: async () => ({ safe: true }),
    })

    const rawLightSvg = renderSvg(config, data, { theme: 'light' })
    const lightProcessed = await processExternalAssets(rawLightSvg, {
      validateUrl: async () => ({ safe: true }),
    })

    const files = [
      {
        path: 'gitascii.json',
        content: JSON.stringify(config, null, 2),
      },
      {
        path: `profiles/${slug}/dark.svg`,
        content: darkProcessed.svg,
      },
      {
        path: `profiles/${slug}/light.svg`,
        content: lightProcessed.svg,
      },
    ]

    const treeEntries = []

    for (const file of files) {
      const blobRes = await fetch(API_ENDPOINTS.GITHUB.GIT_BLOBS(owner, repo), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: Buffer.from(file.content, 'utf8').toString('base64'),
          encoding: 'base64',
        }),
      })

      if (!blobRes.ok) {
        throw new Error(`Failed to create blob for ${file.path}: HTTP ${blobRes.status}`)
      }

      const blobData = await blobRes.json()
      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      })
    }

    const treeRes = await fetch(API_ENDPOINTS.GITHUB.GIT_TREES(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tree: treeEntries,
      }),
    })

    if (!treeRes.ok) {
      throw new Error(`Failed to create tree: HTTP ${treeRes.status}`)
    }

    const treeData = await treeRes.json()

    const commitRes = await fetch(API_ENDPOINTS.GITHUB.GIT_COMMITS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Initialize GitAscii ${slug} profile SVGs [skip ci]\n\nCo-authored-by: ${owner} <${owner}@users.noreply.github.com>`,
        tree: treeData.sha,
        parents: latestCommitSha ? [latestCommitSha] : [],
      }),
    })

    if (!commitRes.ok) {
      throw new Error(`Failed to create commit: HTTP ${commitRes.status}`)
    }

    const commitData = await commitRes.json()
    const newCommitSha = commitData.sha

    const updateRefRes = await fetch(API_ENDPOINTS.GITHUB.GIT_REFS_HEADS(owner, repo, branchName), {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sha: newCommitSha,
        force: true,
      }),
    })

    if (!updateRefRes.ok) {
      throw new Error(`Failed to update ref: HTTP ${updateRefRes.status}`)
    }

    return {
      success: true,
      branchCreated,
      commitSha: newCommitSha,
      revision,
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      branchCreated: false,
      commitSha: '',
      revision,
      error: errorMsg,
    }
  }
}

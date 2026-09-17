import { MIGRATION_TEMPLATES } from '@/constants'
import { type SavedConfiguration } from '@/engine'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { loadProfileConfig } from '@/lib/profileStorage'
import { API_ENDPOINTS } from '@/services/endpoints'

import { bootstrapGitasciiBranch } from './branchBootstrap'
import { generateV2EmbedCode, updateReadmeContent } from './markdownGenerator'
import { generateMigrationPrContent } from './prTemplate'
import { generateWorkflowYaml } from './workflowGenerator'

export interface RateLimitStatus {
  remaining: number
  limit: number
  resetTime: number
  safeBatchSize: number
  canProceed: boolean
}

export interface MigrationCandidate {
  installationId: number | string
  owner: string
  repo: string
  userId?: number | string
  currentStatus?: string
  attempts?: number
}

export interface MigrationStepResult {
  status:
    | 'completed'
    | 'post_merge_pending'
    | 'pr_opened'
    | 'pr_closed_unmerged'
    | 'permissions_missing'
    | 'skipped'
    | 'failed'
  prNumber?: number
  error?: string
}

export async function checkGitHubRateLimit(token: string, maxBatch = 20): Promise<RateLimitStatus> {
  try {
    const res = await fetch(API_ENDPOINTS.GITHUB.RATE_LIMIT, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'GitAscii-MigrationEngine',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return { remaining: 500, limit: 5000, resetTime: 0, safeBatchSize: 5, canProceed: true }
    }

    const data = await res.json()
    const core = data.resources?.core || { remaining: 1000, limit: 5000, reset: 0 }
    const remaining = Number(core.remaining) || 0
    const limit = Number(core.limit) || 5000
    const resetTime = Number(core.reset) * 1000

    const safeBatchSize = Math.min(maxBatch, Math.max(1, Math.floor(remaining / 15)))
    const canProceed = remaining >= 100

    return { remaining, limit, resetTime, safeBatchSize, canProceed }
  } catch {
    return { remaining: 500, limit: 5000, resetTime: 0, safeBatchSize: 5, canProceed: true }
  }
}

export async function processCandidateMigration(
  candidate: MigrationCandidate,
  token: string,
  options: { isPro?: boolean } = {}
): Promise<MigrationStepResult> {
  const { owner, repo } = candidate
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'GitAscii-MigrationEngine',
  }

  try {
    const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(owner, repo), { headers })
    if (repoRes.status === 404) {
      return { status: 'skipped', error: 'Repository not found' }
    }
    if (repoRes.status === 403 || repoRes.status === 401) {
      return { status: 'permissions_missing', error: 'Unauthorized or insufficient permissions' }
    }
    if (!repoRes.ok) {
      return { status: 'failed', error: `HTTP ${repoRes.status} accessing repository` }
    }

    const repoData = await repoRes.json()
    const defaultBranch = repoData.default_branch || 'main'

    const workflowCheckRes = await fetch(
      `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, '.github/workflows/gitascii.yml')}?ref=${defaultBranch}`,
      { headers }
    )

    if (workflowCheckRes.status === 200) {
      const [branchRes, darkSvgRes, lightSvgRes, readmeRes] = await Promise.all([
        fetch(API_ENDPOINTS.GITHUB.REPO_BRANCHES(owner, repo, 'gitascii'), { headers }),
        fetch(
          `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, 'profiles/default/dark.svg')}?ref=gitascii`,
          { headers }
        ),
        fetch(
          `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, 'profiles/default/light.svg')}?ref=gitascii`,
          { headers }
        ),
        fetch(
          `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, 'README.md')}?ref=${defaultBranch}`,
          { headers }
        ),
      ])
      const readmeData = readmeRes.ok ? await readmeRes.json() : null
      const readme = readmeData?.content
        ? Buffer.from(readmeData.content, 'base64').toString('utf8')
        : ''
      let readmeReady = readme.includes('/gitascii/profiles/default/')
      if (readmeRes.ok && !readmeReady && readmeData?.sha) {
        const repairedReadme = updateReadmeContent(
          readme,
          generateV2EmbedCode({
            username: owner,
            profileSlug: 'default',
            includeBadge: Boolean(options.isPro),
          }),
          'default'
        )
        const repairRes = await fetch(
          API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, 'README.md'),
          {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Repair GitAscii v2 README embed',
              content: Buffer.from(repairedReadme, 'utf8').toString('base64'),
              sha: readmeData.sha,
              branch: defaultBranch,
            }),
          }
        )
        readmeReady = repairRes.ok
      }
      if (branchRes.ok && darkSvgRes.ok && lightSvgRes.ok && readmeReady) {
        return { status: 'completed' }
      }
      if (branchRes.ok) {
        await fetch(API_ENDPOINTS.GITHUB.WORKFLOW_DISPATCH(owner, repo, 'gitascii.yml'), {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref: defaultBranch }),
        }).catch(() => null)
      }
      return {
        status: 'post_merge_pending',
        error: `Post-merge verification pending: branch=${branchRes.ok}, dark=${darkSvgRes.ok}, light=${lightSvgRes.ok}, readme=${readmeReady}`,
      }
    }

    const prsRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_PULLS(owner, repo, `state=all&head=${owner}:gitascii-v2-migration`),
      { headers }
    )

    if (prsRes.ok) {
      const prs = await prsRes.json()
      if (Array.isArray(prs) && prs.length > 0) {
        const latestPr = prs[0]
        if (latestPr.state === 'open') {
          return { status: 'pr_opened', prNumber: latestPr.number }
        }
        if (latestPr.merged_at) {
          return {
            status: 'post_merge_pending',
            prNumber: latestPr.number,
            error:
              'Migration PR was merged; waiting for workflow and published artifacts verification',
          }
        }
        return { status: 'pr_closed_unmerged', prNumber: latestPr.number }
      }
    }

    const loadedConfig = await loadProfileConfig(owner, 'default')
    const profileData = await fetchGitHubProfile(owner, { fresh: true }).catch(() => null)

    const config: SavedConfiguration = loadedConfig || {
      version: 1,
      githubId: Number(profileData?.user?.id) || 0,
      username: owner,
      profileSlug: 'default',
      profileName: 'Default',
      templateId: 'terminal',
      widgets: [
        {
          widgetId: 'stats-cards',
          instanceId: 'stats_1',
          name: 'Stats',
          position: { x: 0, y: 0 },
          size: { width: 800, height: 180 },
          config: {},
          locked: false,
          visible: true,
          zIndex: 1,
        },
      ],
      globalStyles: {} as any,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
        revision: `rev_${Date.now()}`,
      },
    }

    if (!profileData) {
      return { status: 'failed', error: 'Unable to fetch GitHub profile data for initial render' }
    }

    const bootstrapRes = await bootstrapGitasciiBranch(owner, repo, token, config, profileData)
    if (!bootstrapRes.success) {
      return { status: 'failed', error: `Branch bootstrap failed: ${bootstrapRes.error}` }
    }

    const defaultBranchRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_BRANCHES(owner, repo, defaultBranch),
      { headers }
    )
    if (!defaultBranchRes.ok) {
      return { status: 'failed', error: 'Failed to fetch default branch reference' }
    }
    const defaultBranchData = await defaultBranchRes.json()
    const baseCommitSha = defaultBranchData.commit.sha

    const migrationBranchName = 'gitascii-v2-migration'

    await fetch(API_ENDPOINTS.GITHUB.GIT_REFS_HEADS(owner, repo, migrationBranchName), {
      method: 'DELETE',
      headers,
    }).catch(() => {})

    const createMigrationRefRes = await fetch(API_ENDPOINTS.GITHUB.GIT_REFS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${migrationBranchName}`,
        sha: baseCommitSha,
      }),
    })

    if (!createMigrationRefRes.ok) {
      return {
        status: 'failed',
        error: `Failed to create migration branch: HTTP ${createMigrationRefRes.status}`,
      }
    }

    const workflowYaml = generateWorkflowYaml(owner, config, {
      isPro: Boolean(options.isPro),
    })

    const v2EmbedCode = generateV2EmbedCode({
      username: owner,
      profileSlug: 'default',
      includeBadge: Boolean(options.isPro),
    })

    const readmeRes = await fetch(
      `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, 'README.md')}?ref=${migrationBranchName}`,
      { headers }
    )

    let currentReadmeContent = ''
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json()
      currentReadmeContent = Buffer.from(readmeData.content, 'base64').toString('utf8')
    }

    const updatedReadme = updateReadmeContent(currentReadmeContent, v2EmbedCode, 'default')

    const workflowBlobRes = await fetch(API_ENDPOINTS.GITHUB.GIT_BLOBS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: Buffer.from(workflowYaml, 'utf8').toString('base64'),
        encoding: 'base64',
      }),
    })
    const workflowBlobData = await workflowBlobRes.json()

    const readmeBlobRes = await fetch(API_ENDPOINTS.GITHUB.GIT_BLOBS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: Buffer.from(updatedReadme, 'utf8').toString('base64'),
        encoding: 'base64',
      }),
    })
    const readmeBlobData = await readmeBlobRes.json()

    const treeEntries: Array<{
      path: string
      mode: '100644'
      type: 'blob'
      sha: string | null
    }> = [
      {
        path: '.github/workflows/gitascii.yml',
        mode: '100644',
        type: 'blob',
        sha: workflowBlobData.sha,
      },
      {
        path: 'README.md',
        mode: '100644',
        type: 'blob',
        sha: readmeBlobData.sha,
      },
    ]

    for (const legacyName of ['gitascii.json', 'gitascii_default.json']) {
      try {
        const legacyCheck = await fetch(
          `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, legacyName)}?ref=${defaultBranch}`,
          { headers }
        )
        if (legacyCheck.status === 200) {
          treeEntries.push({
            path: legacyName,
            mode: '100644',
            type: 'blob',
            sha: null,
          })
        }
      } catch {}
    }

    const treeRes = await fetch(API_ENDPOINTS.GITHUB.GIT_TREES(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base_tree: defaultBranchData.commit.commit.tree.sha,
        tree: treeEntries,
      }),
    })
    const treeData = await treeRes.json()

    const commitRes = await fetch(API_ENDPOINTS.GITHUB.GIT_COMMITS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: MIGRATION_TEMPLATES.COMMITS.V2_MIGRATION_PR(owner),
        tree: treeData.sha,
        parents: [baseCommitSha],
      }),
    })
    const commitData = await commitRes.json()

    await fetch(API_ENDPOINTS.GITHUB.GIT_REFS_HEADS(owner, repo, migrationBranchName), {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sha: commitData.sha,
        force: true,
      }),
    })

    const prContent = generateMigrationPrContent(owner)
    const createPrRes = await fetch(API_ENDPOINTS.GITHUB.REPO_PULLS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: prContent.title,
        body: prContent.body,
        head: migrationBranchName,
        base: defaultBranch,
        maintainer_can_modify: true,
      }),
    })

    if (!createPrRes.ok) {
      return {
        status: 'failed',
        error: `Failed to open Pull Request: HTTP ${createPrRes.status} (${await createPrRes.text()})`,
      }
    }

    const createdPrData = await createPrRes.json()

    return {
      status: 'pr_opened',
      prNumber: createdPrData.number,
    }
  } catch (err: unknown) {
    return {
      status: 'failed',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

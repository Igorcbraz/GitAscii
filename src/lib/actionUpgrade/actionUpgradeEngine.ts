import { MIGRATION_TEMPLATES } from '@/constants'
import { API_ENDPOINTS } from '@/services/endpoints'

export interface UpgradeCandidate {
  owner: string
  repo: string
  currentShaInDb?: string
}

export interface UpgradeResult {
  status: 'up_to_date' | 'pr_opened' | 'declined' | 'skipped' | 'failed'
  deployedSha?: string
  prNumber?: number
  error?: string
}

export async function checkAndUpgradeActionInRepo(
  candidate: UpgradeCandidate,
  targetActionSha: string,
  token: string
): Promise<UpgradeResult> {
  const { owner, repo } = candidate
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'GitAscii-UpgradeEngine',
  }

  try {
    const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(owner, repo), { headers })
    if (repoRes.status === 404) return { status: 'skipped', error: 'Repo not found' }
    if (!repoRes.ok) return { status: 'failed', error: `HTTP ${repoRes.status}` }

    const repoData = await repoRes.json()
    const defaultBranch = repoData.default_branch || 'main'

    const workflowRes = await fetch(
      `${API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, '.github/workflows/gitascii.yml')}?ref=${defaultBranch}`,
      { headers }
    )

    if (workflowRes.status === 404) {
      return { status: 'skipped', error: 'gitascii.yml not found' }
    }
    if (!workflowRes.ok) {
      return { status: 'failed', error: `HTTP ${workflowRes.status} reading workflow` }
    }

    const workflowData = await workflowRes.json()
    const content = Buffer.from(workflowData.content, 'base64').toString('utf8')

    const match = content.match(/uses:\s*Igorcbraz\/GitAscii\/action@([a-zA-Z0-9_-]+)/i)
    const currentDeployedSha = match ? match[1] : null

    if (currentDeployedSha === targetActionSha) {
      return { status: 'up_to_date', deployedSha: currentDeployedSha }
    }

    const upgradeBranchName = 'gitascii-action-upgrade'
    const prsRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_PULLS(owner, repo, `state=all&head=${owner}:${upgradeBranchName}`),
      { headers }
    )

    if (prsRes.ok) {
      const prs = await prsRes.json()
      if (Array.isArray(prs) && prs.length > 0) {
        const latestPr = prs[0]
        if (latestPr.state === 'open') {
          return {
            status: 'pr_opened',
            prNumber: latestPr.number,
            deployedSha: currentDeployedSha || undefined,
          }
        }
        if (!latestPr.merged_at) {
          return {
            status: 'declined',
            prNumber: latestPr.number,
            deployedSha: currentDeployedSha || undefined,
          }
        }
      }
    }

    const defaultBranchRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_BRANCHES(owner, repo, defaultBranch),
      { headers }
    )
    const defaultBranchData = await defaultBranchRes.json()
    const baseCommitSha = defaultBranchData.commit.sha

    await fetch(API_ENDPOINTS.GITHUB.GIT_REFS_HEADS(owner, repo, upgradeBranchName), {
      method: 'DELETE',
      headers,
    }).catch(() => {})

    const createRefRes = await fetch(API_ENDPOINTS.GITHUB.GIT_REFS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${upgradeBranchName}`,
        sha: baseCommitSha,
      }),
    })

    if (!createRefRes.ok) {
      return { status: 'failed', error: 'Failed to create upgrade branch' }
    }

    const updatedContent = content.replace(
      /uses:\s*Igorcbraz\/GitAscii\/action@[a-zA-Z0-9_-]+/gi,
      `uses: ${MIGRATION_TEMPLATES.WORKFLOW.ACTION_REPO}@${targetActionSha}`
    )

    const updateFileRes = await fetch(
      API_ENDPOINTS.GITHUB.REPO_CONTENTS(owner, repo, '.github/workflows/gitascii.yml'),
      {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: MIGRATION_TEMPLATES.ACTION_UPGRADE.COMMIT_MESSAGE(targetActionSha),
          content: Buffer.from(updatedContent, 'utf8').toString('base64'),
          branch: upgradeBranchName,
          sha: workflowData.sha,
        }),
      }
    )

    if (!updateFileRes.ok) {
      return { status: 'failed', error: 'Failed to commit updated workflow to upgrade branch' }
    }

    const createPrRes = await fetch(API_ENDPOINTS.GITHUB.REPO_PULLS(owner, repo), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: MIGRATION_TEMPLATES.ACTION_UPGRADE.TITLE(currentDeployedSha, targetActionSha),
        body: MIGRATION_TEMPLATES.ACTION_UPGRADE.BODY(targetActionSha),
        head: upgradeBranchName,
        base: defaultBranch,
      }),
    })

    if (!createPrRes.ok) {
      return { status: 'failed', error: 'Failed to open upgrade Pull Request' }
    }

    const prData = await createPrRes.json()
    return {
      status: 'pr_opened',
      prNumber: prData.number,
      deployedSha: targetActionSha,
    }
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) }
  }
}

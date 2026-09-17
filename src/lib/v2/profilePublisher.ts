import type { SavedConfiguration } from '@/engine/types'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { getInstallationTokenForUser } from '@/lib/githubApp'
import { bootstrapGitasciiBranch } from '@/lib/migration/branchBootstrap'
import { loadProfileConfig } from '@/lib/profileStorage'
import { API_ENDPOINTS } from '@/services/endpoints'

const headersFor = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'GitAscii-App',
})

async function requireToken(username: string): Promise<string> {
  const { token } = await getInstallationTokenForUser(username)
  if (!token) throw new Error('GitHub App installation is required to publish profile changes')
  return token
}

async function dispatchPublisher(username: string, token: string): Promise<void> {
  const headers = headersFor(token)
  const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(username, username), { headers })
  if (!repoRes.ok) throw new Error(`Unable to read GitHub profile repository (${repoRes.status})`)
  const repo = await repoRes.json()
  const res = await fetch(
    API_ENDPOINTS.GITHUB.WORKFLOW_DISPATCH(username, username, 'gitascii.yml'),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ ref: repo.default_branch || 'main' }),
    }
  )
  if (!res.ok) {
    console.warn(
      `[Publisher] Unable to dispatch GitAscii publisher (${res.status}) - ${await res.text()}`
    )
  }
}

export async function publishProfileConfigV2(
  username: string,
  config: SavedConfiguration
): Promise<void> {
  const token = await requireToken(username)
  const data = await fetchGitHubProfile(username, { fresh: true })
  const result = await bootstrapGitasciiBranch(username, username, token, config, data)
  if (!result.success) throw new Error(result.error || 'Unable to update gitascii branch')
  await dispatchPublisher(username, token)
}

async function deleteBranchFile(username: string, token: string, path: string): Promise<void> {
  const headers = headersFor(token)
  const endpoint = API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, username, path)
  const current = await fetch(`${endpoint}?ref=gitascii`, { headers })
  if (current.status === 404) return
  if (!current.ok) throw new Error(`Unable to inspect ${path} (${current.status})`)
  const data = await current.json()
  const removed = await fetch(endpoint, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({
      message: `Remove GitAscii profile ${path} [skip ci]`,
      sha: data.sha,
      branch: 'gitascii',
    }),
  })
  if (!removed.ok) throw new Error(`Unable to remove ${path} (${removed.status})`)
}

async function removeProfileEmbedFromReadme(
  username: string,
  token: string,
  slug: string
): Promise<void> {
  const headers = headersFor(token)
  const repoRes = await fetch(API_ENDPOINTS.GITHUB.REPO_INFO(username, username), { headers })
  if (!repoRes.ok) throw new Error(`Unable to read GitHub profile repository (${repoRes.status})`)
  const repo = await repoRes.json()
  const branch = repo.default_branch || 'main'
  const endpoint = API_ENDPOINTS.GITHUB.REPO_CONTENTS(username, username, 'README.md')
  const current = await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`, { headers })
  if (current.status === 404) return
  if (!current.ok) throw new Error(`Unable to inspect README.md (${current.status})`)

  const data = await current.json()
  const content = Buffer.from(data.content || '', 'base64').toString('utf8')
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const marker = new RegExp(
    `\\n?<!-- GITASCII:${escapedSlug}:START -->[\\s\\S]*?<!-- GITASCII:${escapedSlug}:END -->\\n?`,
    'g'
  )
  const updated =
    content
      .replace(marker, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  if (updated === content) return

  const saved = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Remove GitAscii profile ${slug} embed`,
      content: Buffer.from(updated, 'utf8').toString('base64'),
      sha: data.sha,
      branch,
    }),
  })
  if (!saved.ok) throw new Error(`Unable to remove ${slug} embed from README.md (${saved.status})`)
}

export async function deletePublishedProfileV2(username: string, slug: string): Promise<void> {
  const cleanSlug = slug.toLowerCase().trim()
  if (cleanSlug === 'default') throw new Error('The canonical default profile cannot be deleted')
  const token = await requireToken(username)
  for (const path of [
    `gitascii_${cleanSlug}.json`,
    `profiles/${cleanSlug}/dark.svg`,
    `profiles/${cleanSlug}/light.svg`,
  ]) {
    await deleteBranchFile(username, token, path)
  }
  await removeProfileEmbedFromReadme(username, token, cleanSlug)
  await dispatchPublisher(username, token)
}

export async function publishStoredProfileV2(username: string, slug: string): Promise<void> {
  const config = await loadProfileConfig(username, slug, { bypassMemory: true })
  if (!config) throw new Error(`Profile configuration "${slug}" was not found`)
  await publishProfileConfigV2(username, config)
}

export async function promoteProfileToDefaultV2(username: string, slug: string): Promise<void> {
  const targetConfig = await loadProfileConfig(username, slug, { bypassMemory: true })
  const oldDefaultConfig = await loadProfileConfig(username, 'default', { bypassMemory: true })

  if (!targetConfig) throw new Error(`Profile configuration "${slug}" was not found`)

  // Publish target's config to default
  await publishProfileConfigV2(username, {
    ...targetConfig,
    profileSlug: 'default',
    profileName: targetConfig.profileName || 'Default',
    metadata: {
      ...targetConfig.metadata,
      revision: `rev_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    },
  })

  // Publish old default's config to target as a backup
  if (oldDefaultConfig) {
    await publishProfileConfigV2(username, {
      ...oldDefaultConfig,
      profileSlug: slug,
      profileName: oldDefaultConfig.profileName || 'Backup',
      metadata: {
        ...oldDefaultConfig.metadata,
        revision: `rev_${Date.now()}_backup`,
        updatedAt: new Date().toISOString(),
      },
    })
  }
}

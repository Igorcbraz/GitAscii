import { createConfiguration } from '@/engine/core/TemplateRenderer'
import type { SavedConfiguration } from '@/engine/types'
import { fetchGitHubProfile } from '@/features/github/api/fetchProfile'
import { assertProfileWriteAllowed } from '@/features/pro/server/profileAccess'
import { getUserProfiles } from '@/features/pro/server/profileManagerStore'
import { sql } from '@/lib/db/client'
import { loadProfileConfig } from '@/lib/profileStorage'

import { type Actor, requireScope } from './config'
import { applyEditorOperations, type EditorOperation, validateLayout } from './editor'
import { AutomationError } from './errors'

export interface Draft {
  revision: number
  config: SavedConfiguration
  history: { past: SavedConfiguration[]; future: SavedConfiguration[] }
}

export async function readDraft(actor: Actor, slug: string): Promise<Draft> {
  requireScope(actor, 'profiles:read')
  const rows =
    await sql`SELECT revision, config, history FROM editor_cloud_drafts WHERE github_id = ${actor.githubId} AND slug = ${slug}`
  if (rows[0])
    return {
      revision: Number(rows[0].revision),
      config: {
        ...rows[0].config,
        username: actor.username,
        githubId: actor.githubId,
        profileSlug: slug,
      },
      history: rows[0].history,
    }
  const config = await loadProfileConfig(actor.username, slug)
  return {
    revision: 0,
    config: config
      ? { ...config, username: actor.username, githubId: actor.githubId, profileSlug: slug }
      : createConfiguration(actor.githubId, actor.username, 'blank', slug),
    history: { past: [], future: [] },
  }
}

export async function writeDraft(
  actor: Actor,
  slug: string,
  expectedRevision: number,
  change: { operations?: EditorOperation[]; layout?: unknown; history?: 'undo' | 'redo' }
) {
  requireScope(actor, 'profiles:write')
  if (
    slug !== 'default' &&
    !(await getUserProfiles(actor.username, { includeSyncStatus: false })).some(
      (p) => p.slug === slug
    )
  ) {
    throw new AutomationError(
      'PROFILE_NOT_FOUND',
      'Create the profile before editing its shared draft.',
      404
    )
  }
  await assertProfileWriteAllowed(actor.username, slug)
  const current = await readDraft(actor, slug)
  if (current.revision !== expectedRevision)
    throw new AutomationError(
      'REVISION_CONFLICT',
      'The shared draft changed. Reload it before saving.',
      409
    )
  let config: SavedConfiguration
  let history = { past: [...current.history.past], future: [...current.history.future] }
  if (change.history) {
    const source = change.history === 'undo' ? history.past : history.future
    const target = change.history === 'undo' ? history.future : history.past
    const previous = source.pop()
    if (!previous) throw new AutomationError('NO_HISTORY', `There is nothing to ${change.history}.`)
    target.push(current.config)
    config = previous
  } else {
    config = change.layout
      ? { ...current.config, ...validateLayout(change.layout) }
      : applyEditorOperations(
          current.config,
          await fetchGitHubProfile(actor.username),
          change.operations || []
        )
    history = { past: [...current.history.past, current.config].slice(-20), future: [] }
  }
  config = {
    ...config,
    username: actor.username,
    githubId: actor.githubId,
    profileSlug: slug,
    metadata: { ...config.metadata, updatedAt: new Date().toISOString() },
  }
  // CAS applies equally to browser and MCP; competing requests cannot silently overwrite.
  const rows =
    expectedRevision === 0
      ? await sql`INSERT INTO editor_cloud_drafts (github_id, slug, config, history)
        VALUES (${actor.githubId}, ${slug}, ${JSON.stringify(config)}::jsonb, ${JSON.stringify(history)}::jsonb)
        ON CONFLICT DO NOTHING RETURNING revision`
      : await sql`UPDATE editor_cloud_drafts SET config = ${JSON.stringify(config)}::jsonb, history = ${JSON.stringify(history)}::jsonb,
        revision = revision + 1, updated_at = NOW()
        WHERE github_id = ${actor.githubId} AND slug = ${slug} AND revision = ${expectedRevision} RETURNING revision`
  if (!rows.length)
    throw new AutomationError(
      'REVISION_CONFLICT',
      'The shared draft changed. Reload it before saving.',
      409
    )
  return {
    revision: Number(rows[0].revision),
    config,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}

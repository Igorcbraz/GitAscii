import { publishProfileRequest } from '@/features/github/server/publishProfile'
import { sql } from '@/lib/db/client'

import { type Actor, appOrigin, requireScope } from './config'
import { readDraft } from './drafts'
import { validateLayout } from './editor'
import { AutomationError } from './errors'
import { rateLimit } from './oauth'

// Persists the attempt before side effects. A repeated request returns its original result.
// An interrupted/partial attempt stays inspectable and is never automatically replayed.
export async function publishDraft(
  actor: Actor,
  slug: string,
  revision: number,
  requestId: string
) {
  requireScope(actor, 'profiles:publish')
  requireScope(actor, 'profiles:read')
  const existing =
    await sql`SELECT slug, revision, status, result FROM assistant_publications WHERE github_id = ${actor.githubId} AND request_id = ${requestId}::uuid`
  if (existing[0]) {
    if (existing[0].slug !== slug || Number(existing[0].revision) !== revision)
      throw new AutomationError(
        'IDEMPOTENCY_CONFLICT',
        'Use the original profile and revision for this publication request.',
        409
      )
    return { status: existing[0].status, result: existing[0].result, requestId }
  }
  const draft = await readDraft(actor, slug)
  if (!revision || draft.revision !== revision)
    throw new AutomationError(
      'REVISION_CONFLICT',
      'Read and review the current shared draft before publishing.',
      409
    )
  const { widgets, globalStyles, templateId } = draft.config
  validateLayout({ widgets, globalStyles, templateId })
  await rateLimit(`publish:${actor.githubId}`, 30, 3600)
  const inserted =
    await sql`INSERT INTO assistant_publications (github_id, request_id, slug, revision)
    VALUES (${actor.githubId}, ${requestId}::uuid, ${slug}, ${revision}) ON CONFLICT DO NOTHING RETURNING request_id`
  if (!inserted.length) {
    const repeated =
      await sql`SELECT slug, revision, status, result FROM assistant_publications WHERE github_id = ${actor.githubId} AND request_id = ${requestId}::uuid`
    if (repeated[0] && repeated[0].slug === slug && Number(repeated[0].revision) === revision)
      return { status: repeated[0].status, result: repeated[0].result, requestId }
    throw new AutomationError(
      'PUBLICATION_BUSY',
      'A publication is already in progress or this request ID was already used. Check its status before starting another attempt.',
      409
    )
  }
  try {
    const request = new Request(`${appOrigin()}/api/github/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exportData: draft.config }),
    })
    const response = await publishProfileRequest(request, {
      username: actor.username,
      githubId: actor.githubId,
    })
    const result = response.ok
      ? await response.json()
      : {
          code: 'PUBLICATION_FAILED',
          message:
            'Publication did not complete. Inspect the repository and continue in the browser before starting another attempt.',
        }
    const status = response.ok ? 'completed' : 'failed'
    await sql`UPDATE assistant_publications SET status = ${status}, result = ${JSON.stringify(result)}::jsonb WHERE github_id = ${actor.githubId} AND request_id = ${requestId}::uuid`
    return { status, result, requestId }
  } catch {
    // If persistence itself fails after a remote commit, keeping 'running' avoids claiming rollback.
    throw new AutomationError(
      'PUBLICATION_UNCERTAIN',
      'Check the GitHub repository and publication status before retrying. The request may have partially completed.',
      502
    )
  }
}

import { NextResponse } from 'next/server'

import {
  getMigrationCandidateBatch,
  updateMigrationStatus,
} from '@/lib/db/repositories/installationRepository'
import { getInstallationTokenById } from '@/lib/githubApp'
import { checkGitHubRateLimit, processCandidateMigration } from '@/lib/migration/migrationEngine'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.MIGRATION_CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '20', 10)
    const batchLimit = Math.min(Math.max(1, isNaN(limitParam) ? 20 : limitParam), 50)

    const candidates = await getMigrationCandidateBatch(batchLimit)

    if (candidates.length === 0) {
      return NextResponse.json({
        message: 'No pending migration candidates in queue.',
        processed: 0,
      })
    }

    const results = []

    for (const cand of candidates) {
      try {
        const { token } = await getInstallationTokenById(cand.installation_id)
        if (!token) {
          await updateMigrationStatus(
            cand.repository_owner,
            cand.repository_name,
            'permissions_missing',
            {
              lastError: 'Unable to mint installation access token',
              incrementAttempts: true,
            }
          )
          results.push({
            repo: `${cand.repository_owner}/${cand.repository_name}`,
            status: 'permissions_missing',
          })
          continue
        }

        const rateLimit = await checkGitHubRateLimit(token, 5)
        if (!rateLimit.canProceed) {
          console.warn(
            `[Migration Cron] Rate limit low (${rateLimit.remaining}/${rateLimit.limit}). Pausing campaign loop.`
          )
          break
        }

        const outcome = await processCandidateMigration(
          {
            installationId: cand.installation_id,
            owner: cand.repository_owner,
            repo: cand.repository_name,
            userId: cand.user_id || undefined,
            attempts: cand.attempts,
          },
          token
        )

        await updateMigrationStatus(cand.repository_owner, cand.repository_name, outcome.status, {
          prNumber: outcome.prNumber,
          lastError: outcome.error,
          incrementAttempts: outcome.status === 'failed',
        })

        results.push({
          repo: `${cand.repository_owner}/${cand.repository_name}`,
          outcome,
        })
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        await updateMigrationStatus(cand.repository_owner, cand.repository_name, 'failed', {
          lastError: errorMsg,
          incrementAttempts: true,
        })
        results.push({
          repo: `${cand.repository_owner}/${cand.repository_name}`,
          status: 'failed',
          error: errorMsg,
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

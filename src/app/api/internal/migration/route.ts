import { NextResponse } from 'next/server'

import { getProEntitlements } from '@/features/pro/server/entitlements'
import {
  getMigrationCandidateBatch,
  updateMigrationStatus,
} from '@/lib/db/repositories/installationRepository'
import { getInstallationTokenById } from '@/lib/githubApp'
import { checkGitHubRateLimit, processCandidateMigration } from '@/lib/migration/migrationEngine'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT_STR = '20'
const DEFAULT_BATCH_LIMIT = 20
const MIN_BATCH_LIMIT = 1
const MAX_BATCH_LIMIT = 50
const MIN_RATE_LIMIT_REMAINING = 5
const DECIMAL_RADIX = 10

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.MIGRATION_CRON_SECRET

    if (!cronSecret) {
      console.error('[Migration Cron] CRON_SECRET or MIGRATION_CRON_SECRET is not configured.')
      return NextResponse.json({ error: 'Migration endpoint is not configured' }, { status: 503 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || DEFAULT_LIMIT_STR, DECIMAL_RADIX)
    const batchLimit = Math.min(
      Math.max(MIN_BATCH_LIMIT, isNaN(limitParam) ? DEFAULT_BATCH_LIMIT : limitParam),
      MAX_BATCH_LIMIT
    )

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

        const rateLimit = await checkGitHubRateLimit(token, MIN_RATE_LIMIT_REMAINING)
        if (!rateLimit.canProceed) {
          console.warn(
            `[Migration Cron] Rate limit low (${rateLimit.remaining}/${rateLimit.limit}). Pausing campaign loop.`
          )
          break
        }

        const entitlements = await getProEntitlements(cand.repository_owner).catch((error) => {
          console.error('[Migration] Failed to fetch Pro entitlements:', error)
          return null
        })
        const isPro = Boolean(entitlements?.tier && entitlements.tier !== 'free')

        const outcome = await processCandidateMigration(
          {
            installationId: cand.installation_id,
            owner: cand.repository_owner,
            repo: cand.repository_name,
            userId: cand.user_id || undefined,
            attempts: cand.attempts,
          },
          token,
          { isPro }
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

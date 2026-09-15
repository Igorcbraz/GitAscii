import { sql } from '../client'

export interface MigrationInstallationRow {
  id: string
  user_id: string | null
  installation_id: string
  repository_owner: string
  repository_name: string
  migration_status: string
  migration_version: number
  pr_number: number | null
  deployed_action_sha: string | null
  attempts: number
  last_error: string | null
  last_attempt_at: Date | null
  created_at: Date
  updated_at: Date
}

export async function upsertMigrationInstallation(data: {
  userId?: number | string | null
  installationId: number | string
  repositoryOwner: string
  repositoryName: string
  migrationStatus?: string
  migrationVersion?: number
  prNumber?: number | null
  deployedActionSha?: string | null
  attempts?: number
  lastError?: string | null
}): Promise<MigrationInstallationRow> {
  const owner = data.repositoryOwner.toLowerCase().trim()
  const repo = data.repositoryName.toLowerCase().trim()
  const instId = BigInt(data.installationId)
  const userIdBigInt = data.userId ? BigInt(data.userId) : null
  const status = data.migrationStatus || 'pending'
  const version = data.migrationVersion || 1
  const attempts = data.attempts ?? 0

  const rows = await sql`
    INSERT INTO migration_installations (
      user_id,
      installation_id,
      repository_owner,
      repository_name,
      migration_status,
      migration_version,
      pr_number,
      deployed_action_sha,
      attempts,
      last_error,
      last_attempt_at,
      updated_at
    )
    VALUES (
      ${userIdBigInt},
      ${instId},
      ${owner},
      ${repo},
      ${status},
      ${version},
      ${data.prNumber ?? null},
      ${data.deployedActionSha ?? null},
      ${attempts},
      ${data.lastError ?? null},
      NOW(),
      NOW()
    )
    ON CONFLICT (repository_owner, repository_name) DO UPDATE
    SET
      user_id = COALESCE(EXCLUDED.user_id, migration_installations.user_id),
      installation_id = EXCLUDED.installation_id,
      migration_status = EXCLUDED.migration_status,
      migration_version = EXCLUDED.migration_version,
      pr_number = COALESCE(EXCLUDED.pr_number, migration_installations.pr_number),
      deployed_action_sha = COALESCE(EXCLUDED.deployed_action_sha, migration_installations.deployed_action_sha),
      attempts = EXCLUDED.attempts,
      last_error = EXCLUDED.last_error,
      last_attempt_at = NOW(),
      updated_at = NOW()
    RETURNING *;
  `
  return rows[0] as unknown as MigrationInstallationRow
}

export async function getMigrationCandidateBatch(limit = 20): Promise<MigrationInstallationRow[]> {
  const rows = await sql`
    SELECT *
    FROM migration_installations
    WHERE migration_status IN ('pending', 'failed', 'permissions_missing')
      AND attempts < 5
    ORDER BY last_attempt_at ASC NULLS FIRST, created_at ASC
    LIMIT ${limit};
  `
  return rows as unknown as MigrationInstallationRow[]
}

export async function updateMigrationStatus(
  owner: string,
  repo: string,
  status: string,
  details?: {
    prNumber?: number | null
    lastError?: string | null
    deployedActionSha?: string | null
    incrementAttempts?: boolean
  }
): Promise<void> {
  const cleanOwner = owner.toLowerCase().trim()
  const cleanRepo = repo.toLowerCase().trim()

  if (details?.incrementAttempts) {
    await sql`
      UPDATE migration_installations
      SET
        migration_status = ${status},
        pr_number = COALESCE(${details.prNumber ?? null}, pr_number),
        last_error = ${details.lastError ?? null},
        deployed_action_sha = COALESCE(${details.deployedActionSha ?? null}, deployed_action_sha),
        attempts = attempts + 1,
        last_attempt_at = NOW(),
        updated_at = NOW()
      WHERE repository_owner = ${cleanOwner} AND repository_name = ${cleanRepo};
    `
  } else {
    await sql`
      UPDATE migration_installations
      SET
        migration_status = ${status},
        pr_number = COALESCE(${details?.prNumber ?? null}, pr_number),
        last_error = ${details?.lastError ?? null},
        deployed_action_sha = COALESCE(${details?.deployedActionSha ?? null}, deployed_action_sha),
        last_attempt_at = NOW(),
        updated_at = NOW()
      WHERE repository_owner = ${cleanOwner} AND repository_name = ${cleanRepo};
    `
  }
}

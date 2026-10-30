import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const { hasDbConfig, getDbUrl, sql } = await import('../src/lib/db/client')
const { MIGRATIONS, runMigrations } = await import('../src/lib/db/migrations')

if (!hasDbConfig()) throw new Error('Configure DATABASE_URL for the intended environment.')
console.log(`Database host: ${new URL(getDbUrl()).hostname}`)
const [table] = await sql`SELECT to_regclass('public.schema_migrations') AS name`
const applied = table.name ? await sql`SELECT version FROM schema_migrations` : []
const versions = new Set(applied.map((row) => String(row.version)))
const pending = MIGRATIONS.filter((migration) => !versions.has(migration.version))
console.log(
  'Pending migrations:',
  pending.map((migration) => migration.version)
)

if (process.argv.includes('--apply')) {
  console.log(await runMigrations())
} else {
  console.log('Read-only preview. Pass --apply to apply these migrations to this database.')
}

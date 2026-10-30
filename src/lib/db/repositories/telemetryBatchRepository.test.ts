import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ sql: vi.fn() }))
vi.mock('../client', () => ({ sql: mocks.sql }))

import type { TelemetryBatch } from '@/features/pro/server/telemetryQueue'

import { persistTelemetryBatch, telemetryBatchMigration } from './telemetryBatchRepository'

let db: PGlite
beforeAll(async () => {
  db = new PGlite()
  mocks.sql.mockImplementation(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.reduce((text, part, i) => text + (i ? `$${i}` : '') + part, '')
    return (await db.query(query, values)).rows
  })
  await db.exec(`
    CREATE TABLE users(id bigint PRIMARY KEY, username text UNIQUE);
    CREATE TABLE user_entitlements(user_id bigint PRIMARY KEY, plan_tier text, updated_at timestamptz);
    CREATE TABLE profiles(user_id bigint, slug text, total_views bigint DEFAULT 0, updated_at timestamptz, PRIMARY KEY(user_id, slug));
    CREATE TABLE user_analytics_totals(user_id bigint PRIMARY KEY, views bigint, uniques bigint, updated_at timestamptz);
    CREATE TABLE profile_daily_analytics(user_id bigint, slug text, date_str text, views bigint, uniques bigint, updated_at timestamptz, PRIMARY KEY(user_id,slug,date_str));
    CREATE TABLE profile_daily_dimensions(user_id bigint, slug text, date_str text, dimension text, dimension_key text, count bigint, updated_at timestamptz, PRIMARY KEY(user_id,slug,date_str,dimension,dimension_key));
    INSERT INTO users VALUES(1,'alice'),(2,'free'),(3,'newpro');
    INSERT INTO profiles(user_id,slug) VALUES(1,'default');
    INSERT INTO user_entitlements VALUES(1,'pro','2026-01-01'),(2,'free','2026-01-01'),(3,'pro','2026-11-01');
  `)
  await telemetryBatchMigration.up()
}, 120000)
beforeEach(async () => {
  vi.stubEnv('PRO_USERNAMES', '')
  vi.stubEnv('PRO_ADMIN_USERS', '')
  await db.exec(
    'TRUNCATE telemetry_batch_receipts, user_analytics_totals, profile_daily_analytics, profile_daily_dimensions; UPDATE profiles SET total_views=0;'
  )
})
afterAll(async () => {
  await db.close()
  vi.unstubAllEnvs()
})
const batch = (): TelemetryBatch => ({
  id: '11111111-1111-4111-8111-111111111111',
  events: ['alice', 'alice', 'free', 'newpro', 'unknown'].map((username) => ({
    username,
    slug: 'default',
    timestamp: '2026-10-29T23:00:00Z',
    source: 'GitHub',
    trafficType: 'camo',
    status: '200',
  })),
})

it('aggregates only eligible Pro events and replays without double-counting any dimension', async () => {
  await persistTelemetryBatch(batch())
  await persistTelemetryBatch(batch())
  expect((await db.query('SELECT views, uniques FROM user_analytics_totals')).rows).toEqual([
    { views: 2, uniques: 0 },
  ])
  expect((await db.query('SELECT total_views FROM profiles')).rows).toEqual([{ total_views: 2 }])
  expect((await db.query('SELECT views FROM profile_daily_analytics')).rows).toEqual([{ views: 2 }])
  const dimensions = (
    await db.query<{ count: number }>('SELECT count FROM profile_daily_dimensions')
  ).rows
  expect(dimensions).toHaveLength(5)
  expect(dimensions.every((row) => row.count === 2)).toBe(true)
})
it('rolls back receipt and all counters on SQL failure, then recovers', async () => {
  await db.exec('ALTER TABLE profile_daily_dimensions ADD CONSTRAINT reject_test CHECK(count < 2)')
  await expect(persistTelemetryBatch(batch())).rejects.toThrow()
  expect((await db.query('SELECT * FROM telemetry_batch_receipts')).rows).toHaveLength(0)
  expect((await db.query('SELECT * FROM user_analytics_totals')).rows).toHaveLength(0)
  await db.exec('ALTER TABLE profile_daily_dimensions DROP CONSTRAINT reject_test')
  await persistTelemetryBatch(batch())
  expect((await db.query('SELECT views FROM user_analytics_totals')).rows).toEqual([{ views: 2 }])
})
it('concurrent duplicate batches commit once', async () => {
  await Promise.all([persistTelemetryBatch(batch()), persistTelemetryBatch(batch())])
  expect((await db.query('SELECT views FROM user_analytics_totals')).rows).toEqual([{ views: 2 }])
})

it.each(['team', 'enterprise'])('preserves analytics for the %s paid tier', async (tier) => {
  await db.query('UPDATE user_entitlements SET plan_tier=$1 WHERE user_id=1', [tier])
  try {
    await persistTelemetryBatch(batch())
    expect((await db.query('SELECT views FROM user_analytics_totals')).rows).toEqual([{ views: 2 }])
  } finally {
    await db.exec("UPDATE user_entitlements SET plan_tier='pro' WHERE user_id=1")
  }
})

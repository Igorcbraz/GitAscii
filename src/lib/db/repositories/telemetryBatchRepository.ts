import type { TelemetryBatch } from '@/features/pro/server/telemetryQueue'

import { sql } from '../client'

export const telemetryBatchMigration = {
  version: '013_telemetry_batch_receipts',
  name: 'Idempotent telemetry batches',
  async up() {
    await sql`CREATE TABLE IF NOT EXISTS telemetry_batch_receipts (
      id UUID PRIMARY KEY, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  },
}

export async function persistTelemetryBatch(batch: TelemetryBatch): Promise<void> {
  const envPro = (process.env.PRO_USERNAMES || process.env.PRO_ADMIN_USERS || '')
    .split(',')
    .map((value) => value.toLowerCase().trim())
    .filter(Boolean)
  // One atomic statement: the receipt and every aggregate either commit together
  // or roll back together. A repeated receipt cannot increment any counter again.
  await sql`
    WITH receipt AS (
      INSERT INTO telemetry_batch_receipts(id) VALUES (${batch.id}::uuid)
      ON CONFLICT DO NOTHING RETURNING id
    ), incoming AS (
      SELECT e.* FROM jsonb_to_recordset(${JSON.stringify(batch.events)}::jsonb)
        AS e(username text, slug text, timestamp timestamptz, source text, "trafficType" text, status text)
      WHERE EXISTS (SELECT 1 FROM receipt)
    ), eligible AS (
      SELECT u.id AS user_id, i.*,
        to_char(i.timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date_str,
        extract(hour FROM i.timestamp AT TIME ZONE 'UTC')::int::text AS hour,
        extract(dow FROM i.timestamp AT TIME ZONE 'UTC')::int::text AS weekday
      FROM incoming i JOIN users u ON u.username = i.username
      LEFT JOIN user_entitlements e ON e.user_id = u.id
      WHERE (e.plan_tier IN ('pro', 'team', 'enterprise') AND e.updated_at <= i.timestamp)
        OR i.username = ANY(${envPro}::text[])
    ), totals AS (
      INSERT INTO user_analytics_totals(user_id, views, uniques, updated_at)
      SELECT user_id, count(*), 0, NOW() FROM eligible GROUP BY user_id
      ON CONFLICT(user_id) DO UPDATE SET views = user_analytics_totals.views + EXCLUDED.views, updated_at = NOW()
    ), profile_totals AS (
      UPDATE profiles p SET total_views = p.total_views + e.views, updated_at = NOW()
      FROM (SELECT user_id, slug, count(*) AS views FROM eligible GROUP BY user_id, slug) e
      WHERE p.user_id = e.user_id AND p.slug = e.slug
    ), daily AS (
      INSERT INTO profile_daily_analytics(user_id, slug, date_str, views, uniques, updated_at)
      SELECT user_id, slug, date_str, count(*), 0, NOW() FROM eligible GROUP BY user_id, slug, date_str
      ON CONFLICT(user_id, slug, date_str) DO UPDATE SET views = profile_daily_analytics.views + EXCLUDED.views, updated_at = NOW()
    ), dimensions AS (
      SELECT user_id, slug, date_str, d.dimension, d.dimension_key
      FROM eligible CROSS JOIN LATERAL (VALUES
        ('sources', source), ('traffic_types', "trafficType"), ('status_codes', status),
        ('hours', hour), ('weekday_hours', weekday || ':' || hour)
      ) d(dimension, dimension_key)
    )
    INSERT INTO profile_daily_dimensions(user_id, slug, date_str, dimension, dimension_key, count, updated_at)
    SELECT user_id, slug, date_str, dimension, dimension_key, count(*), NOW() FROM dimensions
    GROUP BY user_id, slug, date_str, dimension, dimension_key
    ON CONFLICT(user_id, slug, date_str, dimension, dimension_key) DO UPDATE SET
      count = profile_daily_dimensions.count + EXCLUDED.count, updated_at = NOW()
  `
}

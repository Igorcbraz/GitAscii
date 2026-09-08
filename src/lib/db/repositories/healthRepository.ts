import type { WidgetErrorRecord } from '@/features/pro/types/errors'

import { hasDbConfig, sql } from '../client'
import { ensureUser } from './userRepository'

export async function recordWidgetErrorInDb(
  username: string,
  record: WidgetErrorRecord
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO widget_errors (
      id,
      user_id,
      widget_id,
      widget_name,
      profile_slug,
      error_type,
      message,
      details,
      status,
      occurrences,
      first_seen_at,
      last_seen_at,
      resolved_at
    ) VALUES (
      ${record.id},
      ${user.id},
      ${record.widgetId},
      ${record.widgetName},
      ${record.profileSlug || 'default'},
      ${record.errorType},
      ${record.message},
      ${record.details || null},
      ${record.status},
      ${record.occurrences || 1},
      ${new Date(record.firstSeenAt)},
      ${new Date(record.lastSeenAt)},
      ${record.resolvedAt ? new Date(record.resolvedAt) : null}
    )
    ON CONFLICT (user_id, profile_slug, widget_id) DO UPDATE SET
      occurrences = widget_errors.occurrences + 1,
      last_seen_at = EXCLUDED.last_seen_at,
      message = EXCLUDED.message,
      details = COALESCE(EXCLUDED.details, widget_errors.details),
      status = 'active',
      resolved_at = NULL;
  `
}

export async function getWidgetErrorsFromDb(
  username: string,
  limit: number = 50
): Promise<WidgetErrorRecord[]> {
  if (!hasDbConfig()) return []
  const u = username.toLowerCase().trim()

  const rows = await sql`
    SELECT
      w.id,
      w.widget_id,
      w.widget_name,
      w.profile_slug,
      w.error_type,
      w.message,
      w.details,
      w.status,
      w.occurrences,
      w.first_seen_at,
      w.last_seen_at,
      w.resolved_at
    FROM widget_errors w
    JOIN users u ON u.id = w.user_id
    WHERE u.username = ${u}
    ORDER BY w.last_seen_at DESC
    LIMIT ${limit};
  `

  return rows.map((r: any) => ({
    id: r.id,
    widgetId: r.widget_id,
    widgetName: r.widget_name,
    profileSlug: r.profile_slug || 'default',
    errorType: r.error_type,
    message: r.message,
    details: r.details || undefined,
    status: r.status as any,
    occurrences: Number(r.occurrences || 1),
    firstSeenAt: new Date(r.first_seen_at).toISOString(),
    lastSeenAt: new Date(r.last_seen_at).toISOString(),
    resolvedAt: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
  }))
}

export async function resolveWidgetErrorInDb(username: string, errorId: string): Promise<boolean> {
  if (!hasDbConfig()) return true
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  const res = await sql`
    UPDATE widget_errors
    SET status = 'resolved', resolved_at = NOW()
    WHERE user_id = ${user.id} AND id = ${errorId}
    RETURNING id;
  `
  return res.length > 0
}

export async function deleteWidgetErrorsInDb(username: string, errorIds: string[]): Promise<void> {
  if (!hasDbConfig() || errorIds.length === 0) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  for (const errorId of errorIds) {
    await sql`
      DELETE FROM widget_errors
      WHERE user_id = ${user.id} AND id = ${errorId};
    `
  }
}

export async function clearAllWidgetErrorsInDb(username: string): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    DELETE FROM widget_errors
    WHERE user_id = ${user.id};
  `
}

export async function recordProfileDailyHealthInDb(
  username: string,
  slug: string,
  dateStr: string,
  isSuccess: boolean,
  durationMs: number
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO profile_daily_health (
      user_id,
      slug,
      date_str,
      renders,
      successes,
      failures,
      duration_ms,
      duration_count,
      updated_at
    ) VALUES (
      ${user.id},
      ${slug},
      ${dateStr},
      1,
      ${isSuccess ? 1 : 0},
      ${isSuccess ? 0 : 1},
      ${durationMs},
      1,
      NOW()
    )
    ON CONFLICT (user_id, slug, date_str) DO UPDATE SET
      renders = profile_daily_health.renders + 1,
      successes = profile_daily_health.successes + ${isSuccess ? 1 : 0},
      failures = profile_daily_health.failures + ${isSuccess ? 0 : 1},
      duration_ms = profile_daily_health.duration_ms + ${durationMs},
      duration_count = profile_daily_health.duration_count + 1,
      updated_at = NOW();
  `
}

export async function recordWidgetDailyHealthInDb(
  username: string,
  widgetId: string,
  dateStr: string,
  isSuccess: boolean,
  durationMs: number
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO widget_daily_health (
      user_id,
      widget_id,
      date_str,
      renders,
      successes,
      failures,
      duration_ms,
      duration_count,
      updated_at
    ) VALUES (
      ${user.id},
      ${widgetId},
      ${dateStr},
      1,
      ${isSuccess ? 1 : 0},
      ${isSuccess ? 0 : 1},
      ${durationMs},
      1,
      NOW()
    )
    ON CONFLICT (user_id, widget_id, date_str) DO UPDATE SET
      renders = widget_daily_health.renders + 1,
      successes = widget_daily_health.successes + ${isSuccess ? 1 : 0},
      failures = widget_daily_health.failures + ${isSuccess ? 0 : 1},
      duration_ms = widget_daily_health.duration_ms + ${durationMs},
      duration_count = widget_daily_health.duration_count + 1,
      updated_at = NOW();
  `
}

export async function getProfileDailyHealthFromDb(
  username: string,
  slug: string,
  dateStr: string
): Promise<{
  renders: number
  successes: number
  failures: number
  durationMs: number
  durationCount: number
} | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()

  const rows = await sql`
    SELECT renders, successes, failures, duration_ms, duration_count
    FROM profile_daily_health h
    JOIN users u ON u.id = h.user_id
    WHERE u.username = ${u} AND h.slug = ${slug} AND h.date_str = ${dateStr}
    LIMIT 1;
  `
  if (rows.length === 0) return null
  const r = rows[0]
  return {
    renders: Number(r.renders || 0),
    successes: Number(r.successes || 0),
    failures: Number(r.failures || 0),
    durationMs: Number(r.duration_ms || 0),
    durationCount: Number(r.duration_count || 0),
  }
}

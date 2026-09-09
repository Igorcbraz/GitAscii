import { hasDbConfig, sql } from '../client'
import { ensureUser } from './userRepository'

export async function getUserAnalyticsTotalsFromDb(
  username: string
): Promise<{ views: number; uniques: number } | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()

  const rows = await sql`
    SELECT t.views, t.uniques
    FROM user_analytics_totals t
    JOIN users u ON u.id = t.user_id
    WHERE u.username = ${u}
    LIMIT 1;
  `
  if (rows.length === 0) return null
  return {
    views: Number(rows[0].views || 0),
    uniques: Number(rows[0].uniques || 0),
  }
}

export interface AnalyticsBatchFlushItem {
  slug: string
  dateStr: string
  views: number
  uniques: number
}

export interface AnalyticsBatchFlushPayload {
  totalViews?: number
  totalUniques?: number
  daily?: AnalyticsBatchFlushItem[]
  profileViews?: Array<{ slug: string; views: number }>
}

export async function flushAnalyticsBatchToDb(
  username: string,
  payload: AnalyticsBatchFlushPayload
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  if (payload.totalViews !== undefined || payload.totalUniques !== undefined) {
    const totalViews = Math.max(0, payload.totalViews ?? 0)
    const totalUniques = Math.max(0, payload.totalUniques ?? 0)
    await sql`
      INSERT INTO user_analytics_totals (user_id, views, uniques, updated_at)
      VALUES (${user.id}, ${totalViews}, ${totalUniques}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        views = CASE WHEN ${payload.totalViews !== undefined} THEN GREATEST(user_analytics_totals.views, EXCLUDED.views) ELSE user_analytics_totals.views END,
        uniques = CASE WHEN ${payload.totalUniques !== undefined} THEN GREATEST(user_analytics_totals.uniques, EXCLUDED.uniques) ELSE user_analytics_totals.uniques END,
        updated_at = NOW();
    `
  }

  if (payload.profileViews && payload.profileViews.length > 0) {
    for (const pv of payload.profileViews) {
      const slug = (pv.slug || 'default').toLowerCase().trim()
      const views = Math.max(0, pv.views)
      await sql`
        UPDATE profiles
        SET total_views = GREATEST(profiles.total_views, ${views}), updated_at = NOW()
        WHERE user_id = ${user.id} AND slug = ${slug};
      `
    }
  }

  if (payload.daily && payload.daily.length > 0) {
    for (const item of payload.daily) {
      const slug = (item.slug || 'default').toLowerCase().trim()
      const views = Math.max(0, item.views)
      const uniques = Math.max(0, item.uniques)
      await sql`
        INSERT INTO profile_daily_analytics (user_id, slug, date_str, views, uniques, updated_at)
        VALUES (${user.id}, ${slug}, ${item.dateStr}, ${views}, ${uniques}, NOW())
        ON CONFLICT (user_id, slug, date_str) DO UPDATE SET
          views = GREATEST(profile_daily_analytics.views, EXCLUDED.views),
          uniques = GREATEST(profile_daily_analytics.uniques, EXCLUDED.uniques),
          updated_at = NOW();
      `
    }
  }
}

export async function recordViewInDb(
  username: string,
  slug: string,
  dateStr: string,
  isUnique: boolean
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const cleanSlug = (slug || 'default').toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO user_analytics_totals (user_id, views, uniques, updated_at)
    VALUES (${user.id}, 1, ${isUnique ? 1 : 0}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      views = user_analytics_totals.views + 1,
      uniques = user_analytics_totals.uniques + ${isUnique ? 1 : 0},
      updated_at = NOW();
  `

  await sql`
    UPDATE profiles
    SET total_views = total_views + 1, updated_at = NOW()
    WHERE user_id = ${user.id} AND slug = ${cleanSlug};
  `

  await sql`
    INSERT INTO profile_daily_analytics (user_id, slug, date_str, views, uniques, updated_at)
    VALUES (${user.id}, ${cleanSlug}, ${dateStr}, 1, ${isUnique ? 1 : 0}, NOW())
    ON CONFLICT (user_id, slug, date_str) DO UPDATE SET
      views = profile_daily_analytics.views + 1,
      uniques = profile_daily_analytics.uniques + ${isUnique ? 1 : 0},
      updated_at = NOW();
  `
}

export async function getDailyAnalyticsFromDb(
  username: string,
  slug: string,
  dateStr: string
): Promise<{ views: number; uniques: number } | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()
  const cleanSlug = (slug || 'default').toLowerCase().trim()

  const rows = await sql`
    SELECT a.views, a.uniques
    FROM profile_daily_analytics a
    JOIN users u ON u.id = a.user_id
    WHERE u.username = ${u} AND a.slug = ${cleanSlug} AND a.date_str = ${dateStr}
    LIMIT 1;
  `
  if (rows.length === 0) return null
  return {
    views: Number(rows[0].views || 0),
    uniques: Number(rows[0].uniques || 0),
  }
}

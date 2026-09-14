import { neon } from '@neondatabase/serverless'

import type { PublicationSource } from '../types'

export async function loadPublicationSources(
  after: string,
  limit: number,
  username = ''
): Promise<PublicationSource[]> {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is required for SVG publication')
  const sql = neon(databaseUrl)
  const rows = await sql`
    SELECT u.username,
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'slug', c.slug, 'config', c.config, 'isDefault', COALESCE(p.is_default, c.slug = 'default')
        ) ORDER BY c.slug)
        FROM profile_configurations c
        LEFT JOIN profiles p ON p.user_id = c.user_id AND p.slug = c.slug
        WHERE c.user_id = u.id
      ), '[{"slug":"default","isDefault":true,"config":null}]'::jsonb) AS profiles,
      jsonb_build_object(
        'enabled', COALESCE(d.enabled, false),
        'fallbackProfileSlug', COALESCE(d.fallback_profile_slug, 'default'),
        'defaultTimezone', COALESCE(d.default_timezone, 'UTC'),
        'rules', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', r.id, 'name', r.name, 'targetProfileSlug', r.target_profile_slug,
            'priority', r.priority, 'enabled', r.enabled, 'type', r.type,
            'daysOfWeek', r.days_of_week, 'startTime', r.start_time, 'endTime', r.end_time,
            'timezone', r.timezone, 'startDate', r.start_date, 'endDate', r.end_date,
            'eventName', r.event_name, 'expiresAt', r.expires_at, 'description', r.description,
            'createdAt', r.created_at, 'updatedAt', r.updated_at
          ) ORDER BY r.priority DESC, r.updated_at DESC)
          FROM dynamic_rules r WHERE r.user_id = u.id
        ), '[]'::jsonb)
      ) AS rules
    FROM users u
    LEFT JOIN dynamic_rules_configs d ON d.user_id = u.id
    WHERE u.username > ${after} AND (${username} = '' OR u.username = ${username})
    ORDER BY u.username
    LIMIT ${limit};
  `
  return rows as PublicationSource[]
}

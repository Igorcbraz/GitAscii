import type { SavedConfiguration } from '@/engine/types'
import type { ProfileVersionRecord, ProProfileRecord } from '@/features/pro/types/profiles'

import { hasDbConfig, sql } from '../client'
import { ensureUser } from './userRepository'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gitascii.com'

export async function saveProfileConfigInDb(
  username: string,
  slug: string,
  config: SavedConfiguration,
  options?: { updatedAt?: Date | string }
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const cleanSlug = (slug || 'default').toLowerCase().trim()
  const user = await ensureUser(u)
  const incomingDate = options?.updatedAt
    ? new Date(options.updatedAt)
    : config.metadata?.updatedAt
      ? new Date(config.metadata.updatedAt)
      : new Date()

  await sql`
    INSERT INTO profile_configurations (user_id, slug, config, version, updated_at)
    VALUES (${user.id}, ${cleanSlug}, ${JSON.stringify(config)}::jsonb, 1, ${incomingDate})
    ON CONFLICT (user_id, slug) DO UPDATE
    SET config = EXCLUDED.config, version = profile_configurations.version + 1, updated_at = EXCLUDED.updated_at
    WHERE profile_configurations.updated_at <= EXCLUDED.updated_at;
  `
}

export async function getProfileConfigFromDb(
  username: string,
  slug: string
): Promise<SavedConfiguration | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()
  const cleanSlug = (slug || 'default').toLowerCase().trim()

  const rows = await sql`
    SELECT c.config
    FROM profile_configurations c
    JOIN users u ON u.id = c.user_id
    WHERE u.username = ${u} AND c.slug = ${cleanSlug}
    LIMIT 1;
  `

  if (rows.length === 0) return null
  const config = rows[0].config
  return typeof config === 'string' ? JSON.parse(config) : config
}

export async function getUserProfilesFromDb(username: string): Promise<ProProfileRecord[]> {
  if (!hasDbConfig()) return []
  const u = username.toLowerCase().trim()

  const rows = await sql`
    SELECT
      p.id,
      p.slug,
      p.name,
      p.description,
      p.status,
      p.is_default,
      p.widgets_count,
      p.total_views,
      p.version,
      p.health_status,
      p.render_success_rate,
      p.last_render_duration_ms,
      p.last_rendered_at,
      p.created_at,
      p.updated_at,
      (SELECT COUNT(*) FROM profile_versions pv WHERE pv.user_id = p.user_id AND pv.slug = p.slug) as version_count
    FROM profiles p
    JOIN users u ON u.id = p.user_id
    WHERE u.username = ${u}
    ORDER BY p.is_default DESC, p.created_at ASC;
  `

  if (rows.length === 0) return []

  return rows.map((r: any) => {
    const slug = r.slug
    const publicUrl = slug === 'default' ? `${APP_URL}/${u}` : `${APP_URL}/${u}/${slug}`
    const rawSvgUrl = slug === 'default' ? `${APP_URL}/${u}.svg` : `${APP_URL}/${u}/${slug}.svg`

    return {
      id: String(r.id),
      slug,
      name: r.name,
      description: r.description || '',
      status: (r.status as any) || 'active',
      isDefault: Boolean(r.is_default),
      widgetsCount: Number(r.widgets_count || 1),
      totalViews: Number(r.total_views || 0),
      versionCount: Number(r.version || 1),
      healthStatus: (r.health_status as any) || 'operational',
      renderSuccessRate: Number(r.render_success_rate || 100),
      lastRenderDurationMs: r.last_render_duration_ms
        ? Number(r.last_render_duration_ms)
        : undefined,
      lastRenderedAt: r.last_rendered_at ? new Date(r.last_rendered_at).toISOString() : undefined,
      createdAt: new Date(r.created_at).toISOString(),
      lastUpdated: new Date(r.updated_at).toISOString(),
      publicUrl,
      rawSvgUrl,
    }
  })
}

export async function createProfileInDb(
  username: string,
  record: ProProfileRecord,
  config?: SavedConfiguration
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)
  const cleanSlug = record.slug.toLowerCase().trim()
  const profileId = `prof_${user.id}_${cleanSlug}`

  await sql`
    INSERT INTO profiles (
      id,
      user_id,
      slug,
      name,
      description,
      status,
      is_default,
      widgets_count,
      total_views,
      health_status,
      render_success_rate,
      last_render_duration_ms,
      last_rendered_at,
      version,
      created_at,
      updated_at
    ) VALUES (
      ${profileId},
      ${user.id},
      ${cleanSlug},
      ${record.name},
      ${record.description || ''},
      ${record.status || 'active'},
      ${record.isDefault},
      ${record.widgetsCount || 1},
      ${record.totalViews || 0},
      ${record.healthStatus || 'operational'},
      ${record.renderSuccessRate || 100},
      ${record.lastRenderDurationMs || null},
      ${record.lastRenderedAt ? new Date(record.lastRenderedAt) : null},
      1,
      ${new Date(record.createdAt)},
      ${new Date(record.lastUpdated)}
    )
    ON CONFLICT (user_id, slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      status = EXCLUDED.status,
      is_default = EXCLUDED.is_default,
      widgets_count = EXCLUDED.widgets_count,
      total_views = EXCLUDED.total_views,
      health_status = EXCLUDED.health_status,
      render_success_rate = EXCLUDED.render_success_rate,
      last_render_duration_ms = EXCLUDED.last_render_duration_ms,
      last_rendered_at = EXCLUDED.last_rendered_at,
      version = profiles.version + 1,
      updated_at = EXCLUDED.updated_at
    WHERE profiles.updated_at <= EXCLUDED.updated_at;
  `

  if (config) {
    await saveProfileConfigInDb(u, cleanSlug, config, { updatedAt: record.lastUpdated })
  }
}

export async function updateProfileInDb(
  username: string,
  slug: string,
  updates: Partial<ProProfileRecord>,
  expectedVersion?: number
): Promise<ProProfileRecord & { version: number }> {
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  if (!hasDbConfig()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gitascii.com'
    return {
      id: `prof_${u}_${cleanSlug}`,
      slug: cleanSlug,
      name: updates.name || '',
      description: updates.description || '',
      status: updates.status || 'active',
      isDefault: Boolean(updates.isDefault),
      widgetsCount: updates.widgetsCount || 1,
      totalViews: updates.totalViews || 0,
      versionCount: (expectedVersion || 1) + 1,
      version: (expectedVersion || 1) + 1,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      publicUrl: `${appUrl}/${u}/${cleanSlug}`,
      rawSvgUrl: `${appUrl}/${u}/${cleanSlug}.svg`,
    }
  }
  const user = await ensureUser(u)

  const res = await sql`
    UPDATE profiles
    SET
      name = CASE WHEN ${updates.name !== undefined} THEN ${updates.name || ''} ELSE name END,
      description = CASE WHEN ${updates.description !== undefined} THEN ${updates.description || ''} ELSE description END,
      status = CASE WHEN ${updates.status !== undefined} THEN ${updates.status || 'active'} ELSE status END,
      is_default = CASE WHEN ${updates.isDefault !== undefined} THEN ${updates.isDefault || false} ELSE is_default END,
      widgets_count = CASE WHEN ${updates.widgetsCount !== undefined} THEN ${updates.widgetsCount || 1} ELSE widgets_count END,
      health_status = CASE WHEN ${updates.healthStatus !== undefined} THEN ${updates.healthStatus || 'operational'} ELSE health_status END,
      render_success_rate = CASE WHEN ${updates.renderSuccessRate !== undefined} THEN ${updates.renderSuccessRate || 100} ELSE render_success_rate END,
      last_render_duration_ms = CASE WHEN ${updates.lastRenderDurationMs !== undefined} THEN ${updates.lastRenderDurationMs || null} ELSE last_render_duration_ms END,
      last_rendered_at = CASE WHEN ${updates.lastRenderedAt !== undefined} THEN ${updates.lastRenderedAt ? new Date(updates.lastRenderedAt) : null} ELSE last_rendered_at END,
      version = version + 1,
      updated_at = NOW()
    WHERE user_id = ${user.id} AND slug = ${cleanSlug}
      AND (${expectedVersion === undefined} OR version = ${expectedVersion || 0})
    RETURNING *;
  `

  if (res.length === 0) {
    if (expectedVersion !== undefined) {
      throw new Error(
        `Optimistic concurrency conflict: Profile @${u}/${cleanSlug} version is not ${expectedVersion}`
      )
    }
    throw new Error(`Profile @${u}/${cleanSlug} not found`)
  }

  const r = res[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gitascii.com'
  return {
    id: String(r.id),
    slug: cleanSlug,
    name: r.name,
    description: r.description || '',
    status: (r.status as any) || 'active',
    isDefault: Boolean(r.is_default),
    widgetsCount: Number(r.widgets_count || 1),
    totalViews: Number(r.total_views || 0),
    versionCount: Number(r.version || 1),
    version: Number(r.version || 1),
    healthStatus: (r.health_status as any) || 'operational',
    renderSuccessRate: Number(r.render_success_rate || 100),
    lastRenderDurationMs: r.last_render_duration_ms ? Number(r.last_render_duration_ms) : undefined,
    lastRenderedAt: r.last_rendered_at ? new Date(r.last_rendered_at).toISOString() : undefined,
    createdAt: new Date(r.created_at).toISOString(),
    lastUpdated: new Date(r.updated_at).toISOString(),
    publicUrl: `${appUrl}/${u}/${cleanSlug}`,
    rawSvgUrl: `${appUrl}/${u}/${cleanSlug}.svg`,
  }
}

export async function setDefaultProfileInDb(username: string, targetSlug: string): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const cleanSlug = targetSlug.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    UPDATE profiles
    SET
      is_default = (slug = ${cleanSlug}),
      updated_at = NOW()
    WHERE user_id = ${user.id};
  `
}

export async function deleteProfileFromDb(username: string, slug: string): Promise<boolean> {
  if (!hasDbConfig()) return true
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const user = await ensureUser(u)

  const res = await sql`
    DELETE FROM profiles
    WHERE user_id = ${user.id} AND slug = ${cleanSlug}
    RETURNING id;
  `
  return res.length > 0
}

export async function createProfileVersionInDb(
  username: string,
  slug: string,
  version: ProfileVersionRecord
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO profile_versions (
      id,
      user_id,
      slug,
      version_number,
      label,
      description,
      config,
      widgets_count,
      created_by,
      created_at
    ) VALUES (
      ${version.id},
      ${user.id},
      ${cleanSlug},
      ${version.versionNumber},
      ${version.label},
      ${version.description || ''},
      ${JSON.stringify(version.config)}::jsonb,
      ${version.widgetsCount || 0},
      ${version.createdBy || u},
      ${new Date(version.createdAt)}
    )
    ON CONFLICT (user_id, slug, version_number) DO NOTHING;
  `
}

export async function getProfileVersionsFromDb(
  username: string,
  slug: string
): Promise<ProfileVersionRecord[]> {
  if (!hasDbConfig()) return []
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  const rows = await sql`
    SELECT
      v.id,
      v.slug,
      v.version_number,
      v.label,
      v.description,
      v.config,
      v.widgets_count,
      v.created_by,
      v.created_at
    FROM profile_versions v
    JOIN users u ON u.id = v.user_id
    WHERE u.username = ${u} AND v.slug = ${cleanSlug}
    ORDER BY v.version_number DESC;
  `

  return rows.map((r: any) => ({
    id: r.id,
    profileSlug: r.slug,
    versionNumber: Number(r.version_number),
    label: r.label,
    description: r.description || '',
    config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
    widgetsCount: Number(r.widgets_count || 0),
    createdAt: new Date(r.created_at).toISOString(),
    createdBy: r.created_by || u,
  }))
}

export async function getProfileVersionByIdFromDb(
  username: string,
  slug: string,
  versionId: string
): Promise<ProfileVersionRecord | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()
  const cleanSlug = slug.toLowerCase().trim()

  const rows = await sql`
    SELECT
      v.id,
      v.slug,
      v.version_number,
      v.label,
      v.description,
      v.config,
      v.widgets_count,
      v.created_by,
      v.created_at
    FROM profile_versions v
    JOIN users u ON u.id = v.user_id
    WHERE u.username = ${u} AND v.slug = ${cleanSlug} AND v.id = ${versionId}
    LIMIT 1;
  `

  if (rows.length === 0) return null
  const r = rows[0]
  return {
    id: r.id,
    profileSlug: r.slug,
    versionNumber: Number(r.version_number),
    label: r.label,
    description: r.description || '',
    config: typeof r.config === 'string' ? JSON.parse(r.config) : r.config,
    widgetsCount: Number(r.widgets_count || 0),
    createdAt: new Date(r.created_at).toISOString(),
    createdBy: r.created_by || u,
  }
}

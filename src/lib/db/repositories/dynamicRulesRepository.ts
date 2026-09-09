import type { DynamicRuleRecord, DynamicRulesConfig } from '@/features/pro/types/profiles'

import { hasDbConfig, sql } from '../client'
import { ensureUser } from './userRepository'

export async function getDynamicRulesConfigFromDb(
  username: string
): Promise<DynamicRulesConfig | null> {
  if (!hasDbConfig()) return null
  const u = username.toLowerCase().trim()

  const user = await ensureUser(u)

  const configRows = await sql`
    SELECT enabled, fallback_profile_slug, default_timezone
    FROM dynamic_rules_configs
    WHERE user_id = ${user.id}
    LIMIT 1;
  `

  const ruleRows = await sql`
    SELECT
      id,
      name,
      target_profile_slug,
      priority,
      enabled,
      type,
      days_of_week,
      start_time,
      end_time,
      timezone,
      start_date,
      end_date,
      event_name,
      expires_at,
      description,
      created_at,
      updated_at
    FROM dynamic_rules
    WHERE user_id = ${user.id}
    ORDER BY priority DESC, updated_at DESC;
  `

  const c = configRows[0] || {}
  const rules: DynamicRuleRecord[] = ruleRows.map((r: any) => ({
    id: r.id,
    name: r.name,
    targetProfileSlug: r.target_profile_slug,
    priority: Number(r.priority),
    enabled: Boolean(r.enabled),
    type: r.type,
    daysOfWeek:
      typeof r.days_of_week === 'string' ? JSON.parse(r.days_of_week) : r.days_of_week || undefined,
    startTime: r.start_time || undefined,
    endTime: r.end_time || undefined,
    timezone: r.timezone || undefined,
    startDate: r.start_date || undefined,
    endDate: r.end_date || undefined,
    eventName: r.event_name || undefined,
    expiresAt: r.expires_at || undefined,
    description: r.description || '',
    createdAt: new Date(r.created_at).toISOString(),
    updatedAt: new Date(r.updated_at).toISOString(),
  }))

  return {
    enabled: c.enabled === true,
    fallbackProfileSlug: c.fallback_profile_slug || 'default',
    defaultTimezone: c.default_timezone || 'UTC',
    rules,
  }
}

export async function saveDynamicRulesConfigInDb(
  username: string,
  updates: Partial<DynamicRulesConfig>
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO dynamic_rules_configs (
      user_id,
      enabled,
      fallback_profile_slug,
      default_timezone,
      updated_at
    ) VALUES (
      ${user.id},
      ${updates.enabled !== undefined ? updates.enabled : false},
      ${updates.fallbackProfileSlug || 'default'},
      ${updates.defaultTimezone || 'UTC'},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      enabled = CASE WHEN ${updates.enabled !== undefined} THEN ${updates.enabled} ELSE dynamic_rules_configs.enabled END,
      fallback_profile_slug = CASE WHEN ${updates.fallbackProfileSlug !== undefined} THEN ${updates.fallbackProfileSlug} ELSE dynamic_rules_configs.fallback_profile_slug END,
      default_timezone = CASE WHEN ${updates.defaultTimezone !== undefined} THEN ${updates.defaultTimezone} ELSE dynamic_rules_configs.default_timezone END,
      updated_at = NOW();
  `
}

export async function createDynamicRuleInDb(
  username: string,
  rule: DynamicRuleRecord
): Promise<DynamicRuleRecord> {
  if (!hasDbConfig()) return rule
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  await sql`
    INSERT INTO dynamic_rules (
      id,
      user_id,
      name,
      target_profile_slug,
      priority,
      enabled,
      type,
      days_of_week,
      start_time,
      end_time,
      timezone,
      start_date,
      end_date,
      event_name,
      expires_at,
      description,
      created_at,
      updated_at
    ) VALUES (
      ${rule.id},
      ${user.id},
      ${rule.name},
      ${rule.targetProfileSlug},
      ${rule.priority},
      ${rule.enabled},
      ${rule.type},
      ${rule.daysOfWeek ? JSON.stringify(rule.daysOfWeek) : null}::jsonb,
      ${rule.startTime || null},
      ${rule.endTime || null},
      ${rule.timezone || null},
      ${rule.startDate || null},
      ${rule.endDate || null},
      ${rule.eventName || null},
      ${rule.expiresAt || null},
      ${rule.description || ''},
      ${new Date(rule.createdAt)},
      ${new Date(rule.updatedAt)}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      target_profile_slug = EXCLUDED.target_profile_slug,
      priority = EXCLUDED.priority,
      enabled = EXCLUDED.enabled,
      type = EXCLUDED.type,
      days_of_week = EXCLUDED.days_of_week,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      timezone = EXCLUDED.timezone,
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      event_name = EXCLUDED.event_name,
      expires_at = EXCLUDED.expires_at,
      description = EXCLUDED.description,
      version = dynamic_rules.version + 1,
      updated_at = EXCLUDED.updated_at
    WHERE dynamic_rules.updated_at <= EXCLUDED.updated_at;
  `

  return rule
}

export async function updateDynamicRuleInDb(
  username: string,
  ruleId: string,
  updates: Partial<DynamicRuleRecord>,
  expectedVersion?: number
): Promise<{ updated: boolean; newVersion?: number }> {
  if (!hasDbConfig()) return { updated: true }
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  const res = await sql`
    UPDATE dynamic_rules
    SET
      name = CASE WHEN ${updates.name !== undefined} THEN ${updates.name || ''} ELSE name END,
      target_profile_slug = CASE WHEN ${updates.targetProfileSlug !== undefined} THEN ${updates.targetProfileSlug || 'default'} ELSE target_profile_slug END,
      priority = CASE WHEN ${updates.priority !== undefined} THEN ${updates.priority || 50} ELSE priority END,
      enabled = CASE WHEN ${updates.enabled !== undefined} THEN ${updates.enabled} ELSE enabled END,
      type = CASE WHEN ${updates.type !== undefined} THEN ${updates.type || 'work_hours'} ELSE type END,
      days_of_week = CASE WHEN ${updates.daysOfWeek !== undefined} THEN ${updates.daysOfWeek ? JSON.stringify(updates.daysOfWeek) : null}::jsonb ELSE days_of_week END,
      start_time = CASE WHEN ${updates.startTime !== undefined} THEN ${updates.startTime || null} ELSE start_time END,
      end_time = CASE WHEN ${updates.endTime !== undefined} THEN ${updates.endTime || null} ELSE end_time END,
      timezone = CASE WHEN ${updates.timezone !== undefined} THEN ${updates.timezone || null} ELSE timezone END,
      start_date = CASE WHEN ${updates.startDate !== undefined} THEN ${updates.startDate || null} ELSE start_date END,
      end_date = CASE WHEN ${updates.endDate !== undefined} THEN ${updates.endDate || null} ELSE end_date END,
      event_name = CASE WHEN ${updates.eventName !== undefined} THEN ${updates.eventName || null} ELSE event_name END,
      expires_at = CASE WHEN ${updates.expiresAt !== undefined} THEN ${updates.expiresAt || null} ELSE expires_at END,
      description = CASE WHEN ${updates.description !== undefined} THEN ${updates.description || ''} ELSE description END,
      version = version + 1,
      updated_at = NOW()
    WHERE user_id = ${user.id} AND id = ${ruleId}
      AND (${expectedVersion === undefined} OR version = ${expectedVersion || 0})
    RETURNING version;
  `
  return { updated: res.length > 0, newVersion: res[0]?.version }
}

export async function deleteDynamicRuleFromDb(username: string, ruleId: string): Promise<boolean> {
  if (!hasDbConfig()) return true
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  const res = await sql`
    DELETE FROM dynamic_rules
    WHERE user_id = ${user.id} AND id = ${ruleId}
    RETURNING id;
  `
  return res.length > 0
}

export async function reorderDynamicRulesInDb(
  username: string,
  orderedRuleIds: string[]
): Promise<void> {
  if (!hasDbConfig()) return
  const u = username.toLowerCase().trim()
  const user = await ensureUser(u)

  const total = orderedRuleIds.length
  for (let i = 0; i < total; i++) {
    const priority = (total - i) * 10
    const ruleId = orderedRuleIds[i]
    await sql`
      UPDATE dynamic_rules
      SET priority = ${priority}, updated_at = NOW()
      WHERE user_id = ${user.id} AND id = ${ruleId};
    `
  }
}

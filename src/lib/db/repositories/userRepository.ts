import type { ProPlanTier, ProUserSettings } from '@/features/pro/types/subscription'

import { sql } from '../client'

export interface UserRow {
  id: string
  username: string
  github_id: string | null
  email: string | null
  name: string | null
  stripe_customer_id: string | null
  created_at: Date
  updated_at: Date
}

export interface UserEntitlementRow {
  id: string
  user_id: string
  plan_tier: ProPlanTier
  stripe_subscription_id: string | null
  stripe_payment_intent_id: string | null
  stripe_price_id: string | null
  stripe_subscription_status: string | null
  stripe_current_period_end: Date | null
  last_event_created_at: number
  created_at: Date
  updated_at: Date
}

export interface UserWithEntitlements {
  user: UserRow
  entitlement: UserEntitlementRow
}

export async function ensureUser(
  rawUsername: string,
  details?: { githubId?: number; email?: string; name?: string }
): Promise<UserRow> {
  const username = rawUsername.toLowerCase().trim()
  if (!username) {
    throw new Error('Username is required')
  }

  const githubIdStr = details?.githubId ? String(details.githubId) : null

  const existing = await sql`
    SELECT id, username, github_id FROM users
    WHERE username = ${username}
    OR (${githubIdStr}::bigint IS NOT NULL AND github_id = ${githubIdStr}::bigint)
    LIMIT 1
  `

  if (existing.length > 0) {
    const existingId = existing[0].id
    const updated = await sql`
      WITH upd_user AS (
        UPDATE users
        SET
          username = ${username},
          github_id = COALESCE(${githubIdStr}::bigint, github_id),
          email = COALESCE(${details?.email || null}, email),
          name = COALESCE(${details?.name || null}, name),
          updated_at = NOW()
        WHERE id = ${existingId}
        RETURNING *
      ),
      ins_entitlements AS (
        INSERT INTO user_entitlements (user_id, plan_tier)
        SELECT id, 'free' FROM upd_user
        ON CONFLICT (user_id) DO NOTHING
      ),
      ins_settings AS (
        INSERT INTO user_settings (user_id)
        SELECT id FROM upd_user
        ON CONFLICT (user_id) DO NOTHING
      )
      SELECT * FROM upd_user;
    `
    return updated[0] as unknown as UserRow
  }

  if (!githubIdStr && process.env.NODE_ENV !== 'test') {
    throw new Error(`Cannot create user @${username} without a GitHub identity`)
  }

  const insertedUsers = await sql`
    WITH ins_user AS (
      INSERT INTO users (username, github_id, email, name)
      VALUES (${username}, ${githubIdStr}::bigint, ${details?.email || null}, ${details?.name || null})
      ON CONFLICT (username) DO UPDATE
      SET
        github_id = COALESCE(EXCLUDED.github_id, users.github_id),
        email = COALESCE(EXCLUDED.email, users.email),
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = NOW()
      RETURNING *
    ),
    ins_entitlements AS (
      INSERT INTO user_entitlements (user_id, plan_tier)
      SELECT id, 'free' FROM ins_user
      ON CONFLICT (user_id) DO NOTHING
    ),
    ins_settings AS (
      INSERT INTO user_settings (user_id)
      SELECT id FROM ins_user
      ON CONFLICT (user_id) DO NOTHING
    )
    SELECT * FROM ins_user;
  `
  return insertedUsers[0] as unknown as UserRow
}

export async function getUserByUsername(rawUsername: string): Promise<UserWithEntitlements | null> {
  const username = rawUsername.toLowerCase().trim()
  if (!username) return null

  const rows = await sql`
    SELECT
      u.id as u_id,
      u.username as u_username,
      u.github_id as u_github_id,
      u.email as u_email,
      u.name as u_name,
      u.stripe_customer_id as u_stripe_customer_id,
      u.created_at as u_created_at,
      u.updated_at as u_updated_at,
      e.id as e_id,
      e.user_id as e_user_id,
      e.plan_tier as e_plan_tier,
      e.stripe_subscription_id as e_stripe_subscription_id,
      e.stripe_payment_intent_id as e_stripe_payment_intent_id,
      e.stripe_price_id as e_stripe_price_id,
      e.stripe_subscription_status as e_stripe_subscription_status,
      e.stripe_current_period_end as e_stripe_current_period_end,
      e.last_event_created_at as e_last_event_created_at,
      e.created_at as e_created_at,
      e.updated_at as e_updated_at
    FROM users u
    LEFT JOIN user_entitlements e ON e.user_id = u.id
    WHERE u.username = ${username}
    LIMIT 1
  `

  if (rows.length === 0) return null
  const r = rows[0]

  return {
    user: {
      id: String(r.u_id),
      username: r.u_username,
      github_id: r.u_github_id,
      email: r.u_email,
      name: r.u_name,
      stripe_customer_id: r.u_stripe_customer_id,
      created_at: r.u_created_at,
      updated_at: r.u_updated_at,
    },
    entitlement: {
      id: String(r.e_id),
      user_id: String(r.e_user_id),
      plan_tier: (r.e_plan_tier as ProPlanTier) || 'free',
      stripe_subscription_id: r.e_stripe_subscription_id,
      stripe_payment_intent_id: r.e_stripe_payment_intent_id,
      stripe_price_id: r.e_stripe_price_id,
      stripe_subscription_status: r.e_stripe_subscription_status,
      stripe_current_period_end: r.e_stripe_current_period_end,
      last_event_created_at: Number(r.e_last_event_created_at || 0),
      created_at: r.e_created_at,
      updated_at: r.e_updated_at,
    },
  }
}

export async function getUserByStripeCustomerId(
  customerId: string
): Promise<UserWithEntitlements | null> {
  if (!customerId) return null

  const rows = await sql`
    SELECT
      u.id as u_id,
      u.username as u_username,
      u.github_id as u_github_id,
      u.email as u_email,
      u.name as u_name,
      u.stripe_customer_id as u_stripe_customer_id,
      u.created_at as u_created_at,
      u.updated_at as u_updated_at,
      e.id as e_id,
      e.user_id as e_user_id,
      e.plan_tier as e_plan_tier,
      e.stripe_subscription_id as e_stripe_subscription_id,
      e.stripe_payment_intent_id as e_stripe_payment_intent_id,
      e.stripe_price_id as e_stripe_price_id,
      e.stripe_subscription_status as e_stripe_subscription_status,
      e.stripe_current_period_end as e_stripe_current_period_end,
      e.last_event_created_at as e_last_event_created_at,
      e.created_at as e_created_at,
      e.updated_at as e_updated_at
    FROM users u
    LEFT JOIN user_entitlements e ON e.user_id = u.id
    WHERE u.stripe_customer_id = ${customerId}
    LIMIT 1
  `

  if (rows.length === 0) return null
  const r = rows[0]

  return {
    user: {
      id: String(r.u_id),
      username: r.u_username,
      github_id: r.u_github_id,
      email: r.u_email,
      name: r.u_name,
      stripe_customer_id: r.u_stripe_customer_id,
      created_at: r.u_created_at,
      updated_at: r.u_updated_at,
    },
    entitlement: {
      id: String(r.e_id),
      user_id: String(r.e_user_id),
      plan_tier: (r.e_plan_tier as ProPlanTier) || 'free',
      stripe_subscription_id: r.e_stripe_subscription_id,
      stripe_payment_intent_id: r.e_stripe_payment_intent_id,
      stripe_price_id: r.e_stripe_price_id,
      stripe_subscription_status: r.e_stripe_subscription_status,
      stripe_current_period_end: r.e_stripe_current_period_end,
      last_event_created_at: Number(r.e_last_event_created_at || 0),
      created_at: r.e_created_at,
      updated_at: r.e_updated_at,
    },
  }
}

export async function getUserBySubscriptionId(
  subscriptionId: string
): Promise<UserWithEntitlements | null> {
  if (!subscriptionId) return null

  const rows = await sql`
    SELECT
      u.id as u_id,
      u.username as u_username,
      u.github_id as u_github_id,
      u.email as u_email,
      u.name as u_name,
      u.stripe_customer_id as u_stripe_customer_id,
      u.created_at as u_created_at,
      u.updated_at as u_updated_at,
      e.id as e_id,
      e.user_id as e_user_id,
      e.plan_tier as e_plan_tier,
      e.stripe_subscription_id as e_stripe_subscription_id,
      e.stripe_payment_intent_id as e_stripe_payment_intent_id,
      e.stripe_price_id as e_stripe_price_id,
      e.stripe_subscription_status as e_stripe_subscription_status,
      e.stripe_current_period_end as e_stripe_current_period_end,
      e.last_event_created_at as e_last_event_created_at,
      e.created_at as e_created_at,
      e.updated_at as e_updated_at
    FROM user_entitlements e
    JOIN users u ON u.id = e.user_id
    WHERE e.stripe_subscription_id = ${subscriptionId}
    LIMIT 1
  `

  if (rows.length === 0) return null
  const r = rows[0]

  return {
    user: {
      id: String(r.u_id),
      username: r.u_username,
      github_id: r.u_github_id,
      email: r.u_email,
      name: r.u_name,
      stripe_customer_id: r.u_stripe_customer_id,
      created_at: r.u_created_at,
      updated_at: r.u_updated_at,
    },
    entitlement: {
      id: String(r.e_id),
      user_id: String(r.e_user_id),
      plan_tier: (r.e_plan_tier as ProPlanTier) || 'free',
      stripe_subscription_id: r.e_stripe_subscription_id,
      stripe_payment_intent_id: r.e_stripe_payment_intent_id,
      stripe_price_id: r.e_stripe_price_id,
      stripe_subscription_status: r.e_stripe_subscription_status,
      stripe_current_period_end: r.e_stripe_current_period_end,
      last_event_created_at: Number(r.e_last_event_created_at || 0),
      created_at: r.e_created_at,
      updated_at: r.e_updated_at,
    },
  }
}

export async function linkStripeCustomer(
  rawUsername: string,
  stripeCustomerId: string
): Promise<void> {
  const username = rawUsername.toLowerCase().trim()
  if (!username || !stripeCustomerId) return

  const existingWithCustomer = await sql`
    SELECT username FROM users WHERE stripe_customer_id = ${stripeCustomerId} LIMIT 1
  `
  if (
    existingWithCustomer.length > 0 &&
    existingWithCustomer[0].username.toLowerCase() !== username
  ) {
    throw new Error(
      `Stripe customer ${stripeCustomerId} is already linked to another account (@${existingWithCustomer[0].username})`
    )
  }

  const user = await ensureUser(username)

  if (user.stripe_customer_id && user.stripe_customer_id !== stripeCustomerId) {
    throw new Error(
      `User @${username} already has linked Stripe customer ${user.stripe_customer_id}. Cannot change to ${stripeCustomerId}.`
    )
  }

  await sql`
    UPDATE users
    SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW()
    WHERE id = ${user.id}
  `
}

export interface UpdateEntitlementParams {
  username: string
  planTier?: ProPlanTier
  stripeCustomerId?: string
  stripeSubscriptionId?: string | null
  stripePaymentIntentId?: string | null
  stripePriceId?: string | null
  stripeSubscriptionStatus?: string | null
  stripeCurrentPeriodEnd?: Date | number | null
  eventCreatedAt?: number
  eventId?: string
  eventType?: string
}

export async function updateEntitlement(
  params: UpdateEntitlementParams
): Promise<UserWithEntitlements> {
  const user = await ensureUser(params.username)

  if (params.stripeCustomerId) {
    const existingCust = await sql`
      SELECT username FROM users WHERE stripe_customer_id = ${params.stripeCustomerId} LIMIT 1
    `
    if (
      existingCust.length > 0 &&
      existingCust[0].username.toLowerCase() !== user.username.toLowerCase()
    ) {
      throw new Error(
        `Stripe customer ${params.stripeCustomerId} is already linked to another account (@${existingCust[0].username})`
      )
    }
    if (user.stripe_customer_id && user.stripe_customer_id !== params.stripeCustomerId) {
      throw new Error(
        `User @${user.username} already has linked Stripe customer ${user.stripe_customer_id}. Cannot change to ${params.stripeCustomerId}.`
      )
    }
    if (!params.eventId && !user.stripe_customer_id) {
      await sql`
        UPDATE users
        SET stripe_customer_id = ${params.stripeCustomerId}, updated_at = NOW()
        WHERE id = ${user.id}
      `
    }
  }

  const current = await getUserByUsername(params.username)
  const currentEntitlement = current?.entitlement

  if (params.stripeSubscriptionId) {
    const existingSubUser = await getUserBySubscriptionId(params.stripeSubscriptionId)
    if (existingSubUser && String(existingSubUser.user.id) !== String(user.id)) {
      throw new Error(
        `Stripe subscription ${params.stripeSubscriptionId} is already linked to another account (@${existingSubUser.user.username})`
      )
    }
  }

  if (params.stripePaymentIntentId) {
    const existingIntentUser = await sql`
      SELECT u.username, e.user_id FROM user_entitlements e
      JOIN users u ON u.id = e.user_id
      WHERE e.stripe_payment_intent_id = ${params.stripePaymentIntentId}
      LIMIT 1
    `
    if (
      existingIntentUser.length > 0 &&
      String(existingIntentUser[0].user_id) !== String(user.id)
    ) {
      throw new Error(
        `Stripe payment intent ${params.stripePaymentIntentId} is already linked to another account (@${existingIntentUser[0].username})`
      )
    }
  }

  const isLifetimePro = Boolean(
    currentEntitlement?.stripe_payment_intent_id && currentEntitlement.plan_tier === 'pro'
  )
  const isDemotion = params.planTier === 'free' || params.stripeSubscriptionStatus === 'canceled'

  if (isLifetimePro && isDemotion) {
    console.warn(
      `[Entitlements] Preserving lifetime Pro for @${params.username} despite incoming demotion event`
    )
    if (params.eventId) {
      await tryRecordStripeEvent(
        params.eventId,
        params.eventType || 'unknown',
        params.eventCreatedAt || 0,
        user.username
      )
    }
    return current!
  }

  const isSameSubscription =
    Boolean(params.stripeSubscriptionId) &&
    params.stripeSubscriptionId === currentEntitlement?.stripe_subscription_id

  if (
    isSameSubscription &&
    params.eventCreatedAt &&
    currentEntitlement?.last_event_created_at &&
    params.eventCreatedAt < currentEntitlement.last_event_created_at
  ) {
    console.warn(
      `[Entitlements] Out-of-order event ignored for @${params.username}: eventCreated=${params.eventCreatedAt}, lastEvent=${currentEntitlement.last_event_created_at}`
    )
    if (params.eventId) {
      await tryRecordStripeEvent(
        params.eventId,
        params.eventType || 'unknown',
        params.eventCreatedAt || 0,
        user.username
      )
    }
    return current!
  }

  if (
    !isSameSubscription &&
    currentEntitlement?.stripe_subscription_id &&
    currentEntitlement.plan_tier === 'pro' &&
    isDemotion
  ) {
    console.warn(
      `[Entitlements] Ignored demotion event for different subscription (${params.stripeSubscriptionId}) because user @${params.username} has active subscription (${currentEntitlement.stripe_subscription_id})`
    )
    if (params.eventId) {
      await tryRecordStripeEvent(
        params.eventId,
        params.eventType || 'unknown',
        params.eventCreatedAt || 0,
        user.username
      )
    }
    return current!
  }

  let periodEndDate: Date | null = null
  if (params.stripeCurrentPeriodEnd) {
    periodEndDate =
      typeof params.stripeCurrentPeriodEnd === 'number'
        ? new Date(params.stripeCurrentPeriodEnd * 1000)
        : params.stripeCurrentPeriodEnd
  }

  const newLastEvent = Math.max(
    params.eventCreatedAt || 0,
    currentEntitlement?.last_event_created_at || 0
  )

  if (params.eventId) {
    const res = await sql`
      WITH ins_event AS (
        INSERT INTO stripe_processed_events (event_id, event_type, stripe_created_at, username, status, processed_at)
        VALUES (${params.eventId}, ${params.eventType || 'unknown'}, ${params.eventCreatedAt || 0}, ${user.username}, 'processed', NOW())
        ON CONFLICT (event_id) DO NOTHING
        RETURNING event_id
      ),
      link_cust AS (
        UPDATE users
        SET stripe_customer_id = COALESCE(users.stripe_customer_id, ${params.stripeCustomerId || null}), updated_at = NOW()
        WHERE id = ${user.id} AND (${Boolean(params.stripeCustomerId)})
        AND EXISTS (SELECT 1 FROM ins_event)
        RETURNING id
      ),
      upd_entitlement AS (
        INSERT INTO user_entitlements (
          user_id,
          plan_tier,
          stripe_subscription_id,
          stripe_payment_intent_id,
          stripe_price_id,
          stripe_subscription_status,
          stripe_current_period_end,
          last_event_created_at,
          updated_at
        )
        SELECT
          ${user.id},
          ${params.planTier || 'free'},
          ${params.stripeSubscriptionId !== undefined ? params.stripeSubscriptionId : null},
          ${params.stripePaymentIntentId !== undefined ? params.stripePaymentIntentId : null},
          ${params.stripePriceId !== undefined ? params.stripePriceId : null},
          ${params.stripeSubscriptionStatus !== undefined ? params.stripeSubscriptionStatus : null},
          ${periodEndDate},
          ${newLastEvent},
          NOW()
        WHERE EXISTS (SELECT 1 FROM ins_event)
        ON CONFLICT (user_id) DO UPDATE SET
          plan_tier = CASE
            WHEN user_entitlements.stripe_payment_intent_id IS NOT NULL THEN 'pro'
            ELSE COALESCE(${params.planTier || null}, user_entitlements.plan_tier)
          END,
          stripe_subscription_id = CASE
            WHEN ${params.stripeSubscriptionId !== undefined} THEN ${params.stripeSubscriptionId || null}
            ELSE user_entitlements.stripe_subscription_id
          END,
          stripe_payment_intent_id = COALESCE(
            CASE
              WHEN ${params.stripePaymentIntentId !== undefined} THEN ${params.stripePaymentIntentId || null}
              ELSE user_entitlements.stripe_payment_intent_id
            END,
            user_entitlements.stripe_payment_intent_id
          ),
          stripe_price_id = CASE
            WHEN ${params.stripePriceId !== undefined} THEN ${params.stripePriceId || null}
            ELSE user_entitlements.stripe_price_id
          END,
          stripe_subscription_status = CASE
            WHEN ${params.stripeSubscriptionStatus !== undefined} THEN ${params.stripeSubscriptionStatus || null}
            ELSE user_entitlements.stripe_subscription_status
          END,
          stripe_current_period_end = CASE
            WHEN ${params.stripeCurrentPeriodEnd !== undefined} THEN ${periodEndDate}
            ELSE user_entitlements.stripe_current_period_end
          END,
          last_event_created_at = GREATEST(user_entitlements.last_event_created_at, ${newLastEvent}),
          updated_at = NOW()
        RETURNING user_id
      )
      SELECT (SELECT event_id FROM ins_event) as inserted_event_id;
    `

    if (!res[0]?.inserted_event_id) {
      throw new Error(`Stripe event ${params.eventId} was already processed`)
    }
  } else {
    await sql`
      INSERT INTO user_entitlements (
        user_id,
        plan_tier,
        stripe_subscription_id,
        stripe_payment_intent_id,
        stripe_price_id,
        stripe_subscription_status,
        stripe_current_period_end,
        last_event_created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${params.planTier || 'free'},
        ${params.stripeSubscriptionId !== undefined ? params.stripeSubscriptionId : null},
        ${params.stripePaymentIntentId !== undefined ? params.stripePaymentIntentId : null},
        ${params.stripePriceId !== undefined ? params.stripePriceId : null},
        ${params.stripeSubscriptionStatus !== undefined ? params.stripeSubscriptionStatus : null},
        ${periodEndDate},
        ${newLastEvent},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        plan_tier = CASE
          WHEN user_entitlements.stripe_payment_intent_id IS NOT NULL THEN 'pro'
          ELSE COALESCE(${params.planTier || null}, user_entitlements.plan_tier)
        END,
        stripe_subscription_id = CASE
          WHEN ${params.stripeSubscriptionId !== undefined} THEN ${params.stripeSubscriptionId || null}
          ELSE user_entitlements.stripe_subscription_id
        END,
        stripe_payment_intent_id = COALESCE(
          CASE
            WHEN ${params.stripePaymentIntentId !== undefined} THEN ${params.stripePaymentIntentId || null}
            ELSE user_entitlements.stripe_payment_intent_id
          END,
          user_entitlements.stripe_payment_intent_id
        ),
        stripe_price_id = CASE
          WHEN ${params.stripePriceId !== undefined} THEN ${params.stripePriceId || null}
          ELSE user_entitlements.stripe_price_id
        END,
        stripe_subscription_status = CASE
          WHEN ${params.stripeSubscriptionStatus !== undefined} THEN ${params.stripeSubscriptionStatus || null}
          ELSE user_entitlements.stripe_subscription_status
        END,
        stripe_current_period_end = CASE
          WHEN ${params.stripeCurrentPeriodEnd !== undefined} THEN ${periodEndDate}
          ELSE user_entitlements.stripe_current_period_end
        END,
        last_event_created_at = GREATEST(user_entitlements.last_event_created_at, ${newLastEvent}),
        updated_at = NOW()
    `
  }

  const updated = await getUserByUsername(params.username)
  return updated!
}

export async function getUserSettingsFromDb(rawUsername: string): Promise<ProUserSettings | null> {
  const user = await getUserByUsername(rawUsername)
  if (!user) return null

  const settingsRows = await sql`
    SELECT * FROM user_settings WHERE user_id = ${user.user.id} LIMIT 1
  `
  const s = settingsRows[0] || {}
  const e = user.entitlement

  return {
    emailAlertsEnabled: s.email_alerts_enabled !== false,
    alertEmailAddress: s.alert_email_address || undefined,
    dailyDigestEnabled: s.daily_digest_enabled === true,
    themePreference: (s.theme_preference as 'system' | 'dark' | 'light') || 'system',
    anonymizeReferrers: s.anonymize_referrers !== false,
    planTier: e.plan_tier,
    stripeCustomerId: user.user.stripe_customer_id || undefined,
    stripeSubscriptionId: e.stripe_subscription_id || undefined,
    stripePriceId: e.stripe_price_id || undefined,
    stripeSubscriptionStatus: e.stripe_subscription_status || undefined,
    stripeCurrentPeriodEnd: e.stripe_current_period_end
      ? Math.floor(new Date(e.stripe_current_period_end).getTime() / 1000)
      : undefined,
  }
}

export async function updateUserSettingsInDb(
  rawUsername: string,
  settings: Partial<ProUserSettings>
): Promise<ProUserSettings> {
  const user = await ensureUser(rawUsername)

  await sql`
    INSERT INTO user_settings (
      user_id,
      email_alerts_enabled,
      alert_email_address,
      daily_digest_enabled,
      theme_preference,
      anonymize_referrers,
      updated_at
    ) VALUES (
      ${user.id},
      ${settings.emailAlertsEnabled !== undefined ? settings.emailAlertsEnabled : true},
      ${settings.alertEmailAddress || null},
      ${settings.dailyDigestEnabled !== undefined ? settings.dailyDigestEnabled : false},
      ${settings.themePreference || 'system'},
      ${settings.anonymizeReferrers !== undefined ? settings.anonymizeReferrers : true},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email_alerts_enabled = CASE
        WHEN ${settings.emailAlertsEnabled !== undefined} THEN ${settings.emailAlertsEnabled}
        ELSE user_settings.email_alerts_enabled
      END,
      alert_email_address = CASE
        WHEN ${settings.alertEmailAddress !== undefined} THEN ${settings.alertEmailAddress || null}
        ELSE user_settings.alert_email_address
      END,
      daily_digest_enabled = CASE
        WHEN ${settings.dailyDigestEnabled !== undefined} THEN ${settings.dailyDigestEnabled}
        ELSE user_settings.daily_digest_enabled
      END,
      theme_preference = CASE
        WHEN ${settings.themePreference !== undefined} THEN ${settings.themePreference}
        ELSE user_settings.theme_preference
      END,
      anonymize_referrers = CASE
        WHEN ${settings.anonymizeReferrers !== undefined} THEN ${settings.anonymizeReferrers}
        ELSE user_settings.anonymize_referrers
      END,
      updated_at = NOW()
  `

  const hasEntitlementFields =
    settings.planTier !== undefined ||
    settings.stripeCustomerId !== undefined ||
    settings.stripeSubscriptionId !== undefined ||
    settings.stripePriceId !== undefined ||
    settings.stripeSubscriptionStatus !== undefined ||
    settings.stripeCurrentPeriodEnd !== undefined

  if (hasEntitlementFields) {
    await updateEntitlement({
      username: rawUsername,
      planTier: settings.planTier,
      stripeCustomerId: settings.stripeCustomerId,
      stripeSubscriptionId: settings.stripeSubscriptionId,
      stripePriceId: settings.stripePriceId,
      stripeSubscriptionStatus: settings.stripeSubscriptionStatus,
      stripeCurrentPeriodEnd: settings.stripeCurrentPeriodEnd,
    })
  }

  const result = await getUserSettingsFromDb(rawUsername)
  return result!
}

export async function tryRecordStripeEvent(
  eventId: string,
  eventType: string,
  stripeCreatedAt: number,
  username?: string
): Promise<boolean> {
  if (!eventId) return false

  try {
    const res = await sql`
      INSERT INTO stripe_processed_events (event_id, event_type, stripe_created_at, username)
      VALUES (${eventId}, ${eventType}, ${stripeCreatedAt}, ${username || null})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING event_id
    `
    return res.length > 0
  } catch (err) {
    console.error(`[Stripe Events] Error recording event ${eventId}:`, err)
    return false
  }
}

export async function isStripeEventProcessed(eventId: string): Promise<boolean> {
  if (!eventId) return false
  try {
    const res = await sql`
      SELECT event_id FROM stripe_processed_events WHERE event_id = ${eventId} LIMIT 1
    `
    return res.length > 0
  } catch {
    return false
  }
}

export async function getProUsersFromDb(): Promise<string[]> {
  try {
    const rows = await sql`
      SELECT u.username FROM users u
      JOIN user_entitlements e ON e.user_id = u.id
      WHERE e.plan_tier = 'pro'
      ORDER BY e.updated_at DESC
      LIMIT 100
    `
    return rows.map((r: any) => String(r.username))
  } catch (err) {
    console.warn('[UserRepository] Error fetching Pro users from DB:', err)
    return []
  }
}

export async function deleteUser(rawUsername: string): Promise<boolean> {
  const username = rawUsername.toLowerCase().trim()
  if (!username) return false

  const pgProfileSlugs: string[] = []
  const pgDynamicRuleIds: string[] = []
  let stripeCustomerId: string | null = null

  const user = await getUserByUsername(username)
  if (user) {
    stripeCustomerId = user.user.stripe_customer_id

    try {
      const profileRows = await sql`SELECT slug FROM profiles WHERE user_id = ${user.user.id};`
      profileRows.forEach((r: any) => pgProfileSlugs.push(String(r.slug).toLowerCase().trim()))
    } catch {}

    try {
      const configRows =
        await sql`SELECT slug FROM profile_configurations WHERE user_id = ${user.user.id};`
      configRows.forEach((r: any) => pgProfileSlugs.push(String(r.slug).toLowerCase().trim()))
    } catch {}

    try {
      const ruleRows = await sql`SELECT id FROM dynamic_rules WHERE user_id = ${user.user.id};`
      ruleRows.forEach((r: any) => pgDynamicRuleIds.push(String(r.id)))
    } catch {}

    await sql`
      DELETE FROM users WHERE id = ${user.user.id};
    `
  }

  try {
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')
    const redis = getProRedisClient()

    const redisSlugs = await redis.smembers(REDIS_KEYS.userProfiles(username)).catch(() => [])
    const allSlugs = new Set<string>(['default', ...pgProfileSlugs])
    if (Array.isArray(redisSlugs)) {
      redisSlugs.forEach((s) => s && allSlugs.add(s.toLowerCase().trim()))
    }

    const redisRules = await redis
      .zrange<string[]>(REDIS_KEYS.dynamicRulesList(username), 0, -1)
      .catch(() => [])
    const allRuleIds = new Set<string>([...pgDynamicRuleIds])
    if (Array.isArray(redisRules)) {
      redisRules.forEach((r) => r && allRuleIds.add(String(r)))
    }

    const keysToDelete = new Set<string>([
      REDIS_KEYS.userSettings(username),
      REDIS_KEYS.userTotals(username),
      REDIS_KEYS.activityStream(username),
      REDIS_KEYS.errorList(username),
      REDIS_KEYS.emailList(username),
      REDIS_KEYS.testDigestCooldown(username),
      REDIS_KEYS.dynamicRulesConfig(username),
      REDIS_KEYS.dynamicRulesList(username),
      REDIS_KEYS.healthHistoryList(username),
      REDIS_KEYS.userProfiles(username),
    ])

    if (stripeCustomerId) {
      keysToDelete.add(`gitascii:stripe:customer:${stripeCustomerId}`)
    }

    for (const slug of allSlugs) {
      if (!slug) continue
      keysToDelete.add(REDIS_KEYS.profileMeta(username, slug))
      keysToDelete.add(REDIS_KEYS.profileConfig(username, slug))
      keysToDelete.add(REDIS_KEYS.profileVersions(username, slug))
      keysToDelete.add(REDIS_KEYS.weekdayMetrics(username, slug))
    }

    for (const ruleId of allRuleIds) {
      if (!ruleId) continue
      keysToDelete.add(REDIS_KEYS.dynamicRuleItem(username, ruleId))
    }

    let cursor = 0
    do {
      const scanResult = await redis
        .scan(cursor, { match: `gitascii:pro:${username}:*`, count: 100 })
        .catch(() => null)
      if (!scanResult || !Array.isArray(scanResult) || scanResult.length !== 2) break
      cursor = Number(scanResult[0])
      const scannedKeys = scanResult[1]
      if (Array.isArray(scannedKeys)) {
        scannedKeys.forEach((key) => key && keysToDelete.add(String(key)))
      }
    } while (cursor !== 0)

    const keyArray = Array.from(keysToDelete).filter(Boolean)
    if (keyArray.length > 0) {
      await redis.del(...keyArray).catch(() => {})
    }

    await Promise.all([
      redis.srem('gitascii:pro:customers', username).catch(() => {}),
      redis.srem('gitascii:all:users', username).catch(() => {}),
    ])
  } catch (redisErr) {
    console.warn(`[UserRepository] Redis purge warning during deleteUser(@${username}):`, redisErr)
  }

  try {
    const { invalidateEntitlementsCache } = await import('@/features/pro/server/entitlements')
    invalidateEntitlementsCache(username)
  } catch {}

  return true
}

export async function anonymizeUser(rawUsername: string): Promise<boolean> {
  const username = rawUsername.toLowerCase().trim()
  if (!username) return false

  const user = await getUserByUsername(username)
  if (!user) return false

  await sql`
    UPDATE users
    SET
      email = NULL,
      name = 'Anonymous User',
      github_id = NULL,
      stripe_customer_id = NULL,
      updated_at = NOW()
    WHERE id = ${user.user.id};
  `

  await sql`
    UPDATE user_settings
    SET
      alert_email_address = NULL,
      anonymize_referrers = TRUE,
      updated_at = NOW()
    WHERE user_id = ${user.user.id};
  `

  try {
    const { getProRedisClient } = await import('@/features/pro/server/redisClient')
    const { REDIS_KEYS } = await import('@/features/pro/server/analyticsStore')
    const redis = getProRedisClient()
    await redis.del(REDIS_KEYS.userSettings(username)).catch(() => {})
  } catch {}

  try {
    const { invalidateEntitlementsCache } = await import('@/features/pro/server/entitlements')
    invalidateEntitlementsCache(username)
  } catch {}

  return true
}

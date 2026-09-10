import { directSql as sql } from './client'

export interface Migration {
  version: string
  name: string
  up: () => Promise<void>
}

export const MIGRATIONS: Migration[] = [
  {
    version: '001_core_users_and_entitlements',
    name: 'Create core users, entitlements, settings, stripe events and system locks',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          github_id BIGINT UNIQUE,
          email VARCHAR(255),
          name VARCHAR(255),
          stripe_customer_id VARCHAR(255) UNIQUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`
      await sql`CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);`

      await sql`
        CREATE TABLE IF NOT EXISTS user_entitlements (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          plan_tier VARCHAR(50) NOT NULL DEFAULT 'free',
          stripe_subscription_id VARCHAR(255),
          stripe_payment_intent_id VARCHAR(255),
          stripe_price_id VARCHAR(255),
          stripe_subscription_status VARCHAR(50),
          stripe_current_period_end TIMESTAMPTZ,
          last_event_created_at BIGINT DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_user_entitlements_user_id UNIQUE (user_id)
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_user_entitlements_user_id ON user_entitlements(user_id);`
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_stripe_subscription_id
        ON user_entitlements (stripe_subscription_id)
        WHERE stripe_subscription_id IS NOT NULL;
      `
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_idx_stripe_payment_intent_id
        ON user_entitlements (stripe_payment_intent_id)
        WHERE stripe_payment_intent_id IS NOT NULL;
      `

      await sql`
        CREATE TABLE IF NOT EXISTS user_settings (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          email_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
          alert_email_address VARCHAR(255),
          daily_digest_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          theme_preference VARCHAR(20) NOT NULL DEFAULT 'system',
          anonymize_referrers BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS stripe_processed_events (
          event_id VARCHAR(255) PRIMARY KEY,
          event_type VARCHAR(100) NOT NULL,
          stripe_created_at BIGINT NOT NULL,
          username VARCHAR(100),
          status VARCHAR(50) NOT NULL DEFAULT 'processed',
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_stripe_events_username ON stripe_processed_events(username);`

      await sql`
        CREATE TABLE IF NOT EXISTS system_locks (
          lock_name VARCHAR(100) PRIMARY KEY,
          locked_until TIMESTAMPTZ NOT NULL,
          locked_by VARCHAR(255) NOT NULL
        );
      `
    },
  },
  {
    version: '002_profiles_and_configurations',
    name: 'Create profiles, configurations and version history tables',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS profiles (
          id VARCHAR(100) PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          slug VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          widgets_count INTEGER NOT NULL DEFAULT 1,
          total_views BIGINT NOT NULL DEFAULT 0,
          health_status VARCHAR(50) NOT NULL DEFAULT 'operational',
          render_success_rate DOUBLE PRECISION NOT NULL DEFAULT 100,
          last_render_duration_ms INTEGER,
          last_rendered_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_user_profiles_slug UNIQUE (user_id, slug)
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_profiles_user_slug ON profiles(user_id, slug);`
      await sql`CREATE INDEX IF NOT EXISTS idx_profiles_user_is_default ON profiles(user_id, is_default);`

      await sql`
        CREATE TABLE IF NOT EXISTS profile_configurations (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          slug VARCHAR(100) NOT NULL,
          config JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, slug)
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS profile_versions (
          id VARCHAR(100) PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          slug VARCHAR(100) NOT NULL,
          version_number INTEGER NOT NULL,
          label VARCHAR(255) NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          config JSONB NOT NULL,
          widgets_count INTEGER NOT NULL DEFAULT 0,
          created_by VARCHAR(100) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_profile_versions_num UNIQUE (user_id, slug, version_number)
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_profile_versions_user_slug ON profile_versions(user_id, slug);`
    },
  },
  {
    version: '003_dynamic_rules',
    name: 'Create dynamic rules configuration and rule definitions tables',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS dynamic_rules_configs (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          enabled BOOLEAN NOT NULL DEFAULT FALSE,
          fallback_profile_slug VARCHAR(100) NOT NULL DEFAULT 'default',
          default_timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS dynamic_rules (
          id VARCHAR(100) PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          target_profile_slug VARCHAR(100) NOT NULL DEFAULT 'default',
          priority INTEGER NOT NULL DEFAULT 50,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          type VARCHAR(50) NOT NULL DEFAULT 'work_hours',
          days_of_week JSONB,
          start_time VARCHAR(10),
          end_time VARCHAR(10),
          timezone VARCHAR(100),
          start_date VARCHAR(50),
          end_date VARCHAR(50),
          event_name VARCHAR(255),
          expires_at VARCHAR(50),
          description TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_dynamic_rules_user_priority ON dynamic_rules(user_id, priority DESC);`
    },
  },
  {
    version: '004_email_logs_and_cooldowns',
    name: 'Create email audit logs and digest cooldown tables',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS email_logs (
          id VARCHAR(100) PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          recipient_email VARCHAR(255) NOT NULL,
          template_name VARCHAR(100) NOT NULL,
          subject VARCHAR(500) NOT NULL,
          reason TEXT NOT NULL,
          related_widget VARCHAR(100),
          related_profile VARCHAR(100),
          sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status VARCHAR(50) NOT NULL DEFAULT 'sent',
          error_message TEXT,
          message_id VARCHAR(255)
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_email_logs_user_sent_at ON email_logs(user_id, sent_at DESC);`

      await sql`
        CREATE TABLE IF NOT EXISTS user_digest_cooldowns (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          test_digest_count INTEGER NOT NULL DEFAULT 0,
          last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `
    },
  },
  {
    version: '005_widget_errors_and_health',
    name: 'Create widget errors and daily health telemetry tables',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS widget_errors (
          id VARCHAR(150) PRIMARY KEY,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          widget_id VARCHAR(100) NOT NULL,
          widget_name VARCHAR(255) NOT NULL,
          profile_slug VARCHAR(100) NOT NULL DEFAULT 'default',
          error_type VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
          message TEXT NOT NULL,
          details TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          occurrences INTEGER NOT NULL DEFAULT 1,
          first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMPTZ,
          CONSTRAINT uq_user_widget_error UNIQUE (user_id, profile_slug, widget_id)
        );
      `
      await sql`CREATE INDEX IF NOT EXISTS idx_widget_errors_user_status ON widget_errors(user_id, status);`

      await sql`
        CREATE TABLE IF NOT EXISTS profile_daily_health (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          slug VARCHAR(100) NOT NULL,
          date_str VARCHAR(15) NOT NULL,
          renders INTEGER NOT NULL DEFAULT 0,
          successes INTEGER NOT NULL DEFAULT 0,
          failures INTEGER NOT NULL DEFAULT 0,
          duration_ms BIGINT NOT NULL DEFAULT 0,
          duration_count INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, slug, date_str)
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS widget_daily_health (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          widget_id VARCHAR(100) NOT NULL,
          date_str VARCHAR(15) NOT NULL,
          renders INTEGER NOT NULL DEFAULT 0,
          successes INTEGER NOT NULL DEFAULT 0,
          failures INTEGER NOT NULL DEFAULT 0,
          duration_ms BIGINT NOT NULL DEFAULT 0,
          duration_count INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, widget_id, date_str)
        );
      `
    },
  },
  {
    version: '006_analytics_totals_and_daily',
    name: 'Create user analytics totals and daily metrics tables',
    up: async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS user_analytics_totals (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          views BIGINT NOT NULL DEFAULT 0,
          uniques BIGINT NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `

      await sql`
        CREATE TABLE IF NOT EXISTS profile_daily_analytics (
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          slug VARCHAR(100) NOT NULL,
          date_str VARCHAR(15) NOT NULL,
          views INTEGER NOT NULL DEFAULT 0,
          uniques INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (user_id, slug, date_str)
        );
      `
    },
  },
  {
    version: '007_normalize_profile_ids',
    name: 'Ensure profile IDs are globally unique per user and slug',
    up: async () => {
      await sql`
        UPDATE profiles
        SET id = 'prof_' || user_id || '_' || slug
        WHERE id NOT LIKE 'prof_%_%';
      `
    },
  },
  {
    version: '008_optimistic_concurrency',
    name: 'Add version column to profiles, profile_configurations, and dynamic_rules for optimistic concurrency',
    up: async () => {
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;`
      await sql`ALTER TABLE profile_configurations ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;`
      await sql`ALTER TABLE dynamic_rules ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;`
    },
  },
  {
    version: '009_relational_integrity_and_data_lifecycle',
    name: 'Harden profile relationships, validation, timestamps and retention support',
    up: async () => {
      await sql`
        DELETE FROM profile_configurations c
        WHERE NOT EXISTS (
          SELECT 1 FROM profiles p WHERE p.user_id = c.user_id AND p.slug = c.slug
        );
      `
      await sql`
        DELETE FROM profile_versions v
        WHERE NOT EXISTS (
          SELECT 1 FROM profiles p WHERE p.user_id = v.user_id AND p.slug = v.slug
        );
      `
      await sql`
        DELETE FROM profile_daily_analytics a
        WHERE NOT EXISTS (
          SELECT 1 FROM profiles p WHERE p.user_id = a.user_id AND p.slug = a.slug
        );
      `
      await sql`
        DELETE FROM profile_daily_health h
        WHERE NOT EXISTS (
          SELECT 1 FROM profiles p WHERE p.user_id = h.user_id AND p.slug = h.slug
        );
      `

      await sql`ALTER TABLE profile_daily_analytics ALTER COLUMN date_str TYPE DATE USING date_str::date;`
      await sql`ALTER TABLE profile_daily_health ALTER COLUMN date_str TYPE DATE USING date_str::date;`
      await sql`ALTER TABLE widget_daily_health ALTER COLUMN date_str TYPE DATE USING date_str::date;`

      await sql`
        ALTER TABLE profile_configurations
        ADD CONSTRAINT fk_profile_configurations_profile
        FOREIGN KEY (user_id, slug) REFERENCES profiles(user_id, slug) ON DELETE CASCADE;
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE profile_versions
        ADD CONSTRAINT fk_profile_versions_profile
        FOREIGN KEY (user_id, slug) REFERENCES profiles(user_id, slug) ON DELETE CASCADE;
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE profile_daily_analytics
        ADD CONSTRAINT fk_profile_daily_analytics_profile
        FOREIGN KEY (user_id, slug) REFERENCES profiles(user_id, slug) ON DELETE CASCADE;
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE profile_daily_health
        ADD CONSTRAINT fk_profile_daily_health_profile
        FOREIGN KEY (user_id, slug) REFERENCES profiles(user_id, slug) ON DELETE CASCADE;
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })

      await sql`
        ALTER TABLE user_entitlements
        ADD CONSTRAINT chk_user_entitlements_plan_tier CHECK (plan_tier IN ('free', 'pro'));
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE user_settings
        ADD CONSTRAINT chk_user_settings_theme CHECK (theme_preference IN ('system', 'dark', 'light'));
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE profiles
        ADD CONSTRAINT chk_profiles_status CHECK (status IN ('active', 'draft', 'archived'));
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })
      await sql`
        ALTER TABLE widget_errors
        ADD CONSTRAINT chk_widget_errors_status CHECK (status IN ('active', 'resolved'));
      `.catch((err: any) => {
        if (err?.code !== '42710') throw err
      })

      await sql`
        CREATE OR REPLACE FUNCTION set_row_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
      await sql`DROP TRIGGER IF EXISTS trg_users_updated_at ON users;`
      await sql`CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_user_entitlements_updated_at ON user_entitlements;`
      await sql`CREATE TRIGGER trg_user_entitlements_updated_at BEFORE UPDATE ON user_entitlements FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_user_settings_updated_at ON user_settings;`
      await sql`CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;`
      await sql`CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_profile_configurations_updated_at ON profile_configurations;`
      await sql`CREATE TRIGGER trg_profile_configurations_updated_at BEFORE UPDATE ON profile_configurations FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_dynamic_rules_configs_updated_at ON dynamic_rules_configs;`
      await sql`CREATE TRIGGER trg_dynamic_rules_configs_updated_at BEFORE UPDATE ON dynamic_rules_configs FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_dynamic_rules_updated_at ON dynamic_rules;`
      await sql`CREATE TRIGGER trg_dynamic_rules_updated_at BEFORE UPDATE ON dynamic_rules FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_profile_daily_analytics_updated_at ON profile_daily_analytics;`
      await sql`CREATE TRIGGER trg_profile_daily_analytics_updated_at BEFORE UPDATE ON profile_daily_analytics FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_profile_daily_health_updated_at ON profile_daily_health;`
      await sql`CREATE TRIGGER trg_profile_daily_health_updated_at BEFORE UPDATE ON profile_daily_health FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_widget_daily_health_updated_at ON widget_daily_health;`
      await sql`CREATE TRIGGER trg_widget_daily_health_updated_at BEFORE UPDATE ON widget_daily_health FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_user_analytics_totals_updated_at ON user_analytics_totals;`
      await sql`CREATE TRIGGER trg_user_analytics_totals_updated_at BEFORE UPDATE ON user_analytics_totals FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`
      await sql`DROP TRIGGER IF EXISTS trg_user_digest_cooldowns_updated_at ON user_digest_cooldowns;`
      await sql`CREATE TRIGGER trg_user_digest_cooldowns_updated_at BEFORE UPDATE ON user_digest_cooldowns FOR EACH ROW EXECUTE FUNCTION set_row_updated_at();`

      await sql`DROP INDEX IF EXISTS idx_users_username;`
      await sql`DROP INDEX IF EXISTS idx_users_stripe_customer_id;`
      await sql`DROP INDEX IF EXISTS idx_user_entitlements_user_id;`
      await sql`DROP INDEX IF EXISTS idx_profiles_user_slug;`

      await sql`
        CREATE OR REPLACE FUNCTION purge_expired_operational_data(retention_days INTEGER DEFAULT 90)
        RETURNS VOID AS $$
        BEGIN
          DELETE FROM email_logs WHERE sent_at < NOW() - make_interval(days => retention_days);
          DELETE FROM profile_daily_analytics WHERE updated_at < NOW() - make_interval(days => retention_days);
          DELETE FROM profile_daily_health WHERE updated_at < NOW() - make_interval(days => retention_days);
          DELETE FROM widget_daily_health WHERE updated_at < NOW() - make_interval(days => retention_days);
        END;
        $$ LANGUAGE plpgsql;
      `
    },
  },
]

export async function runMigrations(): Promise<{ applied: string[]; alreadyApplied: string[] }> {
  await sql`
    CREATE TABLE IF NOT EXISTS system_locks (
      lock_name VARCHAR(100) PRIMARY KEY,
      locked_until TIMESTAMPTZ NOT NULL,
      locked_by VARCHAR(255) NOT NULL
    );
  `
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `

  const instanceId = `migrate_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const lockAcquired = await sql`
    INSERT INTO system_locks (lock_name, locked_until, locked_by)
    VALUES ('schema_migrations', NOW() + INTERVAL '3 minutes', ${instanceId})
    ON CONFLICT (lock_name) DO UPDATE
    SET locked_until = NOW() + INTERVAL '3 minutes', locked_by = ${instanceId}
    WHERE system_locks.locked_until < NOW()
    RETURNING lock_name;
  `
  if (lockAcquired.length === 0) {
    console.log('[Migrations] Another migration process is currently running. Skipping.')
    const currentRows = await sql`SELECT version FROM schema_migrations;`
    return {
      applied: [],
      alreadyApplied: currentRows.map((r: any) => String(r.version)),
    }
  }

  try {
    const rows = await sql`
      SELECT version FROM schema_migrations;
    `
    const appliedSet = new Set<string>(rows.map((r: any) => String(r.version)))

    const result = {
      applied: [] as string[],
      alreadyApplied: Array.from(appliedSet),
    }

    for (const migration of MIGRATIONS) {
      if (!appliedSet.has(migration.version)) {
        console.log(`[Migrations] Applying ${migration.version}: ${migration.name}...`)
        await migration.up()
        await sql`
          INSERT INTO schema_migrations (version, name, applied_at)
          VALUES (${migration.version}, ${migration.name}, NOW())
          ON CONFLICT (version) DO NOTHING;
        `
        appliedSet.add(migration.version)
        result.applied.push(migration.version)
        console.log(`[Migrations] Successfully applied ${migration.version}`)
      }
    }

    return result
  } finally {
    await sql`
      DELETE FROM system_locks
      WHERE lock_name = 'schema_migrations' AND locked_by = ${instanceId};
    `.catch(() => {})
  }
}

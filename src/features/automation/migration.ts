import { sql } from '@/lib/db/client'

export const automationMigration = {
  version: '012_assistant_connections',
  name: 'OAuth connections, rate limits, and shared editor drafts',
  up: async () => {
    await sql`CREATE TABLE IF NOT EXISTS assistant_clients (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, redirect_uris JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
    await sql`CREATE TABLE IF NOT EXISTS assistant_codes (
      hash TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES assistant_clients(id),
      github_id BIGINT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE, redirect_uri TEXT NOT NULL,
      challenge TEXT NOT NULL, scopes JSONB NOT NULL, expires_at TIMESTAMPTZ NOT NULL
    )`
    await sql`CREATE TABLE IF NOT EXISTS assistant_connections (
      id UUID PRIMARY KEY, github_id BIGINT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE, client_id TEXT NOT NULL REFERENCES assistant_clients(id),
      scopes JSONB NOT NULL, access_hash TEXT UNIQUE NOT NULL, refresh_hash TEXT UNIQUE NOT NULL,
      previous_refresh_hash TEXT, access_expires_at TIMESTAMPTZ NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
    await sql`CREATE INDEX IF NOT EXISTS assistant_connections_owner ON assistant_connections(github_id)`
    await sql`CREATE TABLE IF NOT EXISTS assistant_used_refresh_tokens (
      hash TEXT PRIMARY KEY, connection_id UUID NOT NULL REFERENCES assistant_connections(id) ON DELETE CASCADE
    )`
    await sql`CREATE TABLE IF NOT EXISTS editor_cloud_drafts (
      github_id BIGINT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE, slug TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
      config JSONB NOT NULL, history JSONB NOT NULL DEFAULT '{"past":[],"future":[]}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(github_id, slug)
    )`
    await sql`CREATE TABLE IF NOT EXISTS assistant_rate_limits (
      key TEXT PRIMARY KEY, count INTEGER NOT NULL, resets_at TIMESTAMPTZ NOT NULL
    )`
    await sql`CREATE TABLE IF NOT EXISTS assistant_publications (
      github_id BIGINT NOT NULL REFERENCES users(github_id) ON DELETE CASCADE, request_id UUID NOT NULL, slug TEXT NOT NULL, revision INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'running', result JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY(github_id, request_id)
    )`
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS assistant_publication_in_progress
      ON assistant_publications(github_id, slug) WHERE status = 'running'`
  },
}

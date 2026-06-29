import { db } from "./database"
import { logger } from "./logger"

export async function runMigrations() {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS tenants (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      plan        TEXT NOT NULL DEFAULT 'starter',
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      email         TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'active',
      mfa_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
      mfa_secret    TEXT,
      last_login_at TIMESTAMPTZ,
      login_attempts INT NOT NULL DEFAULT 0,
      locked_until  TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, email)
    );

    CREATE TABLE IF NOT EXISTS roles (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      permissions JSONB NOT NULL DEFAULT '[]',
      is_system   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, name)
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash  TEXT NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      revoked     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id   UUID,
      user_id     UUID,
      action      TEXT NOT NULL,
      resource    TEXT,
      details     JSONB,
      ip_address  TEXT,
      user_agent  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
    CREATE INDEX IF NOT EXISTS idx_users_tenant       ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_tenant        ON audit_log(tenant_id, created_at DESC);
  `)
  logger.info("Auth DB migrations applied")
}

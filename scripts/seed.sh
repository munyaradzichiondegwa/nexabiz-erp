#!/usr/bin/env bash
# NexaBiz — Seed development data
set -euo pipefail

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_USER="${POSTGRES_USER:-nexabiz}"
DB_PASS="${POSTGRES_PASSWORD:-nexabiz}"

echo "[seed] Seeding development data..."

PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d nexabiz_auth -q << 'SQL'
-- Dev tenant
INSERT INTO tenants (id, name, slug, plan, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'NexaBiz Demo Co', 'demo', 'enterprise', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Admin user (password: Admin@1234)
INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, status)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'admin@nexabiz.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0NMv/LgSAi',
  'System', 'Admin', 'active'
) ON CONFLICT DO NOTHING;

-- Admin role with all permissions
INSERT INTO roles (tenant_id, name, permissions, is_system) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrator',
   '["*"]', TRUE)
ON CONFLICT (tenant_id, name) DO NOTHING;
SQL

echo "[seed] Dev data seeded"
echo "[seed] Login: admin@nexabiz.com / Admin@1234"

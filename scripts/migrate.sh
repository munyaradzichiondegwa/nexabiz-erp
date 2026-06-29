#!/usr/bin/env bash
# NexaBiz — Run all DB migrations
set -euo pipefail

DB_HOST="${POSTGRES_HOST:-localhost}"
DB_USER="${POSTGRES_USER:-nexabiz}"
DB_PASS="${POSTGRES_PASSWORD:-nexabiz}"
DB_PORT="${POSTGRES_PORT:-5432}"

run_sql() {
  local db=$1
  local file=$2
  echo "  Migrating $db <- $file"
  PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $db -f "$file" -q
}

echo "[migrate] Running NexaBiz database migrations..."

run_sql nexabiz_auth        packages/db-migrations/auth/001_initial.sql 2>/dev/null || true
run_sql nexabiz_accounting  packages/db-migrations/accounting/001_initial.sql
run_sql nexabiz_inventory   packages/db-migrations/inventory/001_initial.sql
run_sql nexabiz_hr          packages/db-migrations/hr/001_initial.sql
run_sql nexabiz_config      packages/db-migrations/config/001_modules.sql

echo "[migrate] All migrations complete"

#!/usr/bin/env node
/**
 * NexaBiz Database Migration Runner
 * Applies all SQL migration files in order across all 11 PostgreSQL databases.
 * Run: node scripts/migrate.js
 */
const { Client } = require("pg")
const fs = require("fs")
const path = require("path")

const DATABASES = [
  { name: "auth",        env: "AUTH_DB_URL",        migrations: "auth" },
  { name: "config",      env: "CONFIG_DB_URL",       migrations: "config" },
  { name: "accounting",  env: "ACCOUNTING_DB_URL",   migrations: "accounting" },
  { name: "inventory",   env: "INVENTORY_DB_URL",    migrations: "inventory" },
  { name: "sales",       env: "SALES_DB_URL",        migrations: "sales" },
  { name: "hr",          env: "HR_DB_URL",           migrations: "hr" },
  { name: "banking",     env: "BANKING_DB_URL",      migrations: "banking" },
  { name: "procurement", env: "PROCUREMENT_DB_URL",  migrations: "procurement" },
  { name: "crm",         env: "CRM_DB_URL",          migrations: "crm" },
  { name: "projects",    env: "PROJECT_DB_URL",      migrations: "projects" },
  { name: "workflow",    env: "WORKFLOW_DB_URL",      migrations: "workflow" },
]

async function runMigrations(dbConfig) {
  const url = process.env[dbConfig.env]
  if (!url) {
    console.warn(`  SKIP ${dbConfig.name}: ${dbConfig.env} not set`)
    return
  }

  const client = new Client({ connectionString: url })
  await client.connect()

  // Create migrations tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const migrationsDir = path.join(__dirname, "../packages/db-migrations", dbConfig.migrations)
  if (!fs.existsSync(migrationsDir)) {
    console.log(`  SKIP ${dbConfig.name}: no migrations directory`)
    await client.end()
    return
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort()

  for (const file of files) {
    const { rows } = await client.query("SELECT 1 FROM _migrations WHERE filename=$1", [file])
    if (rows.length > 0) {
      console.log(`  SKIP ${dbConfig.name}/${file} (already applied)`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")
    try {
      await client.query("BEGIN")
      await client.query(sql)
      await client.query("INSERT INTO _migrations (filename) VALUES ($1)", [file])
      await client.query("COMMIT")
      console.log(`  OK   ${dbConfig.name}/${file}`)
    } catch (err) {
      await client.query("ROLLBACK")
      console.error(`  FAIL ${dbConfig.name}/${file}:`, err.message)
      throw err
    }
  }

  await client.end()
}

async function main() {
  console.log("NexaBiz Database Migration Runner v3.1.0")
  console.log("==========================================")

  for (const db of DATABASES) {
    console.log(`\n>> ${db.name} database`)
    await runMigrations(db)
  }

  console.log("\n✅ All migrations complete")
}

main().catch(err => {
  console.error("Migration failed:", err)
  process.exit(1)
})

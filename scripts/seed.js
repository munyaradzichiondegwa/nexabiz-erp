#!/usr/bin/env node
/**
 * NexaBiz Demo Data Seeder
 * Creates a demo tenant with sample data so the system is immediately usable.
 * Run: node scripts/seed.js
 */
const { Client } = require("pg")
const crypto = require("crypto")

const AUTH_DB_URL   = process.env.AUTH_DB_URL   ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_auth"
const CONFIG_DB_URL = process.env.CONFIG_DB_URL  ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_config"
const ACCOUNTING_DB_URL = process.env.ACCOUNTING_DB_URL ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_accounting"
const INVENTORY_DB_URL  = process.env.INVENTORY_DB_URL  ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_inventory"

async function seed() {
  console.log("NexaBiz Demo Seeder")
  console.log("===================")

  const authClient = new Client({ connectionString: AUTH_DB_URL })
  await authClient.connect()

  // 1. Create demo tenant
  const tenantId = "00000000-0000-0000-0000-000000000001"
  await authClient.query(`
    INSERT INTO tenants (id, name, slug, plan, currency, timezone)
    VALUES ($1, 'NexaBiz Demo Company', 'demo', 'enterprise', 'USD', 'Africa/Harare')
    ON CONFLICT (id) DO NOTHING
  `, [tenantId])
  console.log("  OK Tenant created:", tenantId)

  // 2. Create admin user (password: Admin@123456)
  const bcrypt = require("bcryptjs")
  const passwordHash = await bcrypt.hash("Admin@123456", 12)
  await authClient.query(`
    INSERT INTO users (id, tenant_id, email, password_hash, first_name, last_name, is_active)
    VALUES ('00000000-0000-0000-0000-000000000002', $1, 'admin@nexabiz.demo', $2, 'Admin', 'User', true)
    ON CONFLICT (tenant_id, email) DO NOTHING
  `, [tenantId, passwordHash])
  console.log("  OK Admin user: admin@nexabiz.demo / Admin@123456")

  await authClient.end()

  // 3. Activate all modules for demo tenant
  const configClient = new Client({ connectionString: CONFIG_DB_URL })
  await configClient.connect()
  for (let i = 1; i <= 20; i++) {
    const code = \`MOD-\${String(i).padStart(2, "0")}\`
    await configClient.query(`
      INSERT INTO tenant_modules (tenant_id, module_code, is_active, activated_at, activated_by)
      VALUES ($1, $2, true, NOW(), '00000000-0000-0000-0000-000000000002')
      ON CONFLICT (tenant_id, module_code) DO UPDATE SET is_active=true
    `, [tenantId, code])
  }
  console.log("  OK All 20 modules activated for demo tenant")

  // 4. Seed company settings
  await configClient.query(`
    INSERT INTO company_settings (tenant_id, name, currency, fy_end_month, address, email, invoice_prefix, po_prefix)
    VALUES ($1, 'NexaBiz Demo Company', 'USD', 12, '5393 Aspindale Rd, Tynwald, Harare, Zimbabwe', 'info@nexabiz.demo', 'INV-', 'PO-')
    ON CONFLICT (tenant_id) DO NOTHING
  `, [tenantId])
  await configClient.end()
  console.log("  OK Company settings seeded")

  // 5. Seed chart of accounts
  const accClient = new Client({ connectionString: ACCOUNTING_DB_URL })
  await accClient.connect()
  await accClient.query("SELECT seed_coa($1)", [tenantId])
  await accClient.end()
  console.log("  OK Chart of accounts seeded (27 accounts)")

  // 6. Seed inventory products
  const invClient = new Client({ connectionString: INVENTORY_DB_URL })
  await invClient.connect()
  const warehouseId = "00000000-0000-0000-0000-000000000010"
  await invClient.query(`
    INSERT INTO warehouses (id, tenant_id, name, is_default)
    VALUES ($1, $2, 'Main Warehouse', true)
    ON CONFLICT (id) DO NOTHING
  `, [warehouseId, tenantId])

  const products = [
    { id: "10000000-0000-0000-0000-000000000001", sku: "P001", name: "Coffee",       price: 4.50, cost: 1.80, qty: 50,  icon: "☕" },
    { id: "10000000-0000-0000-0000-000000000002", sku: "P002", name: "Sandwich",     price: 6.00, cost: 2.50, qty: 20,  icon: "🥪" },
    { id: "10000000-0000-0000-0000-000000000003", sku: "P003", name: "Water",        price: 1.50, cost: 0.40, qty: 100, icon: "💧" },
    { id: "10000000-0000-0000-0000-000000000004", sku: "P004", name: "Energy Drink", price: 3.00, cost: 1.20, qty: 30,  icon: "⚡" },
    { id: "10000000-0000-0000-0000-000000000005", sku: "P005", name: "Notebook",     price: 8.00, cost: 3.00, qty: 45,  icon: "📓" },
    { id: "10000000-0000-0000-0000-000000000006", sku: "P006", name: "Pen Pack",     price: 2.50, cost: 0.80, qty: 80,  icon: "🖊️" },
    { id: "10000000-0000-0000-0000-000000000007", sku: "P007", name: "USB Drive",    price: 15.00,cost: 5.80, qty: 15,  icon: "💾" },
    { id: "10000000-0000-0000-0000-000000000008", sku: "P008", name: "Mouse Pad",    price: 12.00,cost: 4.20, qty: 22,  icon: "🖱️" },
    { id: "10000000-0000-0000-0000-000000000009", sku: "P009", name: "Item B (Low)", price: 45.00,cost: 18.00,qty: 4,   icon: "📦" },
    { id: "10000000-0000-0000-0000-000000000010", sku: "P010", name: "Item C (OOS)", price: 8.00, cost: 3.20, qty: 0,   icon: "📦" },
  ]

  for (const p of products) {
    await invClient.query(`
      INSERT INTO products (id, tenant_id, sku, name, price, cost, reorder_level, icon, category, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, 10, $7, 'General', true)
      ON CONFLICT (tenant_id, sku) DO NOTHING
    `, [p.id, tenantId, p.sku, p.name, p.price, p.cost, p.icon])

    await invClient.query(`
      INSERT INTO stock_levels (product_id, warehouse_id, qty)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id, warehouse_id) DO UPDATE SET qty=$3
    `, [p.id, warehouseId, p.qty])
  }
  await invClient.end()
  console.log(\`  OK \${products.length} products seeded with stock levels\`)

  console.log("\n✅ Demo seed complete!")
  console.log("   Login: admin@nexabiz.demo / Admin@123456")
  console.log("   URL:   http://localhost:5173")
}

seed().catch(err => {
  console.error("Seed failed:", err)
  process.exit(1)
})

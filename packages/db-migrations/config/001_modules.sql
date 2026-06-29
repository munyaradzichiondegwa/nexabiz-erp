-- Config DB — Module Registry
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS tenant_modules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  module_code   TEXT NOT NULL,
  module_name   TEXT NOT NULL,
  is_core       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT FALSE,
  activated_at  TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  activated_by  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, module_code)
);

CREATE TABLE IF NOT EXISTS system_settings (
  tenant_id   UUID NOT NULL,
  key         TEXT NOT NULL,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, key)
);

-- Seed all 20 modules (all active by default in dev)
-- In prod this would be per-tenant subscription
DO $$
DECLARE
  dev_tenant UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO tenant_modules (tenant_id, module_code, module_name, is_core, is_active, activated_at) VALUES
    (dev_tenant, 'MOD-01', 'Authentication & Security',  TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-02', 'Dashboard & KPI Hub',        TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-03', 'POS / Sales Engine',         FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-04', 'Inventory Engine',           FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-05', 'Banking & Cash Management',  FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-06', 'Accounting Engine',          TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-07', 'Financial Reporting Suite',  TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-08', 'AI Analytics',               FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-09', 'Procurement',                FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-10', 'CRM',                        FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-11', 'HR & Payroll',               FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-12', 'Multi-Branch',               FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-13', 'Users & Roles',              TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-14', 'Settings & Integrations',    TRUE,  TRUE, NOW()),
    (dev_tenant, 'MOD-15', 'Budgeting',                  FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-16', 'Quotes & Sales Orders',      FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-17', 'Manufacturing',              FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-18', 'Project Accounting',         FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-19', 'Approval Workflows',         FALSE, TRUE, NOW()),
    (dev_tenant, 'MOD-20', 'Service Management',         FALSE, TRUE, NOW())
  ON CONFLICT (tenant_id, module_code) DO NOTHING;
END $$;

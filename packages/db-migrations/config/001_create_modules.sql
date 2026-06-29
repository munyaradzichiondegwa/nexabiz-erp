-- Module registry migrations
\connect nexabiz_config;

CREATE TABLE IF NOT EXISTS module_definitions (
  code        VARCHAR(20)  PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  version     VARCHAR(20)  NOT NULL DEFAULT '1.0.0',
  is_core     BOOLEAN      NOT NULL DEFAULT false,
  dependencies JSONB        NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_modules (
  tenant_id       UUID        NOT NULL,
  module_code     VARCHAR(20) NOT NULL REFERENCES module_definitions(code),
  is_active       BOOLEAN     NOT NULL DEFAULT false,
  activated_at    TIMESTAMPTZ,
  deactivated_at  TIMESTAMPTZ,
  activated_by    UUID,
  config          JSONB       NOT NULL DEFAULT '{}',
  PRIMARY KEY (tenant_id, module_code)
);

CREATE TABLE IF NOT EXISTS company_settings (
  tenant_id       UUID PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  legal_name      VARCHAR(200),
  tax_number      VARCHAR(100),
  vat_number      VARCHAR(100),
  currency        CHAR(3)      NOT NULL DEFAULT 'USD',
  fy_end_month    SMALLINT     NOT NULL DEFAULT 12,
  address         TEXT,
  logo_url        TEXT,
  email           VARCHAR(320),
  phone           VARCHAR(50),
  website         VARCHAR(500),
  invoice_prefix  VARCHAR(20)  NOT NULL DEFAULT 'INV-',
  po_prefix       VARCHAR(20)  NOT NULL DEFAULT 'PO-',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed module definitions
INSERT INTO module_definitions (code, name, description, is_core, dependencies) VALUES
  ('MOD-01', 'Authentication & Security',   'MFA, SSO, RBAC, audit logs',     true,  '[]'),
  ('MOD-02', 'Dashboard & KPI Hub',         'Real-time KPIs, widgets, alerts', true,  '["MOD-01"]'),
  ('MOD-03', 'POS / Sales Engine',          'Touch POS, offline, receipts',    false, '["MOD-01","MOD-04","MOD-06"]'),
  ('MOD-04', 'Inventory Engine',            'Multi-warehouse, FIFO/WAC',       false, '["MOD-01","MOD-06"]'),
  ('MOD-05', 'Banking & Cash Management',   'Reconciliation, bank feeds',      false, '["MOD-01","MOD-06"]'),
  ('MOD-06', 'Accounting Engine',           'Double-entry GL, AR, AP, FA',     true,  '["MOD-01"]'),
  ('MOD-07', 'Financial Reporting Suite',   'GAAP/IFRS reports, export',       true,  '["MOD-06"]'),
  ('MOD-08', 'AI Analytics & Intelligence', 'Forecasting, anomaly detection',  false, '["MOD-07"]'),
  ('MOD-09', 'Procurement',                 'PO, GRN, 3-way match',            false, '["MOD-04","MOD-06"]'),
  ('MOD-10', 'CRM',                         'Customer profiles, pipeline',     false, '["MOD-01"]'),
  ('MOD-11', 'HR & Payroll',                'Payroll engine, leave',           false, '["MOD-01","MOD-06"]'),
  ('MOD-12', 'Multi-Branch Management',     'Consolidated reporting',          false, '["MOD-02"]'),
  ('MOD-13', 'User & Role Management',      'RBAC, permissions',              true,  '["MOD-01"]'),
  ('MOD-14', 'Settings & Integrations',     'Company, modules, APIs',          true,  '["MOD-01"]'),
  ('MOD-15', 'Budgeting',                   'Budget vs actual',                false, '["MOD-07"]'),
  ('MOD-16', 'Quotes & Sales Orders',       'Quote-to-cash pipeline',          false, '["MOD-10","MOD-04"]'),
  ('MOD-17', 'Manufacturing',               'BOM, work orders',                false, '["MOD-04","MOD-06"]'),
  ('MOD-18', 'Project Accounting',          'Cost tracking, billing',          false, '["MOD-06"]'),
  ('MOD-19', 'Approval Workflow Engine',    'Multi-level approvals',           false, '["MOD-01"]'),
  ('MOD-20', 'Service Management',          'Service desk, maintenance',       false, '["MOD-10","MOD-04"]')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON tenant_modules(tenant_id);

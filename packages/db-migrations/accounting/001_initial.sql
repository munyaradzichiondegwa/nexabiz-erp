-- Accounting DB — Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('Asset','Liability','Equity','Revenue','Expense')),
  parent_id   UUID REFERENCES chart_of_accounts(id),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS fiscal_periods (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ar_invoices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  number        TEXT NOT NULL,
  customer_id   UUID,
  amount        NUMERIC(18,4) NOT NULL,
  tax_amount    NUMERIC(18,4) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'USD',
  due_date      DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',
  gl_posted     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, number)
);

CREATE TABLE IF NOT EXISTS ap_bills (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  number        TEXT NOT NULL,
  supplier_id   UUID,
  amount        NUMERIC(18,4) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  due_date      DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft',
  po_id         UUID,
  grn_matched   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, number)
);

CREATE INDEX IF NOT EXISTS idx_ar_tenant_status ON ar_invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ap_tenant_status ON ap_bills(tenant_id, status);

\connect nexabiz_accounting;

CREATE TABLE IF NOT EXISTS budgets (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL,
  fiscal_year  SMALLINT NOT NULL,
  account_code VARCHAR(20) NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  jan   NUMERIC(18,4) NOT NULL DEFAULT 0,
  feb   NUMERIC(18,4) NOT NULL DEFAULT 0,
  mar   NUMERIC(18,4) NOT NULL DEFAULT 0,
  apr   NUMERIC(18,4) NOT NULL DEFAULT 0,
  may   NUMERIC(18,4) NOT NULL DEFAULT 0,
  jun   NUMERIC(18,4) NOT NULL DEFAULT 0,
  jul   NUMERIC(18,4) NOT NULL DEFAULT 0,
  aug   NUMERIC(18,4) NOT NULL DEFAULT 0,
  sep   NUMERIC(18,4) NOT NULL DEFAULT 0,
  oct   NUMERIC(18,4) NOT NULL DEFAULT 0,
  nov   NUMERIC(18,4) NOT NULL DEFAULT 0,
  dec   NUMERIC(18,4) NOT NULL DEFAULT 0,
  total NUMERIC(18,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, fiscal_year, account_code)
);

CREATE INDEX IF NOT EXISTS idx_budgets_tenant_year ON budgets(tenant_id, fiscal_year);

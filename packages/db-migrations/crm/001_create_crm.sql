\connect nexabiz_crm;

CREATE TABLE IF NOT EXISTS customers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL,
  name              VARCHAR(200) NOT NULL,
  email             VARCHAR(320),
  phone             VARCHAR(50),
  address           TEXT,
  tax_number        VARCHAR(100),
  credit_limit      NUMERIC(18,4) NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC(18,4) NOT NULL DEFAULT 0,
  total_spend       NUMERIC(18,4) NOT NULL DEFAULT 0,
  last_order_date   TIMESTAMPTZ,
  segment           VARCHAR(50) NOT NULL DEFAULT 'New',
  account_id        UUID,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(320),
  phone       VARCHAR(50),
  role        VARCHAR(100),
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL,
  customer_id  UUID REFERENCES customers(id),
  name         VARCHAR(200) NOT NULL,
  value        NUMERIC(18,4),
  stage        VARCHAR(50) NOT NULL DEFAULT 'Prospecting',
  probability  SMALLINT DEFAULT 10,
  close_date   DATE,
  assigned_to  UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL,
  customer_id  UUID REFERENCES customers(id),
  type         VARCHAR(50) NOT NULL,
  subject      VARCHAR(200) NOT NULL,
  notes        TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by   UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant        ON customers(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_customers_segment       ON customers(tenant_id, segment);
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant    ON opportunities(tenant_id, stage);

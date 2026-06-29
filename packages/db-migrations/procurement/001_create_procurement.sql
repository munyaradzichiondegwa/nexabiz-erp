\connect nexabiz_procurement;

CREATE TABLE IF NOT EXISTS suppliers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  name          VARCHAR(200) NOT NULL,
  email         VARCHAR(320),
  phone         VARCHAR(50),
  address       TEXT,
  tax_number    VARCHAR(100),
  payment_terms SMALLINT NOT NULL DEFAULT 30,
  account_id    UUID,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  number          VARCHAR(50) NOT NULL,
  supplier_id     UUID REFERENCES suppliers(id),
  supplier        VARCHAR(200) NOT NULL,
  total           NUMERIC(18,4) NOT NULL DEFAULT 0,
  status          VARCHAR(30) NOT NULL DEFAULT 'Draft'
                  CHECK (status IN ('Draft','Sent','Received','Matched','Cancelled')),
  expected_date   DATE,
  received_date   DATE,
  gl_ref          UUID,
  notes           TEXT,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE TABLE IF NOT EXISTS po_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id      UUID,
  description     VARCHAR(300) NOT NULL,
  qty             NUMERIC(18,4) NOT NULL,
  unit_cost       NUMERIC(18,4) NOT NULL,
  received_qty    NUMERIC(18,4) NOT NULL DEFAULT 0,
  total           NUMERIC(18,4) NOT NULL
);

CREATE TABLE IF NOT EXISTS grn_receipts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  po_id       UUID NOT NULL REFERENCES purchase_orders(id),
  number      VARCHAR(50) NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_by UUID
);

CREATE INDEX IF NOT EXISTS idx_pos_tenant_status ON purchase_orders(tenant_id, status);

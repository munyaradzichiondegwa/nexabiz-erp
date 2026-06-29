\connect nexabiz_inventory;

CREATE TABLE IF NOT EXISTS warehouses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  address     TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  sku             VARCHAR(100) NOT NULL,
  name            VARCHAR(300) NOT NULL,
  description     TEXT,
  category        VARCHAR(100),
  price           NUMERIC(18,4) NOT NULL DEFAULT 0,
  cost            NUMERIC(18,4) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
  costing_method  VARCHAR(20) NOT NULL DEFAULT 'FIFO' CHECK (costing_method IN ('FIFO','WAC','Standard')),
  reorder_level   INTEGER NOT NULL DEFAULT 0,
  icon            VARCHAR(10),
  inventory_account_id  UUID,
  cogs_account_id       UUID,
  revenue_account_id    UUID,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS stock_levels (
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id  UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  qty           NUMERIC(18,4) NOT NULL DEFAULT 0,
  reserved_qty  NUMERIC(18,4) NOT NULL DEFAULT 0,
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  product_id      UUID NOT NULL REFERENCES products(id),
  warehouse_id    UUID REFERENCES warehouses(id),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('IN','OUT','ADJUST','TRANSFER')),
  qty             NUMERIC(18,4) NOT NULL,
  unit_cost       NUMERIC(18,4),
  reference       VARCHAR(100),
  source          VARCHAR(50),
  source_id       UUID,
  reason          TEXT,
  gl_ref          UUID,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_tenant     ON products(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku        ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_stock_levels_low    ON stock_levels(product_id) WHERE qty <= 0;
CREATE INDEX IF NOT EXISTS idx_movements_product   ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movements_tenant    ON stock_movements(tenant_id, created_at DESC);

-- Inventory DB — Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS warehouses (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name      TEXT NOT NULL,
  location  TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  sku             TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  unit_cost       NUMERIC(18,4) NOT NULL DEFAULT 0,
  unit_price      NUMERIC(18,4) NOT NULL DEFAULT 0,
  costing_method  TEXT NOT NULL DEFAULT 'FIFO' CHECK (costing_method IN ('FIFO','WAC','Standard')),
  reorder_level   INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS stock_levels (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  qty          NUMERIC(18,4) NOT NULL DEFAULT 0,
  avg_cost     NUMERIC(18,4) NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  product_id    UUID NOT NULL REFERENCES products(id),
  warehouse_id  UUID NOT NULL REFERENCES warehouses(id),
  type          TEXT NOT NULL CHECK (type IN ('IN','OUT','ADJUST','TRANSFER')),
  qty           NUMERIC(18,4) NOT NULL,
  unit_cost     NUMERIC(18,4) NOT NULL DEFAULT 0,
  reference     TEXT,
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_tenant         ON products(tenant_id, is_active);

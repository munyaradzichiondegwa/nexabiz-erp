\connect nexabiz_inventory;

CREATE TABLE IF NOT EXISTS bill_of_materials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  product_id  UUID REFERENCES products(id),
  qty_produced NUMERIC(18,4) NOT NULL DEFAULT 1,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bom_lines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bom_id        UUID NOT NULL REFERENCES bill_of_materials(id) ON DELETE CASCADE,
  component_id  UUID NOT NULL REFERENCES products(id),
  qty_required  NUMERIC(18,4) NOT NULL,
  unit          VARCHAR(20) DEFAULT 'unit'
);

CREATE TABLE IF NOT EXISTS work_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  number          VARCHAR(50) NOT NULL,
  bom_id          UUID REFERENCES bill_of_materials(id),
  qty             NUMERIC(18,4) NOT NULL,
  status          VARCHAR(30) NOT NULL DEFAULT 'Planned'
                  CHECK (status IN ('Planned','In Progress','Completed','Cancelled')),
  scheduled_start DATE,
  scheduled_end   DATE,
  actual_start    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  gl_ref          UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON work_orders(tenant_id, status);

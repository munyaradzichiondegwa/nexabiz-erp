\connect nexabiz_sales;

CREATE TABLE IF NOT EXISTS sales_orders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  number        VARCHAR(50) NOT NULL,
  type          VARCHAR(20) NOT NULL DEFAULT 'sales_order'
                CHECK (type IN ('quote','sales_order')),
  customer_id   UUID,
  customer_name VARCHAR(200) NOT NULL,
  total         NUMERIC(18,4) NOT NULL DEFAULT 0,
  status        VARCHAR(30) NOT NULL DEFAULT 'Draft'
                CHECK (status IN ('Draft','Confirmed','Invoiced','Delivered','Cancelled')),
  valid_until   DATE,
  gl_ref        UUID,
  notes         TEXT,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE TABLE IF NOT EXISTS so_lines (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  so_id       UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id  UUID,
  description VARCHAR(300) NOT NULL,
  qty         NUMERIC(18,4) NOT NULL,
  unit_price  NUMERIC(18,4) NOT NULL,
  discount    NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,
  total       NUMERIC(18,4) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_tenant ON sales_orders(tenant_id, status);

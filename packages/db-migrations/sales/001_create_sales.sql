\connect nexabiz_sales;

CREATE TABLE IF NOT EXISTS customers_ref (
  id          UUID PRIMARY KEY,
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  email       VARCHAR(320),
  credit_limit NUMERIC(18,4) NOT NULL DEFAULT 0,
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  order_number    VARCHAR(50) NOT NULL,
  customer_id     UUID REFERENCES customers_ref(id),
  cashier_id      UUID NOT NULL,
  branch_id       UUID,
  subtotal        NUMERIC(18,4) NOT NULL,
  discount_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(18,4) NOT NULL DEFAULT 0,
  total           NUMERIC(18,4) NOT NULL,
  payment_method  VARCHAR(30) NOT NULL,
  payment_status  VARCHAR(20) NOT NULL DEFAULT 'paid',
  status          VARCHAR(20) NOT NULL DEFAULT 'completed',
  gl_ref          UUID,
  receipt_id      UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, order_number)
);

CREATE TABLE IF NOT EXISTS order_lines (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL,
  product_name    VARCHAR(300) NOT NULL,
  qty             NUMERIC(18,4) NOT NULL,
  unit_price      NUMERIC(18,4) NOT NULL,
  discount        NUMERIC(18,4) NOT NULL DEFAULT 0,
  tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
  total           NUMERIC(18,4) NOT NULL
);

CREATE TABLE IF NOT EXISTS receipts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  order_id        UUID NOT NULL REFERENCES orders(id),
  receipt_number  VARCHAR(50) NOT NULL,
  printed_at      TIMESTAMPTZ,
  emailed_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_date     ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_cashier         ON orders(cashier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_lines_order      ON order_lines(order_id);

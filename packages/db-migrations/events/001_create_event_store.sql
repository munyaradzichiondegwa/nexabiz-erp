-- MongoDB is used as the event store; this seeds ClickHouse for analytics
-- Run against ClickHouse HTTP interface, not PostgreSQL

CREATE DATABASE IF NOT EXISTS nexabiz_analytics;

CREATE TABLE IF NOT EXISTS nexabiz_analytics.sales_events (
  tenant_id      String,
  order_id       String,
  cashier_id     String,
  branch_id      String,
  total          Float64,
  payment_method LowCardinality(String),
  line_count     UInt8,
  created_at     DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (tenant_id, created_at);

CREATE TABLE IF NOT EXISTS nexabiz_analytics.gl_postings (
  tenant_id   String,
  entry_id    String,
  ref         String,
  source      LowCardinality(String),
  total_debit Float64,
  posted_at   DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(posted_at)
ORDER BY (tenant_id, posted_at);

CREATE TABLE IF NOT EXISTS nexabiz_analytics.inventory_movements (
  tenant_id    String,
  product_id   String,
  product_name String,
  type         LowCardinality(String),
  qty          Float64,
  created_at   DateTime
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_at)
ORDER BY (tenant_id, created_at);

CREATE TABLE IF NOT EXISTS nexabiz_analytics.hr_events (
  tenant_id      String,
  payroll_run_id String,
  period         String,
  year           UInt16,
  total_gross    Float64,
  total_net      Float64,
  employee_count UInt16,
  processed_at   DateTime
) ENGINE = MergeTree()
ORDER BY (tenant_id, year, period);

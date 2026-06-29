import { Pool } from "pg"
import { logger } from "./logger"

export async function runMigrations(db: Pool) {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS gl_entries (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant_id       UUID NOT NULL,
      posting_date    DATE NOT NULL,
      ref             TEXT NOT NULL,
      source_event    TEXT NOT NULL,
      source_id       TEXT NOT NULL,
      account_code    TEXT NOT NULL,
      account_name    TEXT NOT NULL,
      description     TEXT NOT NULL,
      debit           NUMERIC(18,4) NOT NULL DEFAULT 0,
      credit          NUMERIC(18,4) NOT NULL DEFAULT 0,
      currency        TEXT NOT NULL DEFAULT 'USD',
      fx_rate         NUMERIC(12,6) NOT NULL DEFAULT 1,
      posted_by       TEXT NOT NULL DEFAULT 'system',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS gl_posting_rules (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_type    TEXT NOT NULL UNIQUE,
      rule_config   JSONB NOT NULL,
      is_active     BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS gl_idempotency (
      event_id    TEXT PRIMARY KEY,
      posted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_gl_entries_tenant_date  ON gl_entries(tenant_id, posting_date DESC);
    CREATE INDEX IF NOT EXISTS idx_gl_entries_source       ON gl_entries(source_event, source_id);
    CREATE INDEX IF NOT EXISTS idx_gl_entries_account      ON gl_entries(account_code, posting_date DESC);

    -- Seed default posting rules
    INSERT INTO gl_posting_rules (event_type, rule_config) VALUES
    ('SaleCompleted',   '{"lines":[{"account":"1100","name":"Accounts Receivable","type":"DR","field":"amount"},{"account":"4000","name":"Sales Revenue","type":"CR","field":"amount"},{"account":"5000","name":"COGS","type":"DR","field":"cost"},{"account":"1300","name":"Inventory","type":"CR","field":"cost"}]}'),
    ('PaymentReceived', '{"lines":[{"account":"1000","name":"Bank / Cash","type":"DR","field":"amount"},{"account":"1100","name":"Accounts Receivable","type":"CR","field":"amount"}]}'),
    ('POReceived',      '{"lines":[{"account":"1300","name":"Inventory","type":"DR","field":"amount"},{"account":"2000","name":"Accounts Payable","type":"CR","field":"amount"}]}'),
    ('PayrollRun',      '{"lines":[{"account":"6200","name":"Payroll Expense","type":"DR","field":"grossPay"},{"account":"1000","name":"Bank / Cash","type":"CR","field":"netPay"},{"account":"2100","name":"PAYE Payable","type":"CR","field":"paye"}]}'),
    ('DepreciationRun', '{"lines":[{"account":"6500","name":"Depreciation Expense","type":"DR","field":"amount"},{"account":"1610","name":"Accumulated Depreciation","type":"CR","field":"amount"}]}'),
    ('WOCompleted',     '{"lines":[{"account":"1400","name":"Finished Goods","type":"DR","field":"totalCost"},{"account":"1350","name":"WIP","type":"CR","field":"totalCost"}]}'),
    ('ServiceInvoiced', '{"lines":[{"account":"1100","name":"Accounts Receivable","type":"DR","field":"amount"},{"account":"4100","name":"Service Revenue","type":"CR","field":"amount"}]}')
    ON CONFLICT (event_type) DO NOTHING;
  `)
  logger.info("GL Integration migrations applied")
}

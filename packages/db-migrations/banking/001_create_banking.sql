\connect nexabiz_banking;

CREATE TABLE IF NOT EXISTS bank_accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  bank_name   VARCHAR(200) NOT NULL,
  account_number VARCHAR(100),
  currency    CHAR(3) NOT NULL DEFAULT 'USD',
  gl_account_id UUID,
  balance     NUMERIC(18,4) NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  status      VARCHAR(30) NOT NULL DEFAULT 'active',
  last_reconciled_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  account_id      UUID NOT NULL REFERENCES bank_accounts(id),
  date            DATE NOT NULL,
  description     TEXT NOT NULL,
  type            VARCHAR(10) NOT NULL CHECK (type IN ('credit','debit')),
  amount          NUMERIC(18,4) NOT NULL,
  running_balance NUMERIC(18,4),
  reference       VARCHAR(200),
  match_status    VARCHAR(20) NOT NULL DEFAULT 'unmatched' CHECK (match_status IN ('matched','unmatched','excluded')),
  matched_gl_ref  UUID,
  imported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  account_id      UUID NOT NULL REFERENCES bank_accounts(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  opening_balance NUMERIC(18,4) NOT NULL,
  closing_balance NUMERIC(18,4) NOT NULL,
  matched_count   INTEGER NOT NULL DEFAULT 0,
  unmatched_count INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  completed_at    TIMESTAMPTZ,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_txn_account_date ON bank_transactions(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_txn_unmatched    ON bank_transactions(tenant_id, match_status) WHERE match_status = 'unmatched';

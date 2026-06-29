-- Accounting Engine migrations
\connect nexabiz_accounting;

-- Chart of accounts
CREATE TABLE IF NOT EXISTS accounts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        NOT NULL,
  code        VARCHAR(20) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
  subtype     VARCHAR(50),
  is_control  BOOLEAN     NOT NULL DEFAULT false,
  parent_id   UUID        REFERENCES accounts(id),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

-- General Ledger
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL,
  ref             VARCHAR(50),
  date            DATE        NOT NULL,
  description     TEXT        NOT NULL,
  total_debit     NUMERIC(18,4) NOT NULL,
  total_credit    NUMERIC(18,4) NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'posted' CHECK (status IN ('draft','posted','reversed')),
  source          VARCHAR(50)  NOT NULL,
  source_id       UUID,
  correlation_id  UUID,
  posted_at       TIMESTAMPTZ,
  posted_by       UUID,
  reversed_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT balanced CHECK (total_debit = total_credit)
);

CREATE TABLE IF NOT EXISTS journal_lines (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id  UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES accounts(id),
  debit             NUMERIC(18,4) NOT NULL DEFAULT 0,
  credit            NUMERIC(18,4) NOT NULL DEFAULT 0,
  description       TEXT,
  entity_id         UUID,
  entity_type       VARCHAR(50),
  CONSTRAINT non_negative_dr CHECK (debit >= 0),
  CONSTRAINT non_negative_cr CHECK (credit >= 0),
  CONSTRAINT xor_dr_cr CHECK (NOT (debit > 0 AND credit > 0))
);

-- AR
CREATE TABLE IF NOT EXISTS ar_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  number          VARCHAR(50) NOT NULL,
  customer_id     UUID,
  customer_name   VARCHAR(200),
  subtotal        NUMERIC(18,4) NOT NULL,
  tax_amount      NUMERIC(18,4) NOT NULL DEFAULT 0,
  total           NUMERIC(18,4) NOT NULL,
  amount_paid     NUMERIC(18,4) NOT NULL DEFAULT 0,
  due_date        DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','partial','paid','overdue','cancelled')),
  gl_ref          UUID REFERENCES journal_entries(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

-- AP
CREATE TABLE IF NOT EXISTS ap_bills (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  number          VARCHAR(50) NOT NULL,
  supplier_id     UUID,
  supplier_name   VARCHAR(200),
  subtotal        NUMERIC(18,4) NOT NULL,
  tax_amount      NUMERIC(18,4) NOT NULL DEFAULT 0,
  total           NUMERIC(18,4) NOT NULL,
  amount_paid     NUMERIC(18,4) NOT NULL DEFAULT 0,
  due_date        DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','partial','paid','overdue')),
  gl_ref          UUID REFERENCES journal_entries(id),
  po_id           UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

-- Fixed Assets
CREATE TABLE IF NOT EXISTS fixed_assets (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID NOT NULL,
  name                    VARCHAR(200) NOT NULL,
  category                VARCHAR(100),
  serial_number           VARCHAR(100),
  purchase_date           DATE NOT NULL,
  purchase_cost           NUMERIC(18,4) NOT NULL,
  useful_life_years       SMALLINT NOT NULL,
  depreciation_method     VARCHAR(30) NOT NULL DEFAULT 'straight_line',
  current_value           NUMERIC(18,4) NOT NULL,
  accumulated_depreciation NUMERIC(18,4) NOT NULL DEFAULT 0,
  status                  VARCHAR(30) NOT NULL DEFAULT 'active',
  asset_account_id        UUID REFERENCES accounts(id),
  depreciation_account_id UUID REFERENCES accounts(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default chart of accounts (standard for SME)
CREATE OR REPLACE FUNCTION seed_coa(p_tenant_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO accounts (tenant_id, code, name, type, subtype, is_control) VALUES
    (p_tenant_id, '1000', 'Cash',                   'asset',     'current',     false),
    (p_tenant_id, '1010', 'FBC Bank - Operating',   'asset',     'current',     false),
    (p_tenant_id, '1100', 'Accounts Receivable',    'asset',     'current',     true),
    (p_tenant_id, '1200', 'Petty Cash',             'asset',     'current',     false),
    (p_tenant_id, '1300', 'Inventory',              'asset',     'current',     true),
    (p_tenant_id, '1400', 'Prepaid Expenses',       'asset',     'current',     false),
    (p_tenant_id, '1500', 'Fixed Assets - Cost',    'asset',     'noncurrent',  false),
    (p_tenant_id, '1510', 'Accumulated Depreciation','asset',   'noncurrent',  false),
    (p_tenant_id, '2000', 'Accounts Payable',       'liability', 'current',     true),
    (p_tenant_id, '2100', 'Accrued Expenses',       'liability', 'current',     false),
    (p_tenant_id, '2200', 'VAT Payable',            'liability', 'current',     false),
    (p_tenant_id, '2300', 'Payroll Liabilities',   'liability', 'current',     false),
    (p_tenant_id, '2400', 'Loans Payable',          'liability', 'noncurrent',  false),
    (p_tenant_id, '3000', 'Share Capital',          'equity',    'capital',     false),
    (p_tenant_id, '3100', 'Retained Earnings',      'equity',    'retained',    false),
    (p_tenant_id, '4000', 'Sales Revenue',          'revenue',   'operating',   false),
    (p_tenant_id, '4100', 'Service Revenue',        'revenue',   'operating',   false),
    (p_tenant_id, '4900', 'Other Income',           'revenue',   'other',       false),
    (p_tenant_id, '5000', 'Cost of Goods Sold',     'expense',   'cogs',        false),
    (p_tenant_id, '6000', 'Salaries & Wages',       'expense',   'payroll',     false),
    (p_tenant_id, '6100', 'Rent',                   'expense',   'occupancy',   false),
    (p_tenant_id, '6200', 'Utilities',              'expense',   'occupancy',   false),
    (p_tenant_id, '6300', 'Marketing',              'expense',   'selling',     false),
    (p_tenant_id, '6400', 'Depreciation',           'expense',   'non_cash',    false),
    (p_tenant_id, '6500', 'Office Expenses',        'expense',   'admin',       false),
    (p_tenant_id, '6600', 'Interest Expense',       'expense',   'finance',     false),
    (p_tenant_id, '6900', 'Other Expenses',         'expense',   'other',       false)
  ON CONFLICT (tenant_id, code) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant_date ON journal_entries(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source      ON journal_entries(source, source_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry         ON journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account       ON journal_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_tenant_status   ON ar_invoices(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ap_bills_tenant_status      ON ap_bills(tenant_id, status);

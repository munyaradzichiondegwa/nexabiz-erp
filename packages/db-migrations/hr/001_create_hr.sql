\connect nexabiz_hr;

CREATE TABLE IF NOT EXISTS departments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  manager_id  UUID,
  cost_centre VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL,
  employee_number   VARCHAR(50) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(320),
  phone             VARCHAR(50),
  role              VARCHAR(200),
  department_id     UUID REFERENCES departments(id),
  branch_id         UUID,
  salary            NUMERIC(14,4) NOT NULL DEFAULT 0,
  pay_frequency     VARCHAR(20) NOT NULL DEFAULT 'monthly',
  tax_code          VARCHAR(50),
  bank_account      VARCHAR(100),
  bank_name         VARCHAR(100),
  national_id       VARCHAR(100),
  start_date        DATE NOT NULL,
  end_date          DATE,
  status            VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','on_leave','terminated','suspended')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, employee_number)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  period          VARCHAR(20) NOT NULL,
  year            SMALLINT NOT NULL,
  total_gross     NUMERIC(14,4) NOT NULL,
  total_deductions NUMERIC(14,4) NOT NULL,
  total_net       NUMERIC(14,4) NOT NULL,
  employee_count  INTEGER NOT NULL,
  gl_ref          UUID,
  status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','paid')),
  processed_at    TIMESTAMPTZ,
  processed_by    UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payslips (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id  UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  gross_pay       NUMERIC(14,4) NOT NULL,
  paye_tax        NUMERIC(14,4) NOT NULL DEFAULT 0,
  nssa            NUMERIC(14,4) NOT NULL DEFAULT 0,
  pension         NUMERIC(14,4) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(14,4) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(14,4) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  employee_id     UUID NOT NULL REFERENCES employees(id),
  type            VARCHAR(50) NOT NULL,
  from_date       DATE NOT NULL,
  to_date         DATE NOT NULL,
  days            SMALLINT NOT NULL,
  reason          TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_tenant     ON employees(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_tenant  ON payroll_runs(tenant_id, year, period);
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp   ON leave_requests(employee_id, status);

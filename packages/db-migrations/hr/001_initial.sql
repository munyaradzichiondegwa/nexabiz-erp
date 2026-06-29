-- HR DB — Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS departments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name      TEXT NOT NULL,
  head_id   UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id      UUID NOT NULL,
  user_id        UUID,
  employee_number TEXT NOT NULL,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL,
  department_id  UUID REFERENCES departments(id),
  role           TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  start_date     DATE NOT NULL,
  end_date       DATE,
  basic_salary   NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'USD',
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, employee_number)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL,
  month           TEXT NOT NULL,
  year            INT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft',
  gross_pay       NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_pay         NUMERIC(18,2) NOT NULL DEFAULT 0,
  paye            NUMERIC(18,2) NOT NULL DEFAULT 0,
  nssa            NUMERIC(18,2) NOT NULL DEFAULT 0,
  gl_posted       BOOLEAN NOT NULL DEFAULT FALSE,
  kafka_event_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, month, year)
);

CREATE TABLE IF NOT EXISTS payroll_lines (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id   UUID NOT NULL REFERENCES employees(id),
  gross_pay     NUMERIC(18,2) NOT NULL,
  paye          NUMERIC(18,2) NOT NULL DEFAULT 0,
  nssa          NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_pay       NUMERIC(18,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id, status);

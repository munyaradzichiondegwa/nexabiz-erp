\connect nexabiz_projects;

CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  customer_id   UUID,
  manager_id    UUID,
  budget        NUMERIC(18,4),
  spent         NUMERIC(18,4) NOT NULL DEFAULT 0,
  start_date    DATE,
  end_date      DATE,
  status        VARCHAR(30) NOT NULL DEFAULT 'active'
                CHECK (status IN ('draft','active','on_hold','completed','cancelled')),
  billing_type  VARCHAR(30) DEFAULT 'fixed' CHECK (billing_type IN ('fixed','time_material','retainer')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  assigned_to UUID,
  hours_est   NUMERIC(8,2) DEFAULT 0,
  hours_actual NUMERIC(8,2) DEFAULT 0,
  status      VARCHAR(20) DEFAULT 'todo'
              CHECK (status IN ('todo','in_progress','done','blocked')),
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  project_id  UUID REFERENCES projects(id),
  task_id     UUID REFERENCES project_tasks(id),
  user_id     UUID NOT NULL,
  hours       NUMERIC(6,2) NOT NULL,
  description TEXT,
  date        DATE NOT NULL,
  billable    BOOLEAN DEFAULT true,
  billed      BOOLEAN DEFAULT false,
  rate        NUMERIC(10,2),
  gl_ref      UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_tenant   ON projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_proj ON time_entries(project_id, date DESC);

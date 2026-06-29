\connect nexabiz_workflow;

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  name        VARCHAR(200) NOT NULL,
  trigger_on  VARCHAR(100) NOT NULL,
  steps       JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL,
  workflow_id           UUID NOT NULL REFERENCES workflow_definitions(id),
  entity_type           VARCHAR(50) NOT NULL,
  entity_id             UUID NOT NULL,
  entity_data           JSONB,
  current_step          SMALLINT NOT NULL DEFAULT 1,
  current_step_approver UUID,
  status                VARCHAR(30) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by           UUID,
  approved_at           TIMESTAMPTZ,
  approver_comment      TEXT,
  submitted_by          UUID NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id     UUID NOT NULL REFERENCES workflow_instances(id),
  step            SMALLINT NOT NULL,
  action          VARCHAR(30) NOT NULL,
  actor_id        UUID NOT NULL,
  comment         TEXT,
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default approval workflows
CREATE OR REPLACE FUNCTION seed_default_workflows(p_tenant_id UUID) RETURNS void AS $$
BEGIN
  INSERT INTO workflow_definitions (tenant_id, name, trigger_on, steps) VALUES
    (p_tenant_id, 'PO Approval', 'purchase_order.created', '[{"step":1,"role":"manager","label":"Manager Approval"},{"step":2,"role":"cfo","label":"CFO Approval for PO > $5000"}]'),
    (p_tenant_id, 'Journal Entry Approval', 'journal_entry.posted', '[{"step":1,"role":"accountant","label":"Accountant Review"},{"step":2,"role":"cfo","label":"CFO Sign-off"}]'),
    (p_tenant_id, 'Leave Request', 'leave.requested', '[{"step":1,"role":"manager","label":"Manager Approval"}]')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_workflow_instances_tenant   ON workflow_instances(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_approver ON workflow_instances(current_step_approver, status);

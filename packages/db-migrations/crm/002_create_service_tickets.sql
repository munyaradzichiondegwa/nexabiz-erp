\connect nexabiz_crm;

CREATE TABLE IF NOT EXISTS service_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  number      VARCHAR(50) NOT NULL,
  subject     VARCHAR(300) NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES customers(id),
  asset_id    UUID,
  priority    VARCHAR(20) NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('low','medium','high','critical')),
  status      VARCHAR(30) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, number)
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id   UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  comment     TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_tenant_status ON service_tickets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned      ON service_tickets(assigned_to, status);

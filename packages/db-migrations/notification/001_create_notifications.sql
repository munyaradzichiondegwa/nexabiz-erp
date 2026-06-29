-- Notification tracking (stored in PostgreSQL config DB)
\connect nexabiz_config;

CREATE TABLE IF NOT EXISTS notification_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL,
  user_id     UUID,
  channel     VARCHAR(20) NOT NULL CHECK (channel IN ('email','sms','push','webhook')),
  template    VARCHAR(100),
  subject     VARCHAR(300),
  recipient   VARCHAR(320) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','sent','failed','bounced')),
  error       TEXT,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  tenant_id   UUID NOT NULL,
  user_id     UUID NOT NULL,
  channel     VARCHAR(20) NOT NULL,
  event_type  VARCHAR(100) NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (tenant_id, user_id, channel, event_type)
);

-- Default notification preference templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(100) UNIQUE NOT NULL,
  channel     VARCHAR(20) NOT NULL,
  subject     TEXT,
  body        TEXT NOT NULL,
  variables   JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed core notification templates
INSERT INTO notification_templates (code, channel, subject, body, variables) VALUES
  ('low_stock_alert', 'email', 'Low Stock Alert: {{productName}}',
   'Hi {{recipientName}},

This is an automated alert from NexaBiz ERP.

Product: {{productName}} (SKU: {{sku}}) is running low.
Current stock: {{currentQty}} units
Reorder level: {{reorderLevel}} units

Please raise a purchase order to replenish stock.

NexaBiz ERP',
   '["productName","sku","currentQty","reorderLevel","recipientName"]'),
  ('payroll_complete', 'email', 'Payroll Run Complete — {{period}} {{year}}',
   'Hi {{recipientName}},

Payroll for {{period}} {{year}} has been processed successfully.

Total Employees: {{employeeCount}}
Gross Pay: {{totalGross}}
Net Pay: {{totalNet}}

GL entries have been posted automatically.

NexaBiz ERP',
   '["period","year","employeeCount","totalGross","totalNet","recipientName"]'),
  ('invoice_reminder', 'email', 'Payment Reminder: Invoice {{invoiceNumber}} Due {{dueDate}}',
   'Dear {{customerName}},

This is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.

Please arrange payment at your earliest convenience.

Kind regards,
{{companyName}}',
   '["customerName","invoiceNumber","amount","dueDate","companyName"]'),
  ('gl_posted', 'push', NULL,
   'GL entry {{ref}} posted: DR {{totalDebit}} CR {{totalCredit}}',
   '["ref","totalDebit","totalCredit"]')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_notif_logs_tenant ON notification_logs(tenant_id, created_at DESC);

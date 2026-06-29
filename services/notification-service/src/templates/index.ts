/**
 * Notification template renderer
 * Replaces {{variable}} placeholders in template strings
 */

export function renderTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`
  })
}

export const EMAIL_TEMPLATES = {
  LOW_STOCK: {
    subject: "Low Stock Alert: {{productName}}",
    html: `<h2>Low Stock Alert</h2>
<p>Product <strong>{{productName}}</strong> (SKU: {{sku}}) is running low.</p>
<ul>
  <li>Current stock: <strong>{{currentQty}}</strong> units</li>
  <li>Reorder level: {{reorderLevel}} units</li>
</ul>
<p>Please raise a purchase order to replenish stock.</p>
<p>— NexaBiz ERP</p>`,
  },
  PAYROLL_COMPLETE: {
    subject: "Payroll Run Complete — {{period}} {{year}}",
    html: `<h2>Payroll Processed Successfully</h2>
<table>
  <tr><td>Period:</td><td><strong>{{period}} {{year}}</strong></td></tr>
  <tr><td>Employees:</td><td>{{employeeCount}}</td></tr>
  <tr><td>Gross Pay:</td><td>{{totalGross}}</td></tr>
  <tr><td>Net Pay:</td><td><strong>{{totalNet}}</strong></td></tr>
</table>
<p>GL entries have been posted automatically.</p>
<p>— NexaBiz ERP</p>`,
  },
  INVOICE_REMINDER: {
    subject: "Payment Reminder: Invoice {{invoiceNumber}}",
    html: `<p>Dear {{customerName}},</p>
<p>Invoice <strong>{{invoiceNumber}}</strong> for <strong>{{amount}}</strong> is due on {{dueDate}}.</p>
<p>Please arrange payment at your earliest convenience.</p>
<p>Kind regards,<br>{{companyName}}</p>`,
  },
  GL_POSTED: {
    subject: "GL Entry Posted: {{ref}}",
    html: `<p>Journal entry <strong>{{ref}}</strong> has been posted.</p>
<ul><li>Total DR/CR: {{totalDebit}}</li></ul>`,
  },
}

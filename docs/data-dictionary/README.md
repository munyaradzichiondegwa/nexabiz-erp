# NexaBiz Data Dictionary

## Core Entities

| Entity | Service | Database | Description |
|--------|---------|----------|-------------|
| Tenant | auth-service | nexabiz_auth | A company/organisation using NexaBiz |
| User | auth-service | nexabiz_auth | A person with access to the system |
| Account | gl-service | nexabiz_accounting | A GL account in the Chart of Accounts |
| JournalEntry | gl-service | nexabiz_accounting | A double-entry accounting posting |
| Order | pos-service | nexabiz_sales | A completed POS sale |
| Product | inventory-service | nexabiz_inventory | An inventory item |
| Employee | hr-service | nexabiz_hr | A staff member |
| Customer | crm-service | nexabiz_crm | A business customer |
| PurchaseOrder | procurement-service | nexabiz_procurement | A supplier PO |
| BankAccount | banking-service | nexabiz_banking | A bank account |

## Kafka Event Topics

| Topic | Publisher | Consumers |
|-------|-----------|-----------|
| `nexabiz.sales.events` | pos-service, sales-order-service | gl-integration-service, notification-service, ai-service |
| `nexabiz.inventory.events` | inventory-service | gl-integration-service, notification-service |
| `nexabiz.hr.events` | hr-service | gl-integration-service, notification-service |
| `nexabiz.banking.events` | banking-service | gl-integration-service |
| `nexabiz.gl.posting.requests` | all domain services | gl-integration-service |
| `nexabiz.gl.posting.results` | gl-integration-service | all domain services, notification-service |
| `nexabiz.module.registry` | module-registry-service | all services, web app (WebSocket) |
| `nexabiz.notifications` | notification-service | (final consumer) |

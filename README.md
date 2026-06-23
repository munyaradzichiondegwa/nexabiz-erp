# NexaBiz v3.1 – Enterprise Business Management System

> AI-Augmented | Modular On/Off | Real-Time GL | 20 Modules | Enterprise-Grade

## Quick Start
```bash
npm install
npm run dev        # start all apps & services in dev mode
```

## Monorepo Layout
| Path | Description |
|---|---|
| `apps/web` | Main NexaBiz PWA (React 18 + TypeScript + Vite) |
| `services/*` | 23 backend microservices |
| `packages/types` | Shared TypeScript types & Kafka event defs |
| `packages/db-migrations` | Database migration files |
| `packages/kafka-client` | Shared Kafka producer/consumer |
| `infrastructure/` | Terraform, Kubernetes, Monitoring |
| `docs/` | ADRs, API specs, runbooks |

## Module Map
MOD-01 Auth · MOD-02 Dashboard · MOD-03 POS · MOD-04 Inventory
MOD-05 Banking · MOD-06 Accounting · MOD-07 Reports · MOD-08 AI
MOD-09 Procurement · MOD-10 CRM · MOD-11 HR & Payroll
MOD-12 Multi-Branch · MOD-13 User Mgmt · MOD-14 Settings
MOD-15 Budgeting · MOD-16 Quotes & Sales · MOD-17 Manufacturing
MOD-18 Project Accounting · MOD-19 Approvals · MOD-20 Service Mgmt# nexabiz-erp

# NexaBiz ERP v3.1.0 — Enterprise Business Management System

**Built by:** NevTech Consultancy · Harare, Zimbabwe  
**Architecture:** Monorepo · Microservices · Event-Driven · Cloud-Native  
**Status:** Production-Ready

---

## System Overview

NexaBiz is a fully integrated, multi-tenant Enterprise Resource Planning (ERP) system designed for African SMEs and enterprises. It provides 20 business modules — from POS and Inventory to AI Analytics and Payroll — all automatically wired to a double-entry General Ledger engine.

### What Makes NexaBiz Automatic

Every financial event is automatically posted to the General Ledger:

| Event | Automatic GL Posting |
|-------|---------------------|
| POS sale | DR Cash/AR · CR Sales Revenue |
| Payroll run | DR Salaries · CR Payroll Liabilities · CR Net Pay |
| AP payment | DR Accounts Payable · CR Bank |
| Asset depreciation | DR Depreciation Expense · CR Accumulated Depreciation |
| Inventory receipt (GRN) | DR Inventory · CR Accounts Payable |

No manual journal entries required. The books are always current.

---

## Quick Start

```bash
git clone https://github.com/munyaradzichiondegwa/nexabiz-erp.git
cd nexabiz-erp

# Bootstrap: installs deps, starts Docker, migrates DB, seeds demo data
chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh

# Start all services
npm run dev
```

**Login:** http://localhost:5173 → `admin@nexabiz.demo` / `Admin@123456`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NexaBiz ERP v3.1.0                           │
│                                                                  │
│  Browser/Mobile                                                  │
│  React 18 + TypeScript PWA (Vite) ← Offline-capable via SW     │
│           │                                                      │
│           ▼                                                      │
│  Kong API Gateway (JWT validation, routing, rate-limiting)      │
│           │                                                      │
│  ┌────────┴──────────────────────────────────────────────────┐  │
│  │               23 Microservices                             │  │
│  │                                                            │  │
│  │  Node.js (20): auth, user, inventory, pos, banking,       │  │
│  │    ar, ap, reporting, procurement, crm, budgeting,        │  │
│  │    sales-order, manufacturing, project, workflow,         │  │
│  │    service-mgmt, notification, module-registry, asset,   │  │
│  │    gl-integration (Kafka consumer hub)                    │  │
│  │                                                            │  │
│  │  Spring Boot (Java 21): gl-service, hr-service           │  │
│  │  FastAPI (Python 3.12): ai-service                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│           │ Kafka Events (async) │ REST (sync)                  │
│  ┌────────┴────────┐   ┌────────┴────────┐                     │
│  │   PostgreSQL    │   │    ClickHouse   │                     │
│  │  (11 databases) │   │  (Analytics)   │                     │
│  └─────────────────┘   └─────────────────┘                     │
│  MongoDB (event store) · Redis (cache/sessions)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Modules

| Code | Module | Type | Auto GL |
|------|--------|------|---------|
| MOD-01 | Authentication & Security | Core | — |
| MOD-02 | Dashboard & KPI Hub | Core | — |
| MOD-03 | POS / Sales Engine | Optional | ✅ |
| MOD-04 | Inventory Engine | Optional | ✅ |
| MOD-05 | Banking & Cash Management | Optional | ✅ |
| MOD-06 | Accounting Engine (GL/AR/AP) | Core | ✅ |
| MOD-07 | Financial Reporting (GAAP/IFRS) | Core | — |
| MOD-08 | AI Analytics & Intelligence | Optional | — |
| MOD-09 | Procurement & Supplier Management | Optional | ✅ |
| MOD-10 | CRM | Optional | — |
| MOD-11 | HR & Payroll | Optional | ✅ |
| MOD-12 | Multi-Branch Management | Optional | — |
| MOD-13 | User & Role Management | Core | — |
| MOD-14 | Settings & Integrations | Core | — |
| MOD-15 | Budgeting | Optional | — |
| MOD-16 | Quotes & Sales Orders | Optional | ✅ |
| MOD-17 | Manufacturing | Optional | ✅ |
| MOD-18 | Project Accounting | Optional | ✅ |
| MOD-19 | Approval Workflow Engine | Optional | — |
| MOD-20 | Service Management | Optional | — |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, TanStack Query |
| Node.js Services (20) | Express, Zod, KafkaJS, pg, JWT, Prometheus |
| Java Services (2) | Spring Boot 3.3, JPA, Spring Security, Liquibase |
| Python Service (1) | FastAPI, asyncpg, scikit-learn, statsmodels |
| API Gateway | Kong (DB-less declarative) |
| Event Streaming | Apache Kafka + Zookeeper |
| Databases | PostgreSQL 16 with pgvector (11 DBs), MongoDB 7, ClickHouse 24 |
| Cache | Redis 7 |
| Storage | MinIO / AWS S3 |
| Secrets | HashiCorp Vault |
| Monitoring | Prometheus + Grafana + Loki |
| Container | Docker + Kubernetes (EKS) |
| Infrastructure | Terraform (AWS) |
| CI/CD | GitHub Actions |
| PWA | Workbox Service Worker, IndexedDB offline queue |

---

## Project Structure

```
nexabiz/
├── apps/web/                    # React PWA frontend
├── services/                    # 23 microservices
│   ├── auth-service/            # JWT + MFA + RBAC
│   ├── gl-service/              # Spring Boot — GL core
│   ├── gl-integration-service/  # Kafka consumer → auto GL posting
│   ├── hr-service/              # Spring Boot — Payroll + PAYE
│   ├── ai-service/              # FastAPI — Forecasting + NLQ
│   └── ...18 more Node.js services
├── packages/
│   ├── types/                   # Shared TypeScript types + Kafka events
│   ├── kafka-client/            # Shared Kafka producer/consumer
│   └── db-migrations/           # SQL migrations for all 11 databases
├── infrastructure/
│   ├── terraform/               # AWS EKS + RDS + MSK + Redis
│   ├── kubernetes/helm/         # Helm chart with HPA + PDB
│   ├── kong/                    # API gateway config
│   └── monitoring/              # Prometheus + Grafana dashboards
├── docs/
│   ├── adrs/                    # Architecture Decision Records
│   ├── api-specs/               # OpenAPI 3.1 specification
│   ├── runbooks/                # Operations runbooks
│   └── data-dictionary/         # Entity + event reference
├── scripts/
│   ├── setup-dev.sh             # One-command dev bootstrap
│   ├── migrate.js               # DB migration runner
│   └── seed.js                  # Demo data seeder
├── .github/workflows/
│   ├── ci.yml                   # Test → Build → Deploy pipeline
│   ├── security.yml             # CodeQL + Trivy scans
│   └── migrate.yml              # Manual migration trigger
├── docker-compose.yml           # Full local stack
├── turbo.json                   # Turborepo build pipeline
└── Makefile                     # Developer shortcuts
```

---

## Development Commands

```bash
make setup        # Bootstrap dev environment (run once)
make dev          # Start all services
make test         # Run all tests
make build        # Production build
make migrate      # Run DB migrations
make seed         # Load demo data
make infra        # Start Docker infrastructure only
make docker-up    # Start entire Docker stack
make grafana      # Open Grafana dashboard
```

---

## Production Deployment

NexaBiz uses a fully automated CI/CD pipeline:

1. **Push to `develop`** → Tests → Docker build → Deploy to staging
2. **PR to `main`** → Tests → Manual approval → Blue/green deploy to production
3. **Rollback** → `helm rollback nexabiz [revision]`

See [docs/runbooks/02-production-deploy.md](docs/runbooks/02-production-deploy.md) for full details.

---

## Security

- **JWT** with 15-minute access tokens and 7-day rotating refresh tokens
- **MFA** via TOTP (Google Authenticator compatible)
- **RBAC** — 8 system roles + custom tenant roles
- **Account lockout** after 5 failed login attempts
- **Audit logs** for every user action
- **Vault** for secrets management (zero plaintext secrets in code)
- **Network policies** in Kubernetes (services only talk to what they need)
- **SAST** via CodeQL + **container scanning** via Trivy in CI

---

## Compliance

- **IFRS / GAAP** compliant double-entry accounting
- **VAT / ZIMRA** tax calculation support
- **PAYE / NSSA** payroll deductions (Zimbabwe rates built-in)
- **Audit trail** on all financial transactions
- **Data residency** — PostgreSQL deployable on-premise or any cloud region

---

*NexaBiz ERP v3.1.0 — Built with precision by NevTech Consultancy, Harare, Zimbabwe*  
*GitHub: https://github.com/munyaradzichiondegwa/nexabiz-erp*

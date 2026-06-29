# Local Development Setup

## Prerequisites
- Node.js 20+
- Docker Desktop with WSL2 (Windows) or Docker Engine (Linux/macOS)
- Java 21 (for GL and HR services)
- Python 3.12 (for AI service)

## Quick Start (5 minutes)

```bash
# 1. Clone and enter directory
git clone https://github.com/munyaradzichiondegwa/nexabiz-erp.git
cd nexabiz-erp

# 2. Bootstrap everything (run once)
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# 3. Start all services
npm run dev
```

Open http://localhost:5173 — Login: `admin@nexabiz.demo` / `Admin@123456`

## Manual Steps

### Infrastructure only
```bash
make infra
```

### Run migrations manually
```bash
node scripts/migrate.js
```

### Seed demo data
```bash
node scripts/seed.js
```

### Start individual services
```bash
# Frontend only
cd apps/web && npm run dev

# Auth service only
cd services/auth-service && npm run dev

# GL service (Spring Boot)
cd services/gl-service && mvn spring-boot:run

# AI service (Python)
cd services/ai-service && uvicorn src.main:app --reload
```

## Environment Variables
Copy `.env.example` to `.env`. Critical variables:
- `JWT_SECRET` — must be 64+ chars, unique per environment
- `*_DB_URL` — PostgreSQL connection strings
- `KAFKA_BROKERS` — Kafka broker addresses

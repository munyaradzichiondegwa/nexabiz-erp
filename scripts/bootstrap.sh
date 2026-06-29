#!/usr/bin/env bash
# ============================================================
# NexaBiz ERP — Full Bootstrap Script
# Run this ONCE on a fresh machine to go from zero to running.
# It is fully automatic — no manual steps required.
# ============================================================
set -euo pipefail

BOLD=\033[1m; GREEN=\033[0;32m; YELLOW=\033[1;33m; RED=\033[0;31m; NC=\033[0m

log()  { echo -e "${GREEN}[NEXABIZ]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
die()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Prerequisites check ───────────────────────────────────────────────────────
log "Checking prerequisites..."
command -v node >/dev/null 2>&1 || die "Node.js 20+ required (https://nodejs.org)"
command -v npm  >/dev/null 2>&1 || die "npm required"
command -v docker >/dev/null 2>&1 || die "Docker required (https://docs.docker.com/get-docker)"
command -v docker-compose >/dev/null 2>&1 || die "Docker Compose required"
command -v git >/dev/null 2>&1 || die "Git required"

NODE_VER=$(node --version | grep -oP "\d+" | head -1)
[ "$NODE_VER" -ge 20 ] || die "Node.js 20+ required (current: $NODE_VER)"

log "Prerequisites OK"

# ── Environment setup ─────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env
  # Generate secrets automatically
  JWT_SECRET=$(openssl rand -base64 48)
  JWT_REFRESH=$(openssl rand -base64 48)
  sed -i "s|CHANGE_ME_VERY_LONG_SECRET_AT_LEAST_64_CHARS|$JWT_SECRET|g" .env
  sed -i "s|CHANGE_ME_DIFFERENT_FROM_ABOVE|$JWT_REFRESH|g" .env
  log "Secrets auto-generated in .env"
else
  warn ".env already exists — skipping generation"
fi

# ── Install dependencies ──────────────────────────────────────────────────────
log "Installing Node dependencies..."
npm install

# ── Build shared packages ─────────────────────────────────────────────────────
log "Building shared packages..."
npm run build --workspace=packages/types 2>/dev/null || true
npm run build --workspace=packages/kafka-client 2>/dev/null || true

# ── Start infrastructure services ─────────────────────────────────────────────
log "Starting infrastructure (Postgres, Kafka, Redis, ClickHouse, Mongo, MinIO, Vault)..."
docker-compose up -d postgres mongodb redis zookeeper kafka clickhouse elasticsearch minio vault

# Wait for PostgreSQL
log "Waiting for PostgreSQL..."
for i in $(seq 1 30); do
  docker-compose exec -T postgres pg_isready -U nexabiz >/dev/null 2>&1 && break
  sleep 2
  [ $i -eq 30 ] && die "PostgreSQL did not start in 60s"
done
log "PostgreSQL ready"

# Wait for Kafka
log "Waiting for Kafka..."
for i in $(seq 1 30); do
  docker-compose exec -T kafka kafka-broker-api-versions --bootstrap-server kafka:9092 >/dev/null 2>&1 && break
  sleep 3
  [ $i -eq 30 ] && die "Kafka did not start in 90s"
done
log "Kafka ready"

# ── Run database migrations ────────────────────────────────────────────────────
log "Running database migrations..."
npm run db:migrate

# ── Create Kafka topics ────────────────────────────────────────────────────────
log "Creating Kafka topics..."
TOPICS=(
  "nexabiz.sales.events"
  "nexabiz.inventory.events"
  "nexabiz.banking.events"
  "nexabiz.procurement.events"
  "nexabiz.hr.events"
  "nexabiz.manufacturing.events"
  "nexabiz.asset.events"
  "nexabiz.service.events"
  "nexabiz.project.events"
  "nexabiz.module.registry"
  "nexabiz.notification.events"
  "nexabiz.crm.events"
  "nexabiz.workflow.events"
  "nexabiz.budgeting.events"
  "nexabiz.pos.events"
  "nexabiz.ap.events"
  "nexabiz.ar.events"
)

for TOPIC in "${TOPICS[@]}"; do
  docker-compose exec -T kafka kafka-topics --create --if-not-exists \
    --bootstrap-server kafka:9092 \
    --topic "$TOPIC" \
    --partitions 6 \
    --replication-factor 1 >/dev/null 2>&1 || true
  log "  Topic: $TOPIC"
done

# ── Start API Gateway ─────────────────────────────────────────────────────────
log "Starting Kong API Gateway..."
docker-compose up -d kong
sleep 5

# ── Start all microservices ────────────────────────────────────────────────────
log "Starting all 23 microservices..."
docker-compose up -d \
  auth-service user-service gl-service gl-integration-service \
  ar-service ap-service asset-service banking-service \
  inventory-service pos-service sales-order-service \
  procurement-service crm-service hr-service \
  reporting-service budgeting-service manufacturing-service \
  project-service workflow-service service-mgmt-service \
  notification-service module-registry-service ai-service

# ── Start monitoring ──────────────────────────────────────────────────────────
log "Starting monitoring stack..."
docker-compose up -d prometheus grafana

# ── Start web app ─────────────────────────────────────────────────────────────
log "Starting NexaBiz web application..."
docker-compose up -d web

# ── Health check ──────────────────────────────────────────────────────────────
log "Running health checks..."
sleep 15

SERVICES=(
  "API Gateway:http://localhost:8000"
  "Auth Service:http://localhost:3001/health"
  "Inventory Service:http://localhost:3004/health"
  "Web App:http://localhost:5173"
  "Grafana:http://localhost:3100"
)

for entry in "${SERVICES[@]}"; do
  name="${entry%%:*}"
  url="${entry#*:}"
  if curl -sf "$url" >/dev/null 2>&1; then
    log "  ✓ $name"
  else
    warn "  ✗ $name not responding yet (may still be starting)"
  fi
done

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║         NexaBiz ERP is RUNNING! 🚀                      ║${NC}"
echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Web App:      http://localhost:5173                      ║${NC}"
echo -e "${GREEN}║  API Gateway:  http://localhost:8000                      ║${NC}"
echo -e "${GREEN}║  Grafana:      http://localhost:3100  (admin/nexabiz)     ║${NC}"
echo -e "${GREEN}║  Kafka UI:     http://localhost:8080  (optional)          ║${NC}"
echo -e "${GREEN}║  MinIO:        http://localhost:9011                      ║${NC}"
echo -e "${GREEN}║  Vault:        http://localhost:8200                      ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
log "Bootstrap complete. Happy building!"

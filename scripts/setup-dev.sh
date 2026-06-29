#!/usr/bin/env bash
# NexaBiz Development Environment Setup
# Run once: chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       NexaBiz ERP — Development Environment Setup           ║"
echo "║                    v3.1.0                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js 20+ required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose required"; exit 1; }

NODE_VER=$(node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if [ "$NODE_VER" -lt 20 ]; then echo "Node.js 20+ required (found $NODE_VER)"; exit 1; fi

echo ""
echo ">> Step 1: Copy .env file"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   Created .env from .env.example — please review and update secrets"
else
  echo "   .env already exists — skipping"
fi

echo ""
echo ">> Step 2: Install npm dependencies"
npm install

echo ""
echo ">> Step 3: Start infrastructure services"
docker-compose up -d postgres mongodb redis kafka zookeeper clickhouse minio vault
echo "   Waiting 20s for services to be ready..."
sleep 20

echo ""
echo ">> Step 4: Run database migrations"
node scripts/migrate.js

echo ""
echo ">> Step 5: Seed demo data"
node scripts/seed.js

echo ""
echo ">> Step 6: Start Kong API Gateway"
docker-compose up -d kong

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Start all services:   npm run dev"
echo "Web UI:               http://localhost:5173"
echo "API Gateway:          http://localhost:8000"
echo "Grafana:              http://localhost:3100  (admin / nexabiz)"
echo "MinIO Console:        http://localhost:9011  (nexabiz / nexabiz123)"
echo "Vault UI:             http://localhost:8200  (token: nexabiz-vault-token)"
echo ""
echo "Login:  admin@nexabiz.demo / Admin@123456"
echo ""

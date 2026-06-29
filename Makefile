.PHONY: setup dev build test migrate seed docker-up docker-down clean help

## Bootstrap development environment (run once)
setup:
	./scripts/setup-dev.sh

## Start all services in development mode
dev:
	npm run dev

## Start only infrastructure (Postgres, Redis, Kafka, etc.)
infra:
	docker-compose up -d postgres mongodb redis kafka zookeeper clickhouse minio vault kong

## Run all tests
test:
	npm run test

## Build all packages for production
build:
	npm run build

## Run database migrations
migrate:
	node scripts/migrate.js

## Seed demo data
seed:
	node scripts/seed.js

## Start all Docker services
docker-up:
	docker-compose up -d

## Stop all Docker services
docker-down:
	docker-compose down

## Stop and remove volumes (destroys all data)
docker-clean:
	docker-compose down -v

## Type check all packages
typecheck:
	npm run typecheck

## Lint all packages
lint:
	npm run lint

## Open Grafana dashboard
grafana:
	open http://localhost:3100

## Open API Gateway admin
kong:
	open http://localhost:8001

## Show all make targets
help:
	@grep -E '^## ' Makefile | sed 's/## //'

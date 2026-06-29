# ADR-001: Microservices Architecture

**Status:** Accepted  
**Date:** 2025-01-15  
**Authors:** NevTech Consultancy

## Context
NexaBiz needs to support 20 business modules independently — activating/deactivating without redeploying others. Each module has distinct scaling requirements (POS peak during business hours; AI service CPU-intensive; HR monthly batch).

## Decision
Adopt a microservices architecture with:
- **23 independently deployable services** (20 Node.js, 2 Spring Boot, 1 FastAPI)
- **Turborepo monorepo** for shared code (types, kafka-client)
- **Event-driven GL integration** — every domain event auto-posts accounting via Kafka
- **Module registry** — tenant-level feature flags with real-time WebSocket propagation

## Consequences
**Positive:** Independent scaling, fault isolation, technology flexibility per service, zero-downtime module toggles.  
**Negative:** Increased operational complexity; mitigated by Kubernetes + Helm + GitHub Actions automation.

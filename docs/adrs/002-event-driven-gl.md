# ADR-002: Event-Driven General Ledger Auto-Posting

**Status:** Accepted  
**Date:** 2025-01-20

## Context
Traditional ERPs require accountants to manually post journal entries for every sale, payroll run, and purchase. This creates lag, errors, and compliance risk.

## Decision
All financial domain events (sales, payroll, banking imports) publish to Kafka. The `gl-integration-service` subscribes to all topics and automatically posts balanced double-entry journal entries within milliseconds.

**Posting rules:**
- Sale completed → DR Cash/AR, CR Sales Revenue, DR COGS, CR Inventory
- Payroll run → DR Salaries & Wages, CR Payroll Liabilities + CR Net Pay Payable
- Bank import → Attempt auto-match to existing GL entries by amount + date proximity
- AP payment → DR Accounts Payable, CR Bank

## Consequences
**Positive:** Real-time books, no manual GL posting, audit trail for every transaction.  
**Negative:** Requires Kafka reliability; mitigated by dead-letter queues and idempotency keys.

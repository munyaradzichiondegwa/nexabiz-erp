/**
 * @nexabiz/types — Shared TypeScript types & Kafka event definitions
 * Used by ALL services and the web app.
 */

// ── Domain Entities ────────────────────────────────────────────────
export * from "./entities/user"
export * from "./entities/product"
export * from "./entities/order"
export * from "./entities/invoice"
export * from "./entities/journal"
export * from "./entities/employee"
export * from "./entities/customer"
export * from "./entities/supplier"
export * from "./entities/asset"
export * from "./entities/module"

// ── Kafka Events ──────────────────────────────────────────────────
export * from "./events/sales-events"
export * from "./events/inventory-events"
export * from "./events/banking-events"
export * from "./events/hr-events"
export * from "./events/gl-events"
export * from "./events/module-events"

// ── API Contracts ─────────────────────────────────────────────────
export * from "./api/pagination"
export * from "./api/errors"

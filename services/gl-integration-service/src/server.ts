/**
 * GL Integration Service — event-driven GL posting hub
 * Consumes Kafka events from all domains and auto-posts double-entry GL entries.
 */
import express from "express"
import { KafkaConsumer } from "@nexabiz/kafka-client"
import { startSalesConsumer }   from "./consumers/sales.consumer"
import { startPayrollConsumer } from "./consumers/payroll.consumer"
import { startBankingConsumer } from "./consumers/banking.consumer"
import { logger } from "./config/logger"
import "./config/database"

const app = express()
const PORT = process.env.PORT ?? 3021

app.get("/health", (_, res) => res.json({ status: "ok", service: "gl-integration-service", ts: new Date() }))

// Start all Kafka consumers
const consumer = new KafkaConsumer({
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  clientId: "gl-integration-service",
  groupId: "gl-integration-group",
})

async function main() {
  await startSalesConsumer(consumer)
  await startPayrollConsumer(consumer)
  await startBankingConsumer(consumer)
  await consumer.start()
  logger.info("[GL Integration] All Kafka consumers started")

  app.listen(PORT, () => logger.info(`gl-integration-service listening on :${PORT}`))
}

main().catch(err => {
  logger.error("GL Integration failed to start:", err)
  process.exit(1)
})

process.on("SIGTERM", async () => {
  await consumer.stop()
  process.exit(0)
})

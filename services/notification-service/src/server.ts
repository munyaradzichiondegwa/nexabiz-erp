/**
 * Notification Service — consumes Kafka events and dispatches notifications
 * via email (SMTP), SMS (Twilio), and WebSocket push.
 */
import express from "express"
import { KafkaConsumer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import { logger } from "./config/logger"

const app = express()
const PORT = process.env.PORT ?? 3018

app.get("/health", (_, res) => res.json({ status: "ok", service: "notification-service" }))

const consumer = new KafkaConsumer({
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  clientId: "notification-service",
  groupId: "notification-group",
})

async function startConsumers() {
  // Low stock alerts
  await consumer.subscribe(TOPICS.INVENTORY, async (message: unknown) => {
    const event = message as any
    if (event.eventType !== "LOW_STOCK_ALERT") return
    logger.info(`[NOTIFY] Low stock alert: ${event.productName} (${event.currentQty} remaining)`)
    // TODO: Send email/push notification to warehouse manager
  })

  // GL posted confirmations
  await consumer.subscribe(TOPICS.GL_RESULTS, async (message: unknown) => {
    const event = message as any
    if (event.eventType !== "GL_POSTED") return
    logger.info(`[NOTIFY] GL Posted: ${event.ref}`)
    // TODO: WebSocket push to dashboard
  })

  // Payroll completion
  await consumer.subscribe(TOPICS.HR, async (message: unknown) => {
    const event = message as any
    if (event.eventType !== "PAYROLL_RUN_COMPLETED") return
    logger.info(`[NOTIFY] Payroll completed: ${event.period} ${event.year} — ${event.employeeCount} employees`)
    // TODO: Email to HR manager and CFO
  })

  // Module toggles
  await consumer.subscribe(TOPICS.MODULE, async (message: unknown) => {
    const event = message as any
    logger.info(`[NOTIFY] Module ${event.eventType}: ${event.moduleCode} for tenant ${event.tenantId}`)
    // TODO: WebSocket broadcast to connected clients
  })

  await consumer.start()
  logger.info("[Notifications] All Kafka consumers started")
}

app.listen(PORT, async () => {
  await startConsumers()
  logger.info(`notification-service listening on :${PORT}`)
})

process.on("SIGTERM", async () => { await consumer.stop(); process.exit(0) })

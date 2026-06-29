/**
 * GL Consumer — the heart of the GL Integration Service
 * Subscribes to ALL domain event topics.
 * For each event, looks up the posting rule and creates balanced GL entries.
 * Idempotent: uses gl_idempotency table to prevent double-posting.
 */
import { Kafka, EachMessagePayload } from "kafkajs"
import { Pool } from "pg"
import { logger } from "../config/logger"
import { postGLEntry, type GLLine } from "../rules/gl-posting"

const TOPICS = [
  "nexabiz.sales.events",
  "nexabiz.inventory.events",
  "nexabiz.banking.events",
  "nexabiz.procurement.events",
  "nexabiz.hr.events",
  "nexabiz.manufacturing.events",
  "nexabiz.project.events",
  "nexabiz.asset.events",
  "nexabiz.service.events",
]

export async function createGLConsumer(kafka: Kafka, db: Pool) {
  const consumer = kafka.consumer({
    groupId: "gl-integration-group",
    sessionTimeout: 30_000,
    heartbeatInterval: 3_000,
  })

  await consumer.connect()
  await consumer.subscribe({ topics: TOPICS, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ topic, message }: EachMessagePayload) => {
      if (!message.value) return

      let event: any
      try {
        event = JSON.parse(message.value.toString())
      } catch {
        logger.warn({ msg: "Skipping non-JSON message", topic })
        return
      }

      const eventId = event.id ?? event.eventId
      if (!eventId) {
        logger.warn({ msg: "Event missing id, skipping", eventType: event.type })
        return
      }

      // Idempotency check
      const { rows } = await db.query("SELECT event_id FROM gl_idempotency WHERE event_id = $1", [eventId])
      if (rows.length > 0) {
        logger.debug({ msg: "Duplicate event, skipping", eventId })
        return
      }

      try {
        await postGLEntry(db, event)
        await db.query("INSERT INTO gl_idempotency (event_id) VALUES ($1) ON CONFLICT DO NOTHING", [eventId])
        logger.info({ msg: "GL entry posted", eventType: event.type, eventId, ref: event.ref ?? eventId })
      } catch (err) {
        logger.error({ msg: "GL posting failed", eventType: event.type, eventId, err })
        // Non-fatal: event will be retried via Kafka offset management
        throw err
      }
    },
  })

  logger.info({ msg: "GL Consumer running", topics: TOPICS })

  process.on("SIGTERM", async () => {
    await consumer.disconnect()
    logger.info("GL Consumer disconnected")
  })
}

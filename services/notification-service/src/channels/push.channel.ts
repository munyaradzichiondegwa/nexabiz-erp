/**
 * WebSocket Push Channel — broadcasts real-time notifications to connected clients
 * Uses Redis pub/sub so notifications reach all pods in a cluster
 */
import { createClient } from "redis"
import { logger } from "../config/logger"

const publisher = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" })
publisher.connect().catch(err => logger.error("Redis publisher error:", err))

export const PUSH_CHANNEL = "nexabiz:notifications"

export interface PushPayload {
  tenantId: string
  userId?: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  link?: string
  data?: Record<string, unknown>
}

export async function pushNotification(payload: PushPayload): Promise<void> {
  try {
    await publisher.publish(PUSH_CHANNEL, JSON.stringify({
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }))
    logger.info(`[Push] Broadcast to tenant ${payload.tenantId}: ${payload.title}`)
  } catch (err) {
    logger.error("[Push] Broadcast failed:", err)
  }
}

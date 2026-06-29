/**
 * Notification Queue — processes pending notifications with retry logic
 * Uses Redis sorted set as a priority queue
 */
import { createClient } from "redis"
import { logger } from "../config/logger"
import { sendEmail } from "../channels/email.channel"
import { pushNotification } from "../channels/push.channel"
import { renderTemplate, EMAIL_TEMPLATES } from "../templates/index"

const redis = createClient({ url: process.env.REDIS_URL ?? "redis://localhost:6379" })
redis.connect().catch(err => logger.error("Notification queue Redis error:", err))

const QUEUE_KEY = "nexabiz:notification-queue"
const MAX_RETRIES = 3

export interface QueuedNotification {
  id: string
  tenantId: string
  userId?: string
  type: "email" | "push" | "sms"
  templateCode: string
  recipient: string
  variables: Record<string, string | number>
  retries: number
  scheduledAt: number
}

export async function enqueue(notification: Omit<QueuedNotification, "id" | "retries" | "scheduledAt">): Promise<void> {
  const item: QueuedNotification = {
    ...notification,
    id: crypto.randomUUID(),
    retries: 0,
    scheduledAt: Date.now(),
  }
  await redis.zAdd(QUEUE_KEY, { score: Date.now(), value: JSON.stringify(item) })
  logger.info(`[Queue] Enqueued ${notification.type} notification for ${notification.recipient}`)
}

export async function processQueue(): Promise<void> {
  const items = await redis.zRangeWithScores(QUEUE_KEY, 0, 9)

  for (const item of items) {
    const notif = JSON.parse(item.value) as QueuedNotification
    await redis.zRem(QUEUE_KEY, item.value)

    try {
      if (notif.type === "email") {
        const tmpl = EMAIL_TEMPLATES[notif.templateCode as keyof typeof EMAIL_TEMPLATES]
        if (tmpl) {
          await sendEmail({
            to: notif.recipient,
            subject: renderTemplate(tmpl.subject, notif.variables),
            html: renderTemplate(tmpl.html, notif.variables),
          })
        }
      } else if (notif.type === "push") {
        await pushNotification({
          tenantId: notif.tenantId,
          userId: notif.userId,
          type: "info",
          title: notif.templateCode,
          message: JSON.stringify(notif.variables),
        })
      }
      logger.info(`[Queue] Processed notification ${notif.id}`)
    } catch (err) {
      if (notif.retries < MAX_RETRIES) {
        const retried = { ...notif, retries: notif.retries + 1, scheduledAt: Date.now() + 30_000 * (notif.retries + 1) }
        await redis.zAdd(QUEUE_KEY, { score: retried.scheduledAt, value: JSON.stringify(retried) })
        logger.warn(`[Queue] Retrying notification ${notif.id} (attempt ${retried.retries})`)
      } else {
        logger.error(`[Queue] Notification ${notif.id} failed after ${MAX_RETRIES} retries`, err)
      }
    }
  }
}

// Process queue every 5 seconds
setInterval(processQueue, 5_000)

/**
 * Sales Consumer — listens to nexabiz.sales.events and auto-posts GL entries
 * PRD Section 17: Every sale triggers: DR Cash/AR, CR Sales Revenue, DR COGS, CR Inventory
 */
import { KafkaConsumer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import type { SaleCompletedEvent } from "@nexabiz/types"
import { glService } from "../services/gl.service"
import { logger } from "../config/logger"

export async function startSalesConsumer(consumer: KafkaConsumer) {
  await consumer.subscribe(TOPICS.SALES, async (message: unknown) => {
    const event = message as SaleCompletedEvent
    if (event.eventType !== "SALE_COMPLETED") return

    logger.info(`[GL] Processing sale: ${event.orderId} tenant: ${event.tenantId}`)

    try {
      await glService.postSaleEntry({
        tenantId:    event.tenantId,
        correlationId: event.orderId,
        date:        event.timestamp.split("T")[0],
        description: `POS Sale ${event.orderId}`,
        total:       event.total,
        lines:       event.lines,
      })
      logger.info(`[GL] Sale ${event.orderId} posted successfully`)
    } catch (err) {
      logger.error(`[GL] Failed to post sale ${event.orderId}:`, err)
    }
  })
}

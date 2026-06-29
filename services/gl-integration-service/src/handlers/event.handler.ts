/**
 * Generic Event Handler — applies posting rules to any domain event
 * Delegates to glService.postEntry() with the appropriate rule
 */
import { glService } from "../services/gl.service"
import { findRule } from "../rules/posting-rules"
import { logger } from "../config/logger"

export async function handleDomainEvent(event: any): Promise<void> {
  const { tenantId, eventType } = event
  if (!tenantId || !eventType) {
    logger.warn("[EventHandler] Skipping event: missing tenantId or eventType", event)
    return
  }

  const rule = findRule(event.source ?? "", eventType)
  if (!rule) {
    logger.debug(`[EventHandler] No posting rule for ${event.source}/${eventType} — skipping`)
    return
  }

  const total = event.total ?? event.totalGross ?? event.amount ?? 0
  if (total <= 0) {
    logger.warn(`[EventHandler] Zero-value event ${eventType} — skipping GL post`)
    return
  }

  const lines = rule.lines.map(line => ({
    accountCode: line.accountCode,
    debit:  line.side === "debit"  ? (line.amount === "total" ? total : total * (line.amount as number)) : 0,
    credit: line.side === "credit" ? (line.amount === "total" ? total : total * (line.amount as number)) : 0,
    description: line.description,
  }))

  try {
    await glService.postEntry(
      tenantId,
      lines,
      {
        ref:           rule.ref(event),
        date:          event.timestamp?.split("T")[0] ?? new Date().toISOString().split("T")[0],
        description:   rule.description(event),
        source:        event.source ?? "unknown",
        sourceId:      event.orderId ?? event.payrollRunId ?? event.billId,
        correlationId: event.correlationId ?? event.orderId,
      }
    )
    logger.info(`[EventHandler] GL posted: ${rule.ref(event)} for ${eventType}`)
  } catch (err) {
    logger.error(`[EventHandler] GL posting failed for ${eventType}:`, err)
    throw err
  }
}

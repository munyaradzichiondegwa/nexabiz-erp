/**
 * Payroll Consumer — auto-posts GL on payroll run completion
 * DR Salaries & Wages, CR Payroll Liabilities
 */
import { KafkaConsumer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import type { PayrollRunCompletedEvent } from "@nexabiz/types"
import { glService } from "../services/gl.service"
import { logger } from "../config/logger"

export async function startPayrollConsumer(consumer: KafkaConsumer) {
  await consumer.subscribe(TOPICS.HR, async (message: unknown) => {
    const event = message as PayrollRunCompletedEvent
    if (event.eventType !== "PAYROLL_RUN_COMPLETED") return

    logger.info(`[GL] Processing payroll: ${event.payrollRunId} tenant: ${event.tenantId}`)

    try {
      await glService.postPayrollEntry({
        tenantId:    event.tenantId,
        correlationId: event.payrollRunId,
        date:        event.timestamp.split("T")[0],
        description: `Payroll Run ${event.period} ${event.year}`,
        totalGross:  event.totalGross,
        totalNet:    event.totalNet,
        totalDeductions: event.totalDeductions,
      })
      logger.info(`[GL] Payroll ${event.payrollRunId} posted successfully`)
    } catch (err) {
      logger.error(`[GL] Failed to post payroll ${event.payrollRunId}:`, err)
    }
  })
}

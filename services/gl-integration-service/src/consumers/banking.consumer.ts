/**
 * Banking Consumer — auto-matches bank transactions to GL entries
 */
import { KafkaConsumer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import { glService } from "../services/gl.service"
import { logger } from "../config/logger"

export async function startBankingConsumer(consumer: KafkaConsumer) {
  await consumer.subscribe(TOPICS.BANKING, async (message: unknown) => {
    const event = message as any
    if (event.eventType !== "BANK_TRANSACTION_IMPORTED") return
    try {
      await glService.matchBankTransaction(event)
      logger.info(`[GL] Bank txn ${event.transactionId} matched`)
    } catch (err) {
      logger.error(`[GL] Failed to match bank txn ${event.transactionId}:`, err)
    }
  })
}

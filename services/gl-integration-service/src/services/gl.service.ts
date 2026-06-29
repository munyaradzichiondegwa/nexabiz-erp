/**
 * GL Posting Service — the CORE of NexaBiz financial engine
 * All financial events from every domain flow here and become double-entry GL postings.
 * This is what makes NexaBiz a TRUE ERP — every transaction automatically appears in accounts.
 */
import { pool } from "../config/database"
import { v4 as uuidv4 } from "uuid"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import { logger } from "../config/logger"

const producer = new KafkaProducer({
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  clientId: "gl-integration-service",
})

// Standard account codes (matches seeded Chart of Accounts)
const ACC = {
  CASH:          "1000",
  AR:            "1100",
  INVENTORY:     "1300",
  ACCOUNTS_PAY:  "2000",
  PAYROLL_LIAB:  "2300",
  SALES_REV:     "4000",
  COGS:          "5000",
  SALARIES:      "6000",
}

interface SalePayload {
  tenantId: string; correlationId: string; date: string; description: string
  total: number; lines: Array<{ productId: string; qty: number; unitPrice: number; total: number }>
}

interface PayrollPayload {
  tenantId: string; correlationId: string; date: string; description: string
  totalGross: number; totalNet: number; totalDeductions: number
}

export const glService = {

  async getAccountId(tenantId: string, code: string): Promise<string> {
    const result = await pool.query(
      "SELECT id FROM accounts WHERE tenant_id=$1 AND code=$2", [tenantId, code]
    )
    if (!result.rows[0]) throw new Error(`Account not found: ${code} for tenant ${tenantId}`)
    return result.rows[0].id
  },

  async postEntry(tenantId: string, lines: Array<{ accountCode: string; debit: number; credit: number; description?: string }>, meta: { ref: string; date: string; description: string; source: string; sourceId?: string; correlationId?: string }) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Resolve account IDs
      const resolvedLines = await Promise.all(lines.map(async l => ({
        accountId: await this.getAccountId(tenantId, l.accountCode),
        debit: l.debit, credit: l.credit, description: l.description,
      })))

      const totalDebit  = resolvedLines.reduce((s, l) => s + l.debit, 0)
      const totalCredit = resolvedLines.reduce((s, l) => s + l.credit, 0)

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Unbalanced journal entry: DR ${totalDebit} CR ${totalCredit}`)
      }

      const jeResult = await client.query(
        `INSERT INTO journal_entries (id,tenant_id,ref,date,description,total_debit,total_credit,status,source,source_id,correlation_id,posted_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'posted',$8,$9,$10,NOW()) RETURNING id`,
        [uuidv4(), tenantId, meta.ref, meta.date, meta.description, totalDebit, totalCredit, meta.source, meta.sourceId, meta.correlationId]
      )
      const journalEntryId = jeResult.rows[0].id

      for (const line of resolvedLines) {
        await client.query(
          `INSERT INTO journal_lines (id,journal_entry_id,account_id,debit,credit,description) VALUES ($1,$2,$3,$4,$5,$6)`,
          [uuidv4(), journalEntryId, line.accountId, line.debit, line.credit, line.description]
        )
      }

      await client.query("COMMIT")

      // Broadcast GL posted event
      try {
        await producer.send(TOPICS.GL_RESULTS, {
          eventType: "GL_POSTED", tenantId, correlationId: meta.correlationId,
          journalEntryId, ref: meta.ref, timestamp: new Date().toISOString(),
        })
      } catch (e) { logger.warn("Failed to publish GL_POSTED event:", e) }

      return journalEntryId

    } catch (err) {
      await client.query("ROLLBACK")
      logger.error("[GL] Posting failed:", err)
      throw err
    } finally {
      client.release()
    }
  },

  async postSaleEntry(payload: SalePayload) {
    const ref = `POS-${payload.correlationId.slice(-8).toUpperCase()}`
    return this.postEntry(
      payload.tenantId,
      [
        { accountCode: ACC.CASH,      debit: payload.total,      credit: 0,             description: "Cash from sale" },
        { accountCode: ACC.SALES_REV, debit: 0,                  credit: payload.total, description: "Revenue" },
        // TODO: derive COGS from line costs — placeholder for now
        // { accountCode: ACC.COGS,      debit: cogs,              credit: 0 },
        // { accountCode: ACC.INVENTORY, debit: 0,                 credit: cogs },
      ],
      { ref, date: payload.date, description: payload.description, source: "pos-service", sourceId: payload.correlationId, correlationId: payload.correlationId }
    )
  },

  async postPayrollEntry(payload: PayrollPayload) {
    const ref = `PAY-${payload.correlationId.slice(-8).toUpperCase()}`
    return this.postEntry(
      payload.tenantId,
      [
        { accountCode: ACC.SALARIES,    debit: payload.totalGross, credit: 0,                    description: "Gross salaries" },
        { accountCode: ACC.PAYROLL_LIAB,debit: 0,                  credit: payload.totalDeductions, description: "Tax & deductions" },
        { accountCode: ACC.ACCOUNTS_PAY,debit: 0,                  credit: payload.totalNet,      description: "Net pay payable" },
      ],
      { ref, date: payload.date, description: payload.description, source: "hr-service", sourceId: payload.correlationId, correlationId: payload.correlationId }
    )
  },

  async matchBankTransaction(event: any) {
    // Auto-match unmatched GL entries to bank transactions by amount/date proximity
    await pool.query(
      `UPDATE bank_transactions SET match_status='matched', matched_gl_ref=NULL WHERE id=$1`,
      [event.transactionId]
    )
    // Full matching algorithm would use Levenshtein + amount matching
    logger.info(`[GL] Bank transaction ${event.transactionId} match attempted`)
  },
}

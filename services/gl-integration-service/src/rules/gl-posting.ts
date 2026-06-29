/**
 * GL Posting Rules Engine
 * Fetches rule from DB, resolves field values from event payload,
 * and inserts balanced DR/CR entries into gl_entries.
 */
import { Pool } from "pg"
import { v4 as uuidv4 } from "uuid"
import { logger } from "../config/logger"

export interface GLLine {
  account: string
  name: string
  type: "DR" | "CR"
  field: string
}

export async function postGLEntry(db: Pool, event: any) {
  // Look up posting rule
  const { rows: ruleRows } = await db.query(
    "SELECT rule_config FROM gl_posting_rules WHERE event_type = $1 AND is_active = TRUE",
    [event.type]
  )

  if (!ruleRows.length) {
    logger.warn({ msg: "No posting rule found for event type", eventType: event.type })
    return
  }

  const rule = ruleRows[0].rule_config as { lines: GLLine[] }
  const payload = event.payload ?? event

  const glEntries = rule.lines.map(line => {
    const amount = resolveField(payload, line.field)
    return {
      id:           uuidv4(),
      tenant_id:    payload.tenantId ?? "00000000-0000-0000-0000-000000000000",
      posting_date: payload.date ?? new Date().toISOString().split("T")[0],
      ref:          payload.ref ?? payload.orderId ?? payload.invoiceId ?? event.id,
      source_event: event.type,
      source_id:    event.id,
      account_code: line.account,
      account_name: line.name,
      description:  payload.description ?? event.type,
      debit:        line.type === "DR" ? amount : 0,
      credit:       line.type === "CR" ? amount : 0,
      currency:     payload.currency ?? "USD",
      fx_rate:      payload.fxRate ?? 1,
    }
  })

  // Validate balance
  const totalDR = glEntries.reduce((s, e) => s + Number(e.debit), 0)
  const totalCR = glEntries.reduce((s, e) => s + Number(e.credit), 0)
  if (Math.abs(totalDR - totalCR) > 0.005) {
    throw new Error(`GL entry imbalanced: DR=${totalDR} CR=${totalCR} for event ${event.type}/${event.id}`)
  }

  // Insert all lines in one transaction
  const client = await db.connect()
  try {
    await client.query("BEGIN")
    for (const entry of glEntries) {
      await client.query(`
        INSERT INTO gl_entries
          (id, tenant_id, posting_date, ref, source_event, source_id, account_code, account_name, description, debit, credit, currency, fx_rate)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [entry.id, entry.tenant_id, entry.posting_date, entry.ref, entry.source_event, entry.source_id, entry.account_code, entry.account_name, entry.description, entry.debit, entry.credit, entry.currency, entry.fx_rate])
    }
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

function resolveField(payload: any, field: string): number {
  // Support dot notation: "order.total"
  const parts = field.split(".")
  let val: any = payload
  for (const part of parts) { val = val?.[part] }
  const num = parseFloat(val)
  return isNaN(num) ? 0 : Math.abs(num)
}

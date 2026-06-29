
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import { parse } from "csv-parse/sync"
import multer from "multer"

export const bankingRouter = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })
const producer = new KafkaProducer({ brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","), clientId: "banking-service" })

bankingRouter.get("/accounts", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT * FROM bank_accounts WHERE tenant_id=$1 ORDER BY name", [(req as any).tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

bankingRouter.post("/accounts", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      name: z.string().min(1), bank: z.string().min(1),
      balance: z.number().default(0), currency: z.string().length(3).default("USD"),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "INSERT INTO bank_accounts (tenant_id,name,bank_name,balance,currency) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [tenantId, body.name, body.bank, body.balance, body.currency]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

bankingRouter.get("/transactions", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.query
    const tenantId = (req as any).tenantId
    const q = accountId
      ? "SELECT * FROM bank_transactions WHERE tenant_id=$1 AND account_id=$2 ORDER BY date DESC LIMIT 200"
      : "SELECT * FROM bank_transactions WHERE tenant_id=$1 ORDER BY date DESC LIMIT 200"
    const result = await pool.query(q, accountId ? [tenantId, accountId] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

bankingRouter.post("/accounts/:id/reconcile", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    await pool.query("UPDATE bank_accounts SET last_reconciled_at=NOW(), status='Reconciled' WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    
    await producer.send(TOPICS.BANKING, {
      eventType: "RECONCILIATION_COMPLETE", tenantId, accountId: req.params.id,
      period: new Date().toISOString().slice(0, 7),
      matchedCount: 0, unmatchedCount: 0, timestamp: new Date().toISOString()
    })
    res.json({ success: true, reconciledAt: new Date() })
  } catch (err) { next(err) }
})

bankingRouter.post("/accounts/:id/import", authenticate, upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const accountId = req.params.id
    if (!req.file) return res.status(400).json({ message: "No file uploaded" })

    const content = req.file.buffer.toString("utf-8")
    const rows = parse(content, { columns: true, skip_empty_lines: true, trim: true })

    let imported = 0
    for (const row of rows as any[]) {
      const date = row.date || row.Date || row.DATE
      const description = row.description || row.Description || row.narrative || "Import"
      const amount = parseFloat(row.amount || row.Amount || row.credit || row.debit || "0")
      if (!date || isNaN(amount) || amount === 0) continue

      const type = amount > 0 ? "credit" : "debit"
      await pool.query(
        "INSERT INTO bank_transactions (tenant_id,account_id,date,description,type,amount,match_status) VALUES($1,$2,$3,$4,$5,$6,'unmatched')",
        [tenantId, accountId, date, description, type, Math.abs(amount)]
      )

      await producer.send(TOPICS.BANKING, {
        eventType: "BANK_TRANSACTION_IMPORTED", tenantId, accountId,
        transactionId: `import-${Date.now()}-${imported}`,
        amount: Math.abs(amount), type, description, date,
        timestamp: new Date().toISOString()
      })
      imported++
    }

    res.json({ success: true, imported, total: rows.length })
  } catch (err) { next(err) }
})

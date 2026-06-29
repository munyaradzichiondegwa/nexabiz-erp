
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"

export const apRouter = Router()
const producer = new KafkaProducer({ brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","), clientId: "ap-service" })

apRouter.get("/bills", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const tenantId = (req as any).tenantId
    const q = status
      ? "SELECT * FROM ap_bills WHERE tenant_id=$1 AND status=$2 ORDER BY due_date ASC"
      : "SELECT * FROM ap_bills WHERE tenant_id=$1 ORDER BY due_date ASC"
    const result = await pool.query(q, status ? [tenantId, status] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

apRouter.post("/bills/:id/pay", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const bill = await pool.query("SELECT * FROM ap_bills WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    if (!bill.rows[0]) return res.status(404).json({ message: "Bill not found" })
    
    await pool.query("UPDATE ap_bills SET status='paid', amount_paid=total WHERE id=$1", [req.params.id])
    
    // Fire GL posting event
    await producer.send(TOPICS.GL_REQUESTS, {
      eventType: "GL_POSTING_REQUESTED",
      tenantId, correlationId: req.params.id,
      source: "ap-service", sourceId: req.params.id,
      date: new Date().toISOString().split("T")[0],
      description: `AP Payment: ${bill.rows[0].number}`,
      lines: [
        { accountId: "2000", debit: bill.rows[0].total, credit: 0 },
        { accountId: "1010", debit: 0, credit: bill.rows[0].total },
      ],
      timestamp: new Date().toISOString()
    })
    
    res.json({ success: true, billId: req.params.id })
  } catch (err) { next(err) }
})

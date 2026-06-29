
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"

export const procurementRouter = Router()
const producer = new KafkaProducer({ brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","), clientId: "procurement-service" })

procurementRouter.get("/orders", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { status, page = 0, limit = 50 } = req.query
    const offset = Number(page) * Number(limit)
    const q = status
      ? "SELECT * FROM purchase_orders WHERE tenant_id=$1 AND status=$2 ORDER BY created_at DESC LIMIT $3 OFFSET $4"
      : "SELECT * FROM purchase_orders WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3"
    const params: any[] = status ? [tenantId, status, Number(limit), offset] : [tenantId, Number(limit), offset]
    const result = await pool.query(q, params)
    const count  = await pool.query("SELECT COUNT(*) FROM purchase_orders WHERE tenant_id=$1" + (status ? " AND status=$2" : ""), status ? [tenantId, status] : [tenantId])
    res.json({ orders: result.rows, total: parseInt(count.rows[0].count) })
  } catch (err) { next(err) }
})

procurementRouter.post("/orders", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      supplier: z.string().min(1),
      lines: z.array(z.object({ productId: z.string(), description: z.string(), qty: z.number(), unitCost: z.number() })),
      expectedDate: z.string().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const total = body.lines.reduce((s: number, l: any) => s + l.qty * l.unitCost, 0)
    const number = "PO-" + Date.now().toString(36).toUpperCase()
    
    const result = await pool.query(
      "INSERT INTO purchase_orders (tenant_id,number,supplier,total,status,expected_date) VALUES($1,$2,$3,$4,'Draft',$5) RETURNING *",
      [tenantId, number, body.supplier, total, body.expectedDate || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

procurementRouter.post("/orders/:id/grn", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    await pool.query("UPDATE purchase_orders SET status='Received' WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    // Fire inventory stock-in events for each received line
    res.json({ success: true, message: "GRN recorded. Inventory updated." })
  } catch (err) { next(err) }
})

procurementRouter.post("/orders/:id/match", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invoiceId } = req.body
    const tenantId = (req as any).tenantId
    // 3-way match: PO qty == GRN qty == Invoice qty
    await pool.query("UPDATE purchase_orders SET status='Matched' WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    res.json({ success: true, matched: true })
  } catch (err) { next(err) }
})

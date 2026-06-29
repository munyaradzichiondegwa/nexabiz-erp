
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const serviceMgmtRouter = Router()

serviceMgmtRouter.get("/tickets", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { status } = req.query
    const q = status
      ? "SELECT * FROM service_tickets WHERE tenant_id=$1 AND status=$2 ORDER BY created_at DESC"
      : "SELECT * FROM service_tickets WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100"
    const result = await pool.query(q, status ? [tenantId, status] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

serviceMgmtRouter.post("/tickets", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      subject: z.string().min(1), description: z.string().optional(),
      customerId: z.string().uuid().optional(), priority: z.enum(["low","medium","high","critical"]).default("medium"),
      assetId: z.string().uuid().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const number = "TKT-" + Date.now().toString(36).toUpperCase()
    const result = await pool.query(
      "INSERT INTO service_tickets (tenant_id,number,subject,description,customer_id,priority,asset_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,'open') RETURNING *",
      [tenantId, number, body.subject, body.description, body.customerId||null, body.priority, body.assetId||null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

serviceMgmtRouter.patch("/tickets/:id/status", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({ status: z.enum(["open","in_progress","resolved","closed"]) }).parse(req.body)
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "UPDATE service_tickets SET status=$1, updated_at=NOW() WHERE id=$2 AND tenant_id=$3 RETURNING *",
      [status, req.params.id, tenantId]
    )
    if (!result.rows[0]) return res.status(404).json({ message: "Ticket not found" })
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

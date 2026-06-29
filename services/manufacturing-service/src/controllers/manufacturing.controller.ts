
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const manufacturingRouter = Router()

manufacturingRouter.get("/bom", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bill_of_materials WHERE tenant_id=$1 ORDER BY name", [(req as any).tenantId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

manufacturingRouter.get("/work-orders", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { status } = req.query
    const q = status
      ? "SELECT * FROM work_orders WHERE tenant_id=$1 AND status=$2 ORDER BY created_at DESC"
      : "SELECT * FROM work_orders WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 50"
    const result = await pool.query(q, status ? [tenantId, status] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

manufacturingRouter.post("/work-orders", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      bomId: z.string().uuid(),
      qty: z.number().positive(),
      scheduledStart: z.string().optional(),
      scheduledEnd: z.string().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const number = "WO-" + Date.now().toString(36).toUpperCase()
    const result = await pool.query(
      `INSERT INTO work_orders (tenant_id,number,bom_id,qty,status,scheduled_start,scheduled_end)
       VALUES($1,$2,$3,$4,'Planned',$5,$6) RETURNING *`,
      [tenantId, number, body.bomId, body.qty, body.scheduledStart||null, body.scheduledEnd||null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

manufacturingRouter.post("/work-orders/:id/complete", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    await pool.query(
      "UPDATE work_orders SET status='Completed', completed_at=NOW() WHERE id=$1 AND tenant_id=$2",
      [req.params.id, tenantId]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

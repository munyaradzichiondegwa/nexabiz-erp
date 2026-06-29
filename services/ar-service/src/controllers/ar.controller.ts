
import { Router, Request, Response, NextFunction } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const arRouter = Router()

arRouter.get("/invoices", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query
    const tenantId = (req as any).tenantId
    const q = status
      ? "SELECT * FROM ar_invoices WHERE tenant_id=$1 AND status=$2 ORDER BY due_date ASC"
      : "SELECT * FROM ar_invoices WHERE tenant_id=$1 ORDER BY due_date ASC"
    const result = await pool.query(q, status ? [tenantId, status] : [tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

arRouter.post("/invoices/:id/remind", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const inv = await pool.query("SELECT * FROM ar_invoices WHERE id=$1 AND tenant_id=$2", [req.params.id, tenantId])
    if (!inv.rows[0]) return res.status(404).json({ message: "Invoice not found" })
    // TODO: trigger notification-service to send email reminder
    res.json({ success: true, message: "Reminder queued" })
  } catch (err) { next(err) }
})

arRouter.get("/kpis", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN status='overdue' THEN total-amount_paid END),0) AS overdue,
         COALESCE(SUM(CASE WHEN status='current' THEN total-amount_paid END),0) AS current_ar,
         COALESCE(SUM(total-amount_paid),0) AS total_outstanding
       FROM ar_invoices WHERE tenant_id=$1 AND status NOT IN ('paid','cancelled')`,
      [tenantId]
    )
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

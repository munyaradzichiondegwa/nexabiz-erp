
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const workflowsRouter = Router()

workflowsRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT * FROM workflow_definitions WHERE tenant_id=$1 AND is_active=true ORDER BY name",
      [(req as any).tenantId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

workflowsRouter.get("/pending", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const userId = (req as any).user.sub
    const result = await pool.query(
      `SELECT wi.*, wd.name AS workflow_name FROM workflow_instances wi
       JOIN workflow_definitions wd ON wd.id = wi.workflow_id
       WHERE wi.tenant_id=$1 AND wi.status='pending'
       AND wi.current_step_approver = $2
       ORDER BY wi.created_at DESC`,
      [tenantId, userId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

workflowsRouter.post("/:instanceId/approve", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { comment } = z.object({ comment: z.string().optional() }).parse(req.body)
    const tenantId = (req as any).tenantId
    const userId = (req as any).user.sub
    await pool.query(
      `UPDATE workflow_instances SET status='approved', approved_by=$1, approved_at=NOW(), approver_comment=$2
       WHERE id=$3 AND tenant_id=$4`,
      [userId, comment, req.params.instanceId, tenantId]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

workflowsRouter.post("/:instanceId/reject", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = z.object({ reason: z.string().min(1) }).parse(req.body)
    const tenantId = (req as any).tenantId
    const userId = (req as any).user.sub
    await pool.query(
      "UPDATE workflow_instances SET status='rejected', approved_by=$1, approved_at=NOW(), approver_comment=$2 WHERE id=$3 AND tenant_id=$4",
      [userId, reason, req.params.instanceId, tenantId]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
})

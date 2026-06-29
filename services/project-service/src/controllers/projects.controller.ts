
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const projectsRouter = Router()

projectsRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects WHERE tenant_id=$1 ORDER BY created_at DESC", [(req as any).tenantId]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
})

projectsRouter.post("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      name: z.string().min(1), description: z.string().optional(),
      customerId: z.string().uuid().optional(), budget: z.number().optional(),
      startDate: z.string().optional(), endDate: z.string().optional(),
      billingType: z.enum(["fixed","time_material","retainer"]).default("fixed"),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const managerId = (req as any).user.sub
    const result = await pool.query(
      `INSERT INTO projects (tenant_id,name,description,customer_id,manager_id,budget,start_date,end_date,billing_type)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tenantId, body.name, body.description, body.customerId||null, managerId,
       body.budget||null, body.startDate||null, body.endDate||null, body.billingType]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

projectsRouter.get("/:id/tasks", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT * FROM project_tasks WHERE project_id=$1 ORDER BY created_at", [req.params.id])
    res.json(result.rows)
  } catch (err) { next(err) }
})

projectsRouter.post("/:id/time", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      hours: z.number().positive(), description: z.string().optional(),
      date: z.string(), billable: z.boolean().default(true), taskId: z.string().uuid().optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const userId = (req as any).user.sub
    const result = await pool.query(
      "INSERT INTO time_entries (tenant_id,project_id,task_id,user_id,hours,description,date,billable) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
      [tenantId, req.params.id, body.taskId||null, userId, body.hours, body.description, body.date, body.billable]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

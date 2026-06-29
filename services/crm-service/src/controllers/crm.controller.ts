
import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const crmRouter = Router()

crmRouter.get("/customers", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { search, segment, page = 0, limit = 50 } = req.query
    const offset = Number(page) * Number(limit)
    
    let whereClause = "WHERE tenant_id=$1 AND is_active=true"
    const params: any[] = [tenantId, Number(limit), offset]
    
    if (search) { whereClause += " AND (name ILIKE $4 OR email ILIKE $4)"; params.push(`%${search}%`) }
    if (segment && !search) { whereClause += " AND segment=$4"; params.push(segment) }
    else if (segment && search) { whereClause += " AND segment=$5"; params.push(segment) }
    
    const result = await pool.query(
      `SELECT * FROM customers ${whereClause} ORDER BY total_spend DESC LIMIT $2 OFFSET $3`, params
    )
    const count = await pool.query(`SELECT COUNT(*) FROM customers WHERE tenant_id=$1 AND is_active=true`, [tenantId])
    res.json({ customers: result.rows, total: parseInt(count.rows[0].count) })
  } catch (err) { next(err) }
})

crmRouter.post("/customers", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      name: z.string().min(1), email: z.string().email().optional(),
      phone: z.string().optional(), creditLimit: z.number().default(0),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "INSERT INTO customers (tenant_id,name,email,phone,credit_limit,segment) VALUES($1,$2,$3,$4,$5,'New') RETURNING *",
      [tenantId, body.name, body.email, body.phone, body.creditLimit]
    )
    res.status(201).json(result.rows[0])
  } catch (err) { next(err) }
})

crmRouter.get("/customers/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT * FROM customers WHERE id=$1 AND tenant_id=$2", [req.params.id, (req as any).tenantId])
    if (!result.rows[0]) return res.status(404).json({ message: "Customer not found" })
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

crmRouter.put("/customers/:id", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ name: z.string().optional(), email: z.string().email().optional(), creditLimit: z.number().optional() }).parse(req.body)
    const tenantId = (req as any).tenantId
    const sets: string[] = []; const vals: any[] = [tenantId, req.params.id]
    if (body.name) { vals.push(body.name); sets.push(`name=$${vals.length}`) }
    if (body.email) { vals.push(body.email); sets.push(`email=$${vals.length}`) }
    if (body.creditLimit !== undefined) { vals.push(body.creditLimit); sets.push(`credit_limit=$${vals.length}`) }
    if (!sets.length) return res.json({ success: true })
    const result = await pool.query(`UPDATE customers SET ${sets.join(",")} WHERE tenant_id=$1 AND id=$2 RETURNING *`, vals)
    res.json(result.rows[0])
  } catch (err) { next(err) }
})

crmRouter.get("/kpis", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const result = await pool.query(
      "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE segment='At Risk') AS at_risk, AVG(credit_limit) AS avg_credit FROM customers WHERE tenant_id=$1 AND is_active=true",
      [tenantId]
    )
    res.json(result.rows[0])
  } catch (err) { next(err) }
})


import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate, requirePermission } from "../middleware/auth.middleware"
import { pool } from "../config/database"

export const usersRouter = Router()

usersRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const { page = 0, limit = 50, search } = req.query
    const offset = Number(page) * Number(limit)
    
    const query = search
      ? `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.mfa_enabled, u.last_login_at, u.created_at,
                array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS roles
         FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
         WHERE u.tenant_id=$1 AND (u.email ILIKE $4 OR u.first_name ILIKE $4 OR u.last_name ILIKE $4)
         GROUP BY u.id ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`
      : `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.mfa_enabled, u.last_login_at, u.created_at,
                array_agg(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS roles
         FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
         WHERE u.tenant_id=$1 GROUP BY u.id ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`
    
    const params = search ? [tenantId, Number(limit), offset, `%${search}%`] : [tenantId, Number(limit), offset]
    const result = await pool.query(query, params)
    const count  = await pool.query("SELECT COUNT(*) FROM users WHERE tenant_id=$1", [tenantId])
    
    res.json({ users: result.rows, total: parseInt(count.rows[0].count), page: Number(page) })
  } catch (err) { next(err) }
})

usersRouter.post("/", authenticate, requirePermission("users:create"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      roles: z.array(z.string()).optional(),
    }).parse(req.body)
    const tenantId = (req as any).tenantId
    const tempPassword = "ChangeMe@" + Math.random().toString(36).slice(-8)
    const bcrypt = await import("bcryptjs")
    const hash = await bcrypt.default.hash(tempPassword, 12)
    
    const result = await pool.query(
      "INSERT INTO users (tenant_id,email,password_hash,first_name,last_name) VALUES($1,$2,$3,$4,$5) RETURNING id,email,first_name,last_name,is_active",
      [tenantId, body.email.toLowerCase(), hash, body.firstName, body.lastName]
    )
    res.status(201).json({ ...result.rows[0], tempPassword })
  } catch (err) { next(err) }
})

usersRouter.patch("/:id/status", authenticate, requirePermission("users:manage"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body)
    const tenantId = (req as any).tenantId
    await pool.query("UPDATE users SET is_active=$1 WHERE id=$2 AND tenant_id=$3", [isActive, req.params.id, tenantId])
    res.json({ success: true })
  } catch (err) { next(err) }
})

usersRouter.get("/roles", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query("SELECT * FROM roles WHERE tenant_id=$1 ORDER BY name", [(req as any).tenantId])
    res.json(result.rows)
  } catch (err) { next(err) }
})

import { Router } from "express"
import bcrypt from "bcryptjs"
import { body, validationResult } from "express-validator"
import { authenticate, requirePermission, AuthRequest } from "../middleware/auth.middleware"
import { db } from "../config/database"
import { AppError } from "../middleware/error.middleware"

export const userRouter = Router()
userRouter.use(authenticate)

const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  next()
}

// GET /api/v1/users — list tenant users
userRouter.get("/", requirePermission("users:read"), async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, first_name, last_name, status, mfa_enabled, last_login_at, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC",
      [req.user!.tenantId]
    )
    res.json(rows.map(u => ({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, status: u.status, mfaEnabled: u.mfa_enabled, lastLoginAt: u.last_login_at, createdAt: u.created_at })))
  } catch (err) { next(err) }
})

// POST /api/v1/users — create user
userRouter.post("/", requirePermission("users:write"),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  validate,
  async (req: AuthRequest, res, next) => {
    try {
      const hash = await bcrypt.hash(req.body.password, 12)
      const { rows } = await db.query(`
        INSERT INTO users (tenant_id, email, password_hash, first_name, last_name)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, status, created_at
      `, [req.user!.tenantId, req.body.email, hash, req.body.firstName, req.body.lastName])
      res.status(201).json(rows[0])
    } catch (err: any) {
      if (err.code === "23505") return next(new AppError(409, "Email already registered"))
      next(err)
    }
  }
)

// PATCH /api/v1/users/:id/status
userRouter.patch("/:id/status", requirePermission("users:write"), async (req: AuthRequest, res, next) => {
  try {
    await db.query("UPDATE users SET status = $1 WHERE id = $2 AND tenant_id = $3", [req.body.status, req.params.id, req.user!.tenantId])
    res.json({ message: "User status updated" })
  } catch (err) { next(err) }
})

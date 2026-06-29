import { Router } from "express"
import { body, validationResult } from "express-validator"
import { login, refresh, logout } from "../services/auth.service"
import { authenticate, AuthRequest } from "../middleware/auth.middleware"
import { AppError } from "../middleware/error.middleware"
import { db } from "../config/database"

export const authRouter = Router()

const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() })
  next()
}

// POST /api/v1/auth/login
authRouter.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  validate,
  async (req, res, next) => {
    try {
      const result = await login(req.body.email, req.body.password, req.body.tenantSlug)
      res.json(result)
    } catch (err) { next(err) }
  }
)

// POST /api/v1/auth/refresh
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body.refreshToken
    if (!token) throw new AppError(400, "Refresh token required")
    const result = await refresh(token)
    res.json(result)
  } catch (err) { next(err) }
})

// GET /api/v1/auth/me
authRouter.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, first_name, last_name, tenant_id, mfa_enabled FROM users WHERE id = $1",
      [req.user!.id]
    )
    if (!rows[0]) throw new AppError(404, "User not found")
    const u = rows[0]
    res.json({ id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, tenantId: u.tenant_id, mfaEnabled: u.mfa_enabled, roles: req.user!.roles, permissions: req.user!.permissions })
  } catch (err) { next(err) }
})

// POST /api/v1/auth/logout
authRouter.post("/logout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const token = req.headers.authorization!.slice(7)
    const payload: any = require("jsonwebtoken").decode(token)
    await logout(req.user!.id, payload.jti)
    res.json({ message: "Logged out" })
  } catch (err) { next(err) }
})

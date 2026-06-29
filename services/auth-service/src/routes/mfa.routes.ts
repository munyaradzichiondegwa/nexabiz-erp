import { Router } from "express"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import { authenticate, AuthRequest } from "../middleware/auth.middleware"
import { db } from "../config/database"
import { AppError } from "../middleware/error.middleware"
import bcrypt from "bcryptjs"

export const mfaRouter = Router()

// POST /api/v1/mfa/setup — generate TOTP secret
mfaRouter.post("/setup", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await db.query("SELECT email FROM users WHERE id = $1", [req.user!.id])
    const email = rows[0]?.email
    const secret = speakeasy.generateSecret({ name: `NexaBiz (${email})`, issuer: "NexaBiz ERP" })
    const qr = await qrcode.toDataURL(secret.otpauth_url!)
    await db.query("UPDATE users SET mfa_secret = $1 WHERE id = $2", [secret.base32, req.user!.id])
    res.json({ secret: secret.base32, qrCode: qr })
  } catch (err) { next(err) }
})

// POST /api/v1/mfa/verify — verify + enable
mfaRouter.post("/verify", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rows } = await db.query("SELECT mfa_secret FROM users WHERE id = $1", [req.user!.id])
    const secret = rows[0]?.mfa_secret
    if (!secret) throw new AppError(400, "MFA not set up")
    const valid = speakeasy.totp.verify({ secret, encoding: "base32", token: req.body.code, window: 1 })
    if (!valid) throw new AppError(400, "Invalid MFA code")
    await db.query("UPDATE users SET mfa_enabled = TRUE WHERE id = $1", [req.user!.id])
    res.json({ message: "MFA enabled successfully" })
  } catch (err) { next(err) }
})

// POST /api/v1/mfa/validate — validate code during login
mfaRouter.post("/validate", async (req, res, next) => {
  try {
    const jwt = require("jsonwebtoken")
    let payload: any
    try { payload = jwt.verify(req.body.mfaToken, process.env.JWT_SECRET!) }
    catch { throw new AppError(401, "Invalid or expired MFA session") }
    if (payload.type !== "mfa") throw new AppError(401, "Invalid token type")

    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [payload.sub])
    const user = rows[0]
    if (!user) throw new AppError(401, "User not found")

    const valid = speakeasy.totp.verify({ secret: user.mfa_secret, encoding: "base32", token: req.body.code, window: 1 })
    if (!valid) throw new AppError(400, "Invalid MFA code")

    res.json({ message: "MFA validated", userId: user.id })
  } catch (err) { next(err) }
})

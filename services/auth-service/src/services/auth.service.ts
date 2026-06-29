import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import { db } from "../config/database"
import { setToken, deleteToken, blacklistToken } from "../config/redis"
import { AppError } from "../middleware/error.middleware"
import { logger } from "../config/logger"

const ACCESS_TTL  = parseInt(process.env.JWT_ACCESS_EXPIRY  ?? "900")    // 15 min
const REFRESH_TTL = parseInt(process.env.JWT_REFRESH_EXPIRY ?? "604800") // 7 days

export interface LoginResult {
  accessToken:  string
  refreshToken: string
  user: {
    id: string; tenantId: string; email: string
    firstName: string; lastName: string
    roles: string[]; permissions: string[]
  }
  requiresMfa?: boolean
  mfaToken?:   string
}

function signAccess(payload: object): string {
  return jwt.sign({ ...payload, jti: uuidv4() }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TTL })
}

function signRefresh(userId: string): string {
  return jwt.sign({ sub: userId, jti: uuidv4() }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL })
}

export async function login(email: string, password: string, tenantSlug?: string): Promise<LoginResult> {
  // Fetch user
  const { rows } = await db.query(`
    SELECT u.*, t.slug AS tenant_slug
    FROM users u
    JOIN tenants t ON t.id = u.tenant_id
    WHERE LOWER(u.email) = LOWER($1)
      AND t.slug = COALESCE($2, t.slug)
      AND t.status = 'active'
    LIMIT 1
  `, [email, tenantSlug ?? null])

  const user = rows[0]
  if (!user) throw new AppError(401, "Invalid email or password")

  // Account lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AppError(429, `Account locked until ${new Date(user.locked_until).toLocaleTimeString()}`)
  }

  // Password check
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    await db.query(`
      UPDATE users SET login_attempts = login_attempts + 1,
        locked_until = CASE WHEN login_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes' ELSE NULL END
      WHERE id = $1
    `, [user.id])
    throw new AppError(401, "Invalid email or password")
  }

  // Reset failed attempts on success
  await db.query("UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1", [user.id])

  // MFA check
  if (user.mfa_enabled) {
    const mfaToken = jwt.sign({ sub: user.id, type: "mfa" }, process.env.JWT_SECRET!, { expiresIn: 300 })
    return { requiresMfa: true, mfaToken, accessToken: "", refreshToken: "", user: { id: "", tenantId: "", email: "", firstName: "", lastName: "", roles: [], permissions: [] } }
  }

  return issueTokens(user)
}

async function issueTokens(user: any): Promise<LoginResult> {
  // Fetch roles & permissions
  const { rows: roleRows } = await db.query(`
    SELECT r.name, r.permissions FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = $1
  `, [user.id])

  const roles = roleRows.map((r: any) => r.name)
  const permissions = [...new Set(roleRows.flatMap((r: any) => r.permissions as string[]))]

  const payload = { sub: user.id, tenantId: user.tenant_id, email: user.email, roles, permissions }
  const accessToken  = signAccess(payload)
  const refreshToken = signRefresh(user.id)

  // Store refresh token hash in DB
  const hash = await bcrypt.hash(refreshToken, 10)
  await db.query(`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '7 days')
  `, [user.id, hash])

  await setToken(`refresh:${user.id}`, refreshToken, REFRESH_TTL)

  logger.info({ event: "login", userId: user.id, tenantId: user.tenant_id })

  return {
    accessToken, refreshToken,
    user: { id: user.id, tenantId: user.tenant_id, email: user.email, firstName: user.first_name, lastName: user.last_name, roles, permissions },
  }
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string }> {
  let payload: any
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
  } catch {
    throw new AppError(401, "Invalid refresh token")
  }

  const { rows } = await db.query(`
    SELECT rt.*, u.* FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.user_id = $1 AND rt.revoked = FALSE AND rt.expires_at > NOW()
    ORDER BY rt.created_at DESC LIMIT 10
  `, [payload.sub])

  let matched = null
  for (const row of rows) {
    if (await bcrypt.compare(refreshToken, row.token_hash)) { matched = row; break }
  }
  if (!matched) throw new AppError(401, "Refresh token not found or expired")

  const { rows: roleRows } = await db.query(`
    SELECT r.name, r.permissions FROM roles r JOIN user_roles ur ON ur.role_id = r.id WHERE ur.user_id = $1
  `, [matched.user_id])

  const roles = roleRows.map((r: any) => r.name)
  const permissions = [...new Set(roleRows.flatMap((r: any) => r.permissions as string[]))]

  const accessToken = signAccess({ sub: matched.user_id, tenantId: matched.tenant_id, email: matched.email, roles, permissions })
  return { accessToken }
}

export async function logout(userId: string, jti: string) {
  await db.query("UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1", [userId])
  await deleteToken(`refresh:${userId}`)
  await blacklistToken(jti, ACCESS_TTL)
  logger.info({ event: "logout", userId })
}

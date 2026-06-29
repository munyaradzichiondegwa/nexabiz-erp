import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
const SECRET = process.env.JWT_SECRET ?? "dev-secret-CHANGE-ME"
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" })
  try {
    const d = jwt.verify(h.slice(7), SECRET) as any
    ;(req as any).user = d
    ;(req as any).tenantId = d.tenantId
    next()
  } catch { return res.status(401).json({ message: "Invalid token" }) }
}
export function requirePermission(perm: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user?.permissions?.includes(perm) && !user?.roles?.includes("super_admin") && !user?.roles?.includes("admin")) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }
    next()
  }
}

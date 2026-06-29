import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authService } from "../services/auth.service"
import { authenticate } from "../middleware/auth.middleware"

export const authRouter = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().length(6).optional(),
})

authRouter.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body)
    const result = await authService.login(body.email, body.password, body.mfaCode)
    res.json(result)
  } catch (err) { next(err) }
})

authRouter.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body)
    const result = await authService.refreshTokens(refreshToken)
    res.json(result)
  } catch (err) { next(err) }
})

authRouter.post("/logout", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout((req as any).user.sub)
    res.json({ success: true })
  } catch (err) { next(err) }
})

authRouter.get("/me", authenticate, (req: Request, res: Response) => {
  res.json((req as any).user)
})

authRouter.post("/mfa/setup", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.setupMFA((req as any).user.sub)
    res.json(result)
  } catch (err) { next(err) }
})

authRouter.post("/mfa/verify", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body)
    await authService.verifyAndEnableMFA((req as any).user.sub, code)
    res.json({ success: true, message: "MFA enabled" })
  } catch (err) { next(err) }
})

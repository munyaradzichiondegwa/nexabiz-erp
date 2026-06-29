import { Router, Request, Response, NextFunction } from "express"
import { authenticate } from "../middleware/auth.middleware"

export const notificationsRouter = Router()

// Get notification log for tenant (recent 50)
notificationsRouter.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In production: query notification_logs table in nexabiz_config DB
    res.json({
      notifications: [],
      total: 0,
      message: "Connect to notification_logs table for live data",
    })
  } catch (err) { next(err) }
})

// Get queue depth (admin)
notificationsRouter.get("/queue/depth", authenticate, (_req: Request, res: Response) => {
  res.json({ queueDepth: 0, ts: new Date().toISOString() })
})

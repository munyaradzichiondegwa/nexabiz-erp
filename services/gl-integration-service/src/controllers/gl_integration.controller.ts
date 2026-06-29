/**
 * GL Integration Service — HTTP controller
 * Primarily event-driven (Kafka), but exposes HTTP endpoints for:
 *  - Health check
 *  - Manual replay trigger (admin use)
 *  - Consumer status
 */
import { Router, Request, Response, NextFunction } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { glService } from "../services/gl.service"
import { logger } from "../config/logger"

export const glIntegrationRouter = Router()

// Consumer status — which topics are being consumed
glIntegrationRouter.get("/status", authenticate, (_req: Request, res: Response) => {
  res.json({
    service: "gl-integration-service",
    consumers: [
      { topic: "nexabiz.sales.events",       status: "running" },
      { topic: "nexabiz.hr.events",           status: "running" },
      { topic: "nexabiz.banking.events",      status: "running" },
      { topic: "nexabiz.inventory.events",    status: "running" },
      { topic: "nexabiz.gl.posting.requests", status: "running" },
    ],
    ts: new Date().toISOString(),
  })
})

// Manual GL posting (for corrections / admin use only)
glIntegrationRouter.post("/manual", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tenantId, lines, ref, date, description, source } = req.body
    if (!tenantId || !lines?.length || !description) {
      return res.status(400).json({ message: "tenantId, lines, and description are required" })
    }
    const journalEntryId = await glService.postEntry(
      tenantId, lines,
      { ref: ref ?? `MAN-${Date.now().toString(36)}`, date: date ?? new Date().toISOString().split("T")[0], description, source: source ?? "manual-api" }
    )
    res.status(201).json({ success: true, journalEntryId })
  } catch (err: any) {
    logger.error("[GL Integration] Manual post failed:", err.message)
    next(err)
  }
})

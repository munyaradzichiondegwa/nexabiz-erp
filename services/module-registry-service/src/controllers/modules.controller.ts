import { Router, Request, Response, NextFunction } from "express"
import { z } from "zod"
import { authenticate } from "../middleware/auth.middleware"
import { modulesService } from "../services/modules.service"

export const modulesRouter = Router()

// GET /api/v1/modules/status — list all modules with active status for tenant
modulesRouter.get("/status", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = (req as any).tenantId
    const modules = await modulesService.getStatus(tenantId)
    res.json(modules)
  } catch (err) { next(err) }
})

// POST /api/v1/modules/:code/toggle — activate/deactivate a module
modulesRouter.post("/:code/toggle", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params
    const { activate } = z.object({ activate: z.boolean() }).parse(req.body)
    const tenantId = (req as any).tenantId
    const userId   = (req as any).user.sub
    const result   = await modulesService.toggle(tenantId, code, activate, userId)
    res.json(result)
  } catch (err) { next(err) }
})

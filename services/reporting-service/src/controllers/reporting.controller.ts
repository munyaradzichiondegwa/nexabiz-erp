import { Router, Request, Response, NextFunction } from "express"
import { authenticate } from "../middleware/auth.middleware"
import { reportingService } from "../services/reporting.service"

export const reportingRouter = Router()

// Dashboard KPIs
reportingRouter.get("/dashboard/kpis", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpis = await reportingService.getDashboardKPIs((req as any).tenantId)
    res.json(kpis)
  } catch (err) { next(err) }
})

reportingRouter.get("/dashboard/revenue-trend", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trend = await reportingService.getRevenueTrend((req as any).tenantId)
    res.json(trend)
  } catch (err) { next(err) }
})

reportingRouter.get("/dashboard/recent-gl", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gl = await reportingService.getRecentGL((req as any).tenantId)
    res.json(gl)
  } catch (err) { next(err) }
})

// Financial statements
reportingRouter.get("/balance-sheet",  authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await reportingService.getBalanceSheet((req as any).tenantId, req.query.period as string)) } catch (err) { next(err) }
})
reportingRouter.get("/profit-loss",    authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await reportingService.getProfitLoss((req as any).tenantId, req.query.period as string)) } catch (err) { next(err) }
})
reportingRouter.get("/cash-flow",      authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await reportingService.getCashFlow((req as any).tenantId)) } catch (err) { next(err) }
})

import { Router, Request, Response, NextFunction } from "express"
import { collectDefaultMetrics, Counter, Histogram, Registry } from "prom-client"
const register = new Registry()
collectDefaultMetrics({ register })
const httpReqs = new Counter({ name: "nexabiz_http_requests_total", help: "Total HTTP", labelNames: ["method","route","status"], registers: [register] })
const httpDur  = new Histogram({ name: "nexabiz_http_duration_ms", help: "HTTP duration", labelNames: ["method","route"], registers: [register] })
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const s = Date.now()
  res.on("finish", () => {
    httpReqs.inc({ method: req.method, route: req.route?.path ?? req.path, status: res.statusCode })
    httpDur.observe({ method: req.method, route: req.route?.path ?? req.path }, Date.now() - s)
  })
  next()
}
export const metricsRouter = Router()
metricsRouter.get("/", async (_: Request, res: Response) => {
  res.set("Content-Type", register.contentType)
  res.send(await register.metrics())
})

import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { logger } from "../config/logger"
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const cid = req.headers["x-correlation-id"] as string
  logger.error({ message: err.message, path: req.path, cid })
  if (err instanceof ZodError) return res.status(400).json({ statusCode: 400, error: "Validation Error", details: err.errors, cid })
  const status = err.statusCode ?? 500
  return res.status(status).json({ statusCode: status, error: status < 500 ? err.message : "Internal server error", cid, timestamp: new Date().toISOString() })
}

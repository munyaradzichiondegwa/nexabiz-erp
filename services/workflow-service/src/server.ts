import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import { workflowsRouter } from "./controllers/workflows.controller"
import { errorHandler } from "./middleware/error.middleware"
import { metricsMiddleware, metricsRouter } from "./middleware/metrics.middleware"
import { logger } from "./config/logger"
import "./config/database"

const app = express()
const PORT = process.env.PORT ?? 3016

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(metricsMiddleware)
app.use(rateLimit({ windowMs: 60_000, max: 500, standardHeaders: true, legacyHeaders: false }))

app.use("/api/v1/workflows", workflowsRouter)
app.use("/metrics", metricsRouter)
app.get("/health", (_, res) => res.json({ status: "ok", service: "workflow-service", ts: new Date() }))
app.use(errorHandler)

app.listen(PORT, () => logger.info(`workflow-service listening on :${PORT}`))
export default app

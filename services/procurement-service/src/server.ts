import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import { procurementRouter } from "./controllers/procurement.controller"
import { errorHandler } from "./middleware/error.middleware"
import { metricsMiddleware, metricsRouter } from "./middleware/metrics.middleware"
import { logger } from "./config/logger"
import "./config/database"

const app = express()
const PORT = process.env.PORT ?? 3010

app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(metricsMiddleware)
app.use(rateLimit({ windowMs: 60_000, max: 500, standardHeaders: true, legacyHeaders: false }))

app.use("/api/v1/procurement", procurementRouter)
app.use("/metrics", metricsRouter)
app.get("/health", (_, res) => res.json({ status: "ok", service: "procurement-service", ts: new Date() }))
app.use(errorHandler)

app.listen(PORT, () => logger.info(`procurement-service listening on :${PORT}`))
export default app

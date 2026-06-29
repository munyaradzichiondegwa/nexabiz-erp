import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import { rateLimit } from "express-rate-limit"
import { authRouter } from "./routes/auth.routes"
import { userRouter } from "./routes/user.routes"
import { mfaRouter } from "./routes/mfa.routes"
import { errorHandler } from "./middleware/error.middleware"
import { logger } from "./config/logger"

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.APP_URL ?? "http://localhost:5173",
  credentials: true,
}))
app.use(compression() as any)

// Rate limiting — protect auth endpoints
app.use("/api/v1/auth", rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  max: 20,                      // 20 attempts per window
  message: { error: "Too many login attempts. Try again in 15 minutes." },
}))

app.use(express.json({ limit: "10kb" }))
app.use(morgan("combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
}))

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/v1/auth",  authRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/mfa",   mfaRouter)

// Error handler (must be last)
app.use(errorHandler)

export default app

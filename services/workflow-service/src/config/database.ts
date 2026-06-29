import { Pool } from "pg"
import { logger } from "./logger"
export const pool = new Pool({
  connectionString: process.env.WORKFLOW_DB_URL ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_workflow",
  max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000,
})
pool.on("error", err => logger.error("pg pool error:", err.message))
pool.connect().then(c => { c.release(); logger.info("nexabiz_workflow connected") }).catch(err => logger.error("nexabiz_workflow connection failed:", err.message))

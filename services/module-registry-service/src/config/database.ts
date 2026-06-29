import { Pool } from "pg"
import { logger } from "./logger"
export const pool = new Pool({
  connectionString: process.env.CONFIG_DB_URL ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_config",
  max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000,
})
pool.on("error", err => logger.error("pg pool error:", err.message))
pool.connect().then(c => { c.release(); logger.info("nexabiz_config connected") }).catch(err => logger.error("nexabiz_config connection failed:", err.message))

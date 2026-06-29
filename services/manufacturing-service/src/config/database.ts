import { Pool } from "pg"
import { logger } from "./logger"
export const pool = new Pool({
  connectionString: process.env.INVENTORY_DB_URL ?? "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_inventory",
  max: 20, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000,
})
pool.on("error", err => logger.error("pg pool error:", err.message))
pool.connect().then(c => { c.release(); logger.info("nexabiz_inventory connected") }).catch(err => logger.error("nexabiz_inventory connection failed:", err.message))

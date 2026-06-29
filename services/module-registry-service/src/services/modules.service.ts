import { pool } from "../config/database"
import { KafkaProducer } from "@nexabiz/kafka-client"
import { TOPICS } from "@nexabiz/kafka-client"
import { logger } from "../config/logger"

const producer = new KafkaProducer({
  brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  clientId: "module-registry-service",
})

const CORE_MODULES = new Set(["MOD-01","MOD-02","MOD-06","MOD-07","MOD-13","MOD-14"])

export const modulesService = {

  async getStatus(tenantId: string) {
    const result = await pool.query(
      `SELECT m.code, m.name, m.description, m.is_core,
              COALESCE(tm.is_active, m.is_core) AS is_active,
              tm.activated_at, tm.deactivated_at
       FROM module_definitions m
       LEFT JOIN tenant_modules tm ON tm.module_code = m.code AND tm.tenant_id = $1
       ORDER BY m.code`,
      [tenantId]
    )
    return result.rows
  },

  async toggle(tenantId: string, code: string, activate: boolean, userId: string) {
    if (CORE_MODULES.has(code)) {
      throw Object.assign(new Error("Core modules cannot be toggled"), { statusCode: 400 })
    }

    await pool.query(
      `INSERT INTO tenant_modules (tenant_id, module_code, is_active, activated_at, deactivated_at, activated_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tenant_id, module_code)
       DO UPDATE SET is_active=$3, activated_at=$4, deactivated_at=$5, activated_by=$6`,
      [tenantId, code, activate,
       activate ? new Date() : null,
       !activate ? new Date() : null,
       userId]
    )

    // Broadcast to all services via Kafka
    const eventType = activate ? "MODULE_ACTIVATED" : "MODULE_DEACTIVATED"
    try {
      await producer.send(TOPICS.MODULE, { eventType, tenantId, moduleCode: code, [activate ? "activatedBy" : "deactivatedBy"]: userId, timestamp: new Date().toISOString() })
    } catch (err) {
      logger.error("Kafka publish failed for module toggle:", err)
    }

    return { code, isActive: activate, tenantId }
  },
}

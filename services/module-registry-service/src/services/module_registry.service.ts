/**
 * ModuleRegistry Service — business logic layer
 * Sits between controller and database, enforces tenant isolation
 */
import { pool } from "../config/database"
import { logger } from "../config/logger"

export const moduleRegistryService = {

  async findAll(tenantId: string, page = 0, limit = 50) {
    const offset = page * limit
    const result = await pool.query(
      "SELECT * FROM tenant_modules WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [tenantId, limit, offset]
    )
    const count = await pool.query(
      "SELECT COUNT(*) FROM tenant_modules WHERE tenant_id=$1",
      [tenantId]
    )
    return {
      data: result.rows,
      total: parseInt(count.rows[0].count),
      page,
      limit,
    }
  },

  async findById(id: string, tenantId: string) {
    const result = await pool.query(
      "SELECT * FROM tenant_modules WHERE id=$1 AND tenant_id=$2",
      [id, tenantId]
    )
    return result.rows[0] ?? null
  },

  async softDelete(id: string, tenantId: string) {
    // Check if table supports is_active column
    try {
      await pool.query(
        "UPDATE tenant_modules SET is_active=false WHERE id=$1 AND tenant_id=$2",
        [id, tenantId]
      )
    } catch {
      // Table may not have is_active; do hard delete with audit
      await pool.query(
        "DELETE FROM tenant_modules WHERE id=$1 AND tenant_id=$2",
        [id, tenantId]
      )
    }
    logger.info(`[ModuleRegistry] Deleted ${id} for tenant ${tenantId}`)
  },
}

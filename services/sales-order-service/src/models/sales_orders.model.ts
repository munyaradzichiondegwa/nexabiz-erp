import { z } from "zod"

// ── SalesOrder ─────────────────────────────────────────────────────────────

export const SalesOrderSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  customerName: z.string()
  total: z.number()
  status: z.string()
  type: z.string()
})

export type SalesOrder = z.infer<typeof SalesOrderSchema>

export const CreateSalesOrderSchema = SalesOrderSchema.omit({ id: true }).partial()
export type CreateSalesOrderDto = z.infer<typeof CreateSalesOrderSchema>

export const UpdateSalesOrderSchema = SalesOrderSchema.partial()
export type UpdateSalesOrderDto = z.infer<typeof UpdateSalesOrderSchema>

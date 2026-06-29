import { z } from "zod"

// ── WorkOrder ─────────────────────────────────────────────────────────────

export const WorkOrderSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  bomId: z.string()
  qty: z.number()
  status: z.string()
})

export type WorkOrder = z.infer<typeof WorkOrderSchema>

export const CreateWorkOrderSchema = WorkOrderSchema.omit({ id: true }).partial()
export type CreateWorkOrderDto = z.infer<typeof CreateWorkOrderSchema>

export const UpdateWorkOrderSchema = WorkOrderSchema.partial()
export type UpdateWorkOrderDto = z.infer<typeof UpdateWorkOrderSchema>

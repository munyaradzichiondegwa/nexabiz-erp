import { z } from "zod"

// ── PosOrder ─────────────────────────────────────────────────────────────

export const PosOrderSchema = z.object({
  id: z.string()
  tenantId: z.string()
  orderNumber: z.string()
  total: z.number()
  paymentMethod: z.string()
  cashierId: z.string()
})

export type PosOrder = z.infer<typeof PosOrderSchema>

export const CreatePosOrderSchema = PosOrderSchema.omit({ id: true }).partial()
export type CreatePosOrderDto = z.infer<typeof CreatePosOrderSchema>

export const UpdatePosOrderSchema = PosOrderSchema.partial()
export type UpdatePosOrderDto = z.infer<typeof UpdatePosOrderSchema>

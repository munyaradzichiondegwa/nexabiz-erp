import { z } from "zod"

// ── PurchaseOrderModel ─────────────────────────────────────────────────────────────

export const PurchaseOrderModelSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  supplier: z.string()
  total: z.number()
  status: z.string()
})

export type PurchaseOrderModel = z.infer<typeof PurchaseOrderModelSchema>

export const CreatePurchaseOrderModelSchema = PurchaseOrderModelSchema.omit({ id: true }).partial()
export type CreatePurchaseOrderModelDto = z.infer<typeof CreatePurchaseOrderModelSchema>

export const UpdatePurchaseOrderModelSchema = PurchaseOrderModelSchema.partial()
export type UpdatePurchaseOrderModelDto = z.infer<typeof UpdatePurchaseOrderModelSchema>

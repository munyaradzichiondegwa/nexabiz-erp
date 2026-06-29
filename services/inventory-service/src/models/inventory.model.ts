import { z } from "zod"

// ── InventoryProduct ─────────────────────────────────────────────────────────────

export const InventoryProductSchema = z.object({
  id: z.string()
  tenantId: z.string()
  sku: z.string()
  name: z.string()
  price: z.number()
  cost: z.number()
  qty: z.number()
  reorderLevel: z.number()
})

export type InventoryProduct = z.infer<typeof InventoryProductSchema>

export const CreateInventoryProductSchema = InventoryProductSchema.omit({ id: true }).partial()
export type CreateInventoryProductDto = z.infer<typeof CreateInventoryProductSchema>

export const UpdateInventoryProductSchema = InventoryProductSchema.partial()
export type UpdateInventoryProductDto = z.infer<typeof UpdateInventoryProductSchema>

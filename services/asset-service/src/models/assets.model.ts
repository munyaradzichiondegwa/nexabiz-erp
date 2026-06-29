import { z } from "zod"

// ── FixedAsset ─────────────────────────────────────────────────────────────

export const FixedAssetSchema = z.object({
  id: z.string()
  tenantId: z.string()
  name: z.string()
  category: z.string()
  purchaseCost: z.number()
  currentValue: z.number()
  usefulLifeYears: z.number()
  status: z.string()
})

export type FixedAsset = z.infer<typeof FixedAssetSchema>

export const CreateFixedAssetSchema = FixedAssetSchema.omit({ id: true }).partial()
export type CreateFixedAssetDto = z.infer<typeof CreateFixedAssetSchema>

export const UpdateFixedAssetSchema = FixedAssetSchema.partial()
export type UpdateFixedAssetDto = z.infer<typeof UpdateFixedAssetSchema>

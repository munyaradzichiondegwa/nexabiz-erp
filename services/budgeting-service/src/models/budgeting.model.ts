import { z } from "zod"

// ── Budget ─────────────────────────────────────────────────────────────

export const BudgetSchema = z.object({
  id: z.string()
  tenantId: z.string()
  fiscalYear: z.number()
  accountCode: z.string()
  accountName: z.string()
  total: z.number()
})

export type Budget = z.infer<typeof BudgetSchema>

export const CreateBudgetSchema = BudgetSchema.omit({ id: true }).partial()
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>

export const UpdateBudgetSchema = BudgetSchema.partial()
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>

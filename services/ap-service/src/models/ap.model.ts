import { z } from "zod"

// ── ApBill ─────────────────────────────────────────────────────────────

export const ApBillSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  supplier: z.string()
  total: z.number()
  amountPaid: z.number()
  dueDate: z.string()
  status: z.string()
})

export type ApBill = z.infer<typeof ApBillSchema>

export const CreateApBillSchema = ApBillSchema.omit({ id: true }).partial()
export type CreateApBillDto = z.infer<typeof CreateApBillSchema>

export const UpdateApBillSchema = ApBillSchema.partial()
export type UpdateApBillDto = z.infer<typeof UpdateApBillSchema>

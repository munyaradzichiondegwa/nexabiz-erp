import { z } from "zod"

// ── ArInvoice ─────────────────────────────────────────────────────────────

export const ArInvoiceSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  customer: z.string()
  total: z.number()
  amountPaid: z.number()
  dueDate: z.string()
  status: z.string()
})

export type ArInvoice = z.infer<typeof ArInvoiceSchema>

export const CreateArInvoiceSchema = ArInvoiceSchema.omit({ id: true }).partial()
export type CreateArInvoiceDto = z.infer<typeof CreateArInvoiceSchema>

export const UpdateArInvoiceSchema = ArInvoiceSchema.partial()
export type UpdateArInvoiceDto = z.infer<typeof UpdateArInvoiceSchema>

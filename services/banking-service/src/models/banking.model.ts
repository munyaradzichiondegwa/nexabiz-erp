import { z } from "zod"

// ── BankTransaction ─────────────────────────────────────────────────────────────

export const BankTransactionSchema = z.object({
  id: z.string()
  tenantId: z.string()
  accountId: z.string()
  date: z.string()
  description: z.string()
  type: z.string()
  amount: z.number()
  matchStatus: z.string()
})

export type BankTransaction = z.infer<typeof BankTransactionSchema>

export const CreateBankTransactionSchema = BankTransactionSchema.omit({ id: true }).partial()
export type CreateBankTransactionDto = z.infer<typeof CreateBankTransactionSchema>

export const UpdateBankTransactionSchema = BankTransactionSchema.partial()
export type UpdateBankTransactionDto = z.infer<typeof UpdateBankTransactionSchema>

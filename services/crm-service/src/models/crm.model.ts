import { z } from "zod"

// ── CrmCustomer ─────────────────────────────────────────────────────────────

export const CrmCustomerSchema = z.object({
  id: z.string()
  tenantId: z.string()
  name: z.string()
  email: z.string()
  creditLimit: z.number()
  totalSpend: z.number()
  segment: z.string()
})

export type CrmCustomer = z.infer<typeof CrmCustomerSchema>

export const CreateCrmCustomerSchema = CrmCustomerSchema.omit({ id: true }).partial()
export type CreateCrmCustomerDto = z.infer<typeof CreateCrmCustomerSchema>

export const UpdateCrmCustomerSchema = CrmCustomerSchema.partial()
export type UpdateCrmCustomerDto = z.infer<typeof UpdateCrmCustomerSchema>

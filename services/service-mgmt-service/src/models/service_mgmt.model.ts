import { z } from "zod"

// ── ServiceTicket ─────────────────────────────────────────────────────────────

export const ServiceTicketSchema = z.object({
  id: z.string()
  tenantId: z.string()
  number: z.string()
  subject: z.string()
  priority: z.string()
  status: z.string()
})

export type ServiceTicket = z.infer<typeof ServiceTicketSchema>

export const CreateServiceTicketSchema = ServiceTicketSchema.omit({ id: true }).partial()
export type CreateServiceTicketDto = z.infer<typeof CreateServiceTicketSchema>

export const UpdateServiceTicketSchema = ServiceTicketSchema.partial()
export type UpdateServiceTicketDto = z.infer<typeof UpdateServiceTicketSchema>

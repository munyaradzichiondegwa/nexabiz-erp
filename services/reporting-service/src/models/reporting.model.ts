import { z } from "zod"

// ── DashboardKPI ─────────────────────────────────────────────────────────────

export const DashboardKPISchema = z.object({
  salesToday: z.number()
  salesDelta: z.number()
  cashBalance: z.number()
  netProfit: z.number()
  stockValue: z.number()
})

export type DashboardKPI = z.infer<typeof DashboardKPISchema>

export const CreateDashboardKPISchema = DashboardKPISchema.omit({ id: true }).partial()
export type CreateDashboardKPIDto = z.infer<typeof CreateDashboardKPISchema>

export const UpdateDashboardKPISchema = DashboardKPISchema.partial()
export type UpdateDashboardKPIDto = z.infer<typeof UpdateDashboardKPISchema>

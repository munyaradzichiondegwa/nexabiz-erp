import { z } from "zod"

// ── Project ─────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string()
  tenantId: z.string()
  name: z.string()
  budget: z.number()
  spent: z.number()
  status: z.string()
  billingType: z.string()
})

export type Project = z.infer<typeof ProjectSchema>

export const CreateProjectSchema = ProjectSchema.omit({ id: true }).partial()
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = ProjectSchema.partial()
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>

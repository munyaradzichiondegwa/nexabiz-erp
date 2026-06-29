import { z } from "zod"

// ── GlPostingRequest ─────────────────────────────────────────────────────────────

export const GlPostingRequestSchema = z.object({
  tenantId: z.string()
  correlationId: z.string()
  source: z.string()
  date: z.string()
  description: z.string()
  lines: z.any()
})

export type GlPostingRequest = z.infer<typeof GlPostingRequestSchema>

export const CreateGlPostingRequestSchema = GlPostingRequestSchema.omit({ id: true }).partial()
export type CreateGlPostingRequestDto = z.infer<typeof CreateGlPostingRequestSchema>

export const UpdateGlPostingRequestSchema = GlPostingRequestSchema.partial()
export type UpdateGlPostingRequestDto = z.infer<typeof UpdateGlPostingRequestSchema>

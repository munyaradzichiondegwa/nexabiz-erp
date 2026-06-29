import { z } from "zod"

// ── AuthUser ─────────────────────────────────────────────────────────────

export const AuthUserSchema = z.object({
  id: z.string()
  tenantId: z.string()
  email: z.string()
  passwordHash: z.string()
  mfaEnabled: z.boolean()
  isActive: z.boolean()
})

export type AuthUser = z.infer<typeof AuthUserSchema>

export const CreateAuthUserSchema = AuthUserSchema.omit({ id: true }).partial()
export type CreateAuthUserDto = z.infer<typeof CreateAuthUserSchema>

export const UpdateAuthUserSchema = AuthUserSchema.partial()
export type UpdateAuthUserDto = z.infer<typeof UpdateAuthUserSchema>

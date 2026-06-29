import { z } from "zod"

// ── UserRecord ─────────────────────────────────────────────────────────────

export const UserRecordSchema = z.object({
  id: z.string()
  tenantId: z.string()
  email: z.string()
  firstName: z.string()
  lastName: z.string()
  isActive: z.boolean()
})

export type UserRecord = z.infer<typeof UserRecordSchema>

export const CreateUserRecordSchema = UserRecordSchema.omit({ id: true }).partial()
export type CreateUserRecordDto = z.infer<typeof CreateUserRecordSchema>

export const UpdateUserRecordSchema = UserRecordSchema.partial()
export type UpdateUserRecordDto = z.infer<typeof UpdateUserRecordSchema>

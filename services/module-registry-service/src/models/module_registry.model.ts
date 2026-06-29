import { z } from "zod"

// ── ModuleRecord ─────────────────────────────────────────────────────────────

export const ModuleRecordSchema = z.object({
  code: z.string()
  tenantId: z.string()
  isActive: z.boolean()
  activatedAt: z.string().nullable()
})

export type ModuleRecord = z.infer<typeof ModuleRecordSchema>

export const CreateModuleRecordSchema = ModuleRecordSchema.omit({ id: true }).partial()
export type CreateModuleRecordDto = z.infer<typeof CreateModuleRecordSchema>

export const UpdateModuleRecordSchema = ModuleRecordSchema.partial()
export type UpdateModuleRecordDto = z.infer<typeof UpdateModuleRecordSchema>

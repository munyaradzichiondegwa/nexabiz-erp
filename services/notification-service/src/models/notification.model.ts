import { z } from "zod"

// ── NotificationLog ─────────────────────────────────────────────────────────────

export const NotificationLogSchema = z.object({
  id: z.string()
  tenantId: z.string()
  channel: z.string()
  recipient: z.string()
  status: z.string()
})

export type NotificationLog = z.infer<typeof NotificationLogSchema>

export const CreateNotificationLogSchema = NotificationLogSchema.omit({ id: true }).partial()
export type CreateNotificationLogDto = z.infer<typeof CreateNotificationLogSchema>

export const UpdateNotificationLogSchema = NotificationLogSchema.partial()
export type UpdateNotificationLogDto = z.infer<typeof UpdateNotificationLogSchema>

import { z } from "zod"

// ── WorkflowInstance ─────────────────────────────────────────────────────────────

export const WorkflowInstanceSchema = z.object({
  id: z.string()
  tenantId: z.string()
  workflowId: z.string()
  entityType: z.string()
  status: z.string()
})

export type WorkflowInstance = z.infer<typeof WorkflowInstanceSchema>

export const CreateWorkflowInstanceSchema = WorkflowInstanceSchema.omit({ id: true }).partial()
export type CreateWorkflowInstanceDto = z.infer<typeof CreateWorkflowInstanceSchema>

export const UpdateWorkflowInstanceSchema = WorkflowInstanceSchema.partial()
export type UpdateWorkflowInstanceDto = z.infer<typeof UpdateWorkflowInstanceSchema>

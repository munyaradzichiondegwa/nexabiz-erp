import { apiClient } from "@/lib/api-client"

export interface WorkflowInstance {
  id: string; tenantId: string; workflowId: string
  entityType: string; entityId: string; entityData?: any
  currentStep: number; status: "pending" | "approved" | "rejected" | "cancelled"
  submittedBy: string; createdAt: string; workflowName?: string
}

export const workflowsApi = {
  getDefinitions: () => apiClient.get("/workflows").then(r => r.data),
  getPending:     () => apiClient.get<WorkflowInstance[]>("/workflows/pending").then(r => r.data),
  approve:        (instanceId: string, comment?: string) =>
    apiClient.post(`/workflows/${instanceId}/approve`, { comment }).then(r => r.data),
  reject:         (instanceId: string, reason: string) =>
    apiClient.post(`/workflows/${instanceId}/reject`, { reason }).then(r => r.data),
}

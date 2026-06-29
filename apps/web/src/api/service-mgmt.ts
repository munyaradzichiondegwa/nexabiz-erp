import { apiClient } from "@/lib/api-client"

export interface ServiceTicket {
  id: string; number: string; subject: string; description?: string
  customerId?: string; assetId?: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved" | "closed"
  assignedTo?: string; createdAt: string
}

export const serviceMgmtApi = {
  list:         (status?: string) =>
    apiClient.get<ServiceTicket[]>("/service/tickets", { params: { status } }).then(r => r.data),
  create:       (data: Partial<ServiceTicket>) =>
    apiClient.post<ServiceTicket>("/service/tickets", data).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    apiClient.patch<ServiceTicket>(`/service/tickets/${id}/status`, { status }).then(r => r.data),
}

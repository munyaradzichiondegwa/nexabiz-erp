import { apiClient } from "@/lib/api-client"

export interface BOM {
  id: string; name: string; product: string; components: number; isActive: boolean
}
export interface WorkOrder {
  id: string; number: string; bomId: string; qty: number
  status: "Planned" | "In Progress" | "Completed" | "Cancelled"
  scheduledStart?: string; scheduledEnd?: string
}

export const manufacturingApi = {
  getBOMs:       () => apiClient.get<BOM[]>("/manufacturing/bom").then(r => r.data),
  getWorkOrders: (status?: string) =>
    apiClient.get<WorkOrder[]>("/manufacturing/work-orders", { params: { status } }).then(r => r.data),
  createWO:      (data: { bomId: string; qty: number; scheduledStart?: string; scheduledEnd?: string }) =>
    apiClient.post<WorkOrder>("/manufacturing/work-orders", data).then(r => r.data),
  completeWO:    (id: string) =>
    apiClient.post(`/manufacturing/work-orders/${id}/complete`).then(r => r.data),
}

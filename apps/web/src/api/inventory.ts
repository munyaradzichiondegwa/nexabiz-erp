import { apiClient } from "@/lib/api-client"

export interface InventoryItem {
  id: string; sku: string; name: string; category: string
  qty: number; cost: number; reorderLevel: number
  costingMethod: "FIFO" | "WAC" | "Standard"
  warehouseId?: string; updatedAt: string
}
export interface StockMovement { type: "IN" | "OUT" | "ADJUST"; qty: number; reason: string; reference?: string }

export const inventoryApi = {
  list:    (params?: { search?: string; status?: string; page?: number }) =>
             apiClient.get<{ items: InventoryItem[]; total: number }>("/inventory", { params }).then(r => r.data),
  create:  (data: Partial<InventoryItem>) => apiClient.post<InventoryItem>("/inventory", data).then(r => r.data),
  update:  (id: string, data: Partial<InventoryItem>) => apiClient.put<InventoryItem>(`/inventory/${id}`, data).then(r => r.data),
  delete:  (id: string) => apiClient.delete(`/inventory/${id}`).then(r => r.data),
  restock: (id: string, movement: StockMovement) => apiClient.post(`/inventory/${id}/movement`, movement).then(r => r.data),
  export:  () => apiClient.get("/inventory/export", { responseType: "blob" }).then(r => r.data),
}

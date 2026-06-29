import { apiClient } from "@/lib/api-client"

export interface SalesOrder {
  id: string; number: string; type: "quote" | "sales_order"
  customerName: string; total: number
  status: "Draft" | "Confirmed" | "Invoiced" | "Delivered" | "Cancelled"
  date?: string; validUntil?: string
}

export const salesOrdersApi = {
  list:    (status?: string) =>
    apiClient.get<SalesOrder[]>("/sales-orders", { params: { status } }).then(r => r.data),
  create:  (data: Partial<SalesOrder> & { lines: any[] }) =>
    apiClient.post<SalesOrder>("/sales-orders", data).then(r => r.data),
  confirm: (id: string) => apiClient.post(`/sales-orders/${id}/confirm`).then(r => r.data),
  invoice: (id: string) => apiClient.post(`/sales-orders/${id}/invoice`).then(r => r.data),
}

import { apiClient } from "@/lib/api-client"

export interface PurchaseOrder {
  id: string; number: string; supplier: string; total: number
  status: "Draft" | "Sent" | "Received" | "Matched" | "Cancelled"; date: string
}

export const procurementApi = {
  listPOs:   (params?: { status?: string; page?: number }) => apiClient.get<{ orders: PurchaseOrder[]; total: number }>("/procurement/orders", { params }).then(r => r.data),
  createPO:  (data: Partial<PurchaseOrder>) => apiClient.post<PurchaseOrder>("/procurement/orders", data).then(r => r.data),
  receiveGRN:(poId: string, items: unknown) => apiClient.post(`/procurement/orders/${poId}/grn`, { items }).then(r => r.data),
  matchInvoice:(poId: string, invoiceId: string) => apiClient.post(`/procurement/orders/${poId}/match`, { invoiceId }).then(r => r.data),
}

import { apiClient } from "@/lib/api-client"

export interface Customer {
  id: string; name: string; email: string; phone?: string
  totalSpend: number; lastOrderDate: string; segment: string; creditLimit: number
}

export const crmApi = {
  list:   (params?: { search?: string; segment?: string; page?: number }) => apiClient.get<{ customers: Customer[]; total: number }>("/crm/customers", { params }).then(r => r.data),
  create: (data: Partial<Customer>) => apiClient.post<Customer>("/crm/customers", data).then(r => r.data),
  get:    (id: string) => apiClient.get<Customer>(`/crm/customers/${id}`).then(r => r.data),
  update: (id: string, data: Partial<Customer>) => apiClient.put<Customer>(`/crm/customers/${id}`, data).then(r => r.data),
  getKPIs:() => apiClient.get("/crm/kpis").then(r => r.data),
}

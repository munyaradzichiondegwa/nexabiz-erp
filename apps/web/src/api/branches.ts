import { apiClient } from "@/lib/api-client"

export interface Branch {
  id: string; name: string; manager: string; address?: string
  status: "active" | "inactive"; sales?: number
}

export const branchesApi = {
  list:   () => apiClient.get<Branch[]>("/branches").then(r => r.data),
  create: (data: Partial<Branch>) => apiClient.post<Branch>("/branches", data).then(r => r.data),
  update: (id: string, data: Partial<Branch>) =>
    apiClient.put<Branch>(`/branches/${id}`, data).then(r => r.data),
}

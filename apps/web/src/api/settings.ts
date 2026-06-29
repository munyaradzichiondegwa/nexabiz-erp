import { apiClient } from "@/lib/api-client"

export interface CompanySettings {
  name: string; currency: string; taxNumber: string; fyEnd: string; address: string; logo?: string
}
export interface Integration { name: string; icon: string; desc: string; connected: boolean; configUrl?: string }

export const settingsApi = {
  getCompany:      () => apiClient.get<CompanySettings>("/settings/company").then(r => r.data),
  saveCompany:     (data: CompanySettings) => apiClient.put<CompanySettings>("/settings/company", data).then(r => r.data),
  getIntegrations: () => apiClient.get<Integration[]>("/settings/integrations").then(r => r.data),
  toggleIntegration:(name: string) => apiClient.post(`/settings/integrations/${name}/toggle`).then(r => r.data),
  getUsers:        () => apiClient.get("/users").then(r => r.data),
}

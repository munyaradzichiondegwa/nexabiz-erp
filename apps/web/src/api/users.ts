import { apiClient } from "@/lib/api-client"

export interface UserRecord {
  id: string; email: string; firstName: string; lastName: string
  roles: string[]; isActive: boolean; mfaEnabled: boolean; lastLoginAt?: string
}

export const usersApi = {
  list:   (params?: { search?: string; page?: number }) =>
    apiClient.get<{ users: UserRecord[]; total: number }>("/users", { params }).then(r => r.data),
  invite: (data: { firstName: string; lastName: string; email: string; roles: string[] }) =>
    apiClient.post<UserRecord>("/users", data).then(r => r.data),
  toggle: (id: string, isActive: boolean) =>
    apiClient.patch(`/users/${id}/status`, { isActive }).then(r => r.data),
  getRoles: () => apiClient.get("/users/roles").then(r => r.data),
}

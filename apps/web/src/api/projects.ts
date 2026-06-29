import { apiClient } from "@/lib/api-client"

export interface Project {
  id: string; name: string; description?: string; customerId?: string
  budget: number; spent: number; status: string; billingType: string
  startDate?: string; endDate?: string; managerId?: string
}
export interface TimeEntry {
  id: string; projectId: string; hours: number; description?: string; date: string; billable: boolean
}

export const projectsApi = {
  list:        () => apiClient.get<Project[]>("/projects").then(r => r.data),
  create:      (data: Partial<Project>) => apiClient.post<Project>("/projects", data).then(r => r.data),
  getTasks:    (projectId: string) => apiClient.get(`/projects/${projectId}/tasks`).then(r => r.data),
  logTime:     (projectId: string, entry: Partial<TimeEntry>) =>
    apiClient.post<TimeEntry>(`/projects/${projectId}/time`, entry).then(r => r.data),
}

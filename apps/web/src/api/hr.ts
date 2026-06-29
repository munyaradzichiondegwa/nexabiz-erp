import { apiClient } from "@/lib/api-client"

export interface Employee {
  id: string; firstName: string; lastName: string; role: string
  department: string; salary: number; status: "Active" | "On Leave" | "Inactive"
  startDate: string; email: string
}
export interface LeaveRequest { id: string; employeeId: string; type: string; from: string; to: string; status: "Pending" | "Approved" | "Rejected" }

export const hrApi = {
  listEmployees: (params?: { search?: string; dept?: string }) => apiClient.get<{ employees: Employee[]; total: number }>("/hr/employees", { params }).then(r => r.data),
  createEmployee:(data: Partial<Employee>) => apiClient.post<Employee>("/hr/employees", data).then(r => r.data),
  runPayroll:    (month: string, year: number) => apiClient.post("/hr/payroll/run", { month, year }).then(r => r.data),
  getPayslip:    (employeeId: string, payrollId: string) => apiClient.get(`/hr/employees/${employeeId}/payslip/${payrollId}`, { responseType: "blob" }).then(r => r.data),
  getLeaveRequests: () => apiClient.get<LeaveRequest[]>("/hr/leave").then(r => r.data),
  getHRKPIs:     () => apiClient.get("/hr/kpis").then(r => r.data),
}

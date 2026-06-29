export type EmployeeStatus = "active" | "on_leave" | "terminated" | "suspended"
export type PayFrequency = "weekly" | "fortnightly" | "monthly"

export interface Employee {
  id: string
  tenantId: string
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  department: string
  branchId?: string
  salary: number
  payFrequency: PayFrequency
  taxCode?: string
  bankAccount?: string
  startDate: string
  endDate?: string
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface PayrollRun {
  id: string
  tenantId: string
  period: string
  year: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  glRef?: string
  status: "draft" | "approved" | "paid"
  processedAt?: string
}

export interface PayrollRunCompletedEvent {
  eventType: "PAYROLL_RUN_COMPLETED"
  tenantId: string
  payrollRunId: string
  period: string
  year: number
  totalGross: number
  totalDeductions: number
  totalNet: number
  employeeCount: number
  timestamp: string
}

export type HREvent = PayrollRunCompletedEvent

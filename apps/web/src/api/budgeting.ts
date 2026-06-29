import { apiClient } from "@/lib/api-client"

export interface BudgetLine {
  id: string
  tenantId: string
  fiscalYear: number
  accountCode: string
  accountName: string
  jan: number; feb: number; mar: number; apr: number
  may: number; jun: number; jul: number; aug: number
  sep: number; oct: number; nov: number; dec: number
  total: number
}

export interface VarianceLine {
  accountCode: string
  accountName: string
  budgeted: number
  actual: number
  variance: number
}

export const budgetingApi = {
  list:         (year?: number) =>
    apiClient.get<BudgetLine[]>("/budgeting", { params: { year } }).then(r => r.data),
  save:         (payload: { fiscalYear: number; lines: Partial<BudgetLine>[] }) =>
    apiClient.post("/budgeting", payload).then(r => r.data),
  getVariance:  (year?: number) =>
    apiClient.get<VarianceLine[]>("/budgeting/variance", { params: { year } }).then(r => r.data),
}

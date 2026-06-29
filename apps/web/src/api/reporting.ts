import { apiClient } from "@/lib/api-client"

export interface FinancialReport { period: string; data: Record<string, number> }

export const reportingApi = {
  getBalanceSheet: (period: string) => apiClient.get<FinancialReport>("/reporting/balance-sheet", { params: { period } }).then(r => r.data),
  getPL:           (period: string) => apiClient.get<FinancialReport>("/reporting/profit-loss", { params: { period } }).then(r => r.data),
  getCashFlow:     (period: string) => apiClient.get<FinancialReport>("/reporting/cash-flow", { params: { period } }).then(r => r.data),
  exportPDF:       (reportType: string, period: string) => apiClient.get(`/reporting/${reportType}/export`, { params: { period }, responseType: "blob" }).then(r => r.data),
}

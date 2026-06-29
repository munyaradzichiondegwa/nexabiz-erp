import { apiClient } from "@/lib/api-client"

export interface KPIData {
  salesToday: number; salesDelta: number
  cashBalance: number
  netProfit: number; profitMargin: number
  stockValue: number; stockAlerts: number
}
export interface RevenuePoint { day: string; revenue: number; expenses: number }
export interface GLEntry { date: string; ref: string; account: string; desc: string; dr: number | null; cr: number | null }
export interface InventoryRow { sku: string; name: string; qty: number; reorder: number }

export const dashboardApi = {
  getKPIs:        () => apiClient.get<KPIData>("/dashboard/kpis").then(r => r.data),
  getRevenueTrend:() => apiClient.get<RevenuePoint[]>("/dashboard/revenue-trend").then(r => r.data),
  getRecentGL:    () => apiClient.get<GLEntry[]>("/dashboard/recent-gl").then(r => r.data),
  getInventoryStatus: () => apiClient.get<InventoryRow[]>("/dashboard/inventory-status").then(r => r.data),
}

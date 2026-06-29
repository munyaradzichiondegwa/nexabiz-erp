import { apiClient } from "@/lib/api-client"

export interface FixedAsset {
  id: string; name: string; category: string; serialNumber?: string
  purchaseDate: string; purchaseCost: number; usefulLifeYears: number
  depreciationMethod: "straight_line" | "declining_balance"
  currentValue: number; accumulatedDepreciation: number; status: string
}

export const assetsApi = {
  list:             () => apiClient.get<FixedAsset[]>("/assets").then(r => r.data),
  create:           (data: Partial<FixedAsset>) => apiClient.post<FixedAsset>("/assets", data).then(r => r.data),
  runDepreciation:  () => apiClient.post("/assets/run-depreciation").then(r => r.data),
}

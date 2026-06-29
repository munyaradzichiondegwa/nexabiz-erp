export type AssetStatus = "active" | "under_maintenance" | "disposed" | "fully_depreciated"

export interface FixedAsset {
  id: string
  tenantId: string
  name: string
  category: string
  serialNumber?: string
  purchaseDate: string
  purchaseCost: number
  usefulLifeYears: number
  depreciationMethod: "straight_line" | "declining_balance"
  currentValue: number
  accumulatedDepreciation: number
  locationId?: string
  status: AssetStatus
  createdAt: string
}

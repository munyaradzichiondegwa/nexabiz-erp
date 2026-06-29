export type CostingMethod = "FIFO" | "WAC" | "Standard"

export interface Product {
  id: string
  tenantId: string
  sku: string
  name: string
  description?: string
  category: string
  price: number
  cost: number
  qty: number
  reorderLevel: number
  costingMethod: CostingMethod
  warehouseId?: string
  taxRate?: number
  isActive: boolean
  icon?: string
  createdAt: string
  updatedAt: string
}

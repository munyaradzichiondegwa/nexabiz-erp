export interface StockInEvent {
  eventType: "STOCK_IN"
  tenantId: string
  productId: string
  qty: number
  cost: number
  reference: string
  warehouseId?: string
  timestamp: string
}

export interface StockOutEvent {
  eventType: "STOCK_OUT"
  tenantId: string
  productId: string
  qty: number
  orderId?: string
  reason: string
  timestamp: string
}

export interface LowStockAlertEvent {
  eventType: "LOW_STOCK_ALERT"
  tenantId: string
  productId: string
  productName: string
  currentQty: number
  reorderLevel: number
  timestamp: string
}

export type InventoryEvent = StockInEvent | StockOutEvent | LowStockAlertEvent

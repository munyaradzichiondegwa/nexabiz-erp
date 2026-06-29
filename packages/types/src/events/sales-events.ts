export interface SaleCompletedEvent {
  eventType: "SALE_COMPLETED"
  tenantId: string
  orderId: string
  cashierId: string
  branchId?: string
  total: number
  paymentMethod: string
  lines: Array<{ productId: string; qty: number; unitPrice: number; total: number }>
  timestamp: string
}

export interface SaleRefundedEvent {
  eventType: "SALE_REFUNDED"
  tenantId: string
  orderId: string
  originalOrderId: string
  refundAmount: number
  reason: string
  timestamp: string
}

export type SalesEvent = SaleCompletedEvent | SaleRefundedEvent

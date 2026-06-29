export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded"
export type PaymentMethod = "cash" | "card" | "mobile" | "bank_transfer" | "credit" | "split"
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded"

export interface OrderLine {
  productId: string
  productName: string
  qty: number
  unitPrice: number
  discount: number
  total: number
}

export interface Order {
  id: string
  tenantId: string
  orderNumber: string
  customerId?: string
  cashierId: string
  branchId?: string
  lines: OrderLine[]
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  glRef?: string
  receiptId?: string
  createdAt: string
}

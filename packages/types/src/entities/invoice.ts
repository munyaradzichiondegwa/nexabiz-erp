export type InvoiceType = "sales" | "purchase"
export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue" | "cancelled"

export interface InvoiceLine {
  description: string
  qty: number
  unitPrice: number
  taxRate: number
  total: number
  accountId: string
}

export interface Invoice {
  id: string
  tenantId: string
  type: InvoiceType
  number: string
  customerId?: string
  supplierId?: string
  lines: InvoiceLine[]
  subtotal: number
  taxAmount: number
  total: number
  amountPaid: number
  dueDate: string
  status: InvoiceStatus
  glRef?: string
  createdAt: string
  updatedAt: string
}

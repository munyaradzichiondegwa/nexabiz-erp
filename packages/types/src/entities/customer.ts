export type CustomerSegment = "Champion" | "Loyal" | "Potential" | "At Risk" | "Lost" | "New"

export interface Customer {
  id: string
  tenantId: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxNumber?: string
  creditLimit: number
  outstandingBalance: number
  totalSpend: number
  lastOrderDate?: string
  segment: CustomerSegment
  accountId?: string
  isActive: boolean
  createdAt: string
}

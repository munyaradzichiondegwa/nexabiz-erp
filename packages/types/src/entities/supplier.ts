export interface Supplier {
  id: string
  tenantId: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxNumber?: string
  paymentTerms: number
  accountId?: string
  isActive: boolean
  createdAt: string
}

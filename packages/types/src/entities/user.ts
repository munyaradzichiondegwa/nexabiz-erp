export type UserRole = "super_admin" | "admin" | "accountant" | "cashier" | "warehouse" | "hr_manager" | "viewer"

export interface User {
  id: string
  tenantId: string
  email: string
  firstName: string
  lastName: string
  roles: UserRole[]
  permissions: string[]
  isActive: boolean
  mfaEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  plan: "starter" | "professional" | "enterprise"
  activeModules: string[]
  currency: string
  locale: string
  timezone: string
}

export interface ModuleDefinition {
  code: string
  name: string
  description: string
  isCore: boolean
  version: string
  dependencies: string[]
}

export interface TenantModule {
  tenantId: string
  moduleCode: string
  isActive: boolean
  activatedAt?: string
  deactivatedAt?: string
}

export interface ModuleActivatedEvent {
  eventType: "MODULE_ACTIVATED"
  tenantId: string
  moduleCode: string
  activatedBy: string
  timestamp: string
}

export interface ModuleDeactivatedEvent {
  eventType: "MODULE_DEACTIVATED"
  tenantId: string
  moduleCode: string
  deactivatedBy: string
  timestamp: string
}

export type ModuleEvent = ModuleActivatedEvent | ModuleDeactivatedEvent

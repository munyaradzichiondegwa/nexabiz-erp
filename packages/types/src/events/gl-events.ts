export interface GLPostingRequestedEvent {
  eventType: "GL_POSTING_REQUESTED"
  tenantId: string
  correlationId: string
  source: string
  sourceId: string
  date: string
  description: string
  lines: Array<{ accountId: string; debit: number; credit: number; entityId?: string }>
  timestamp: string
}

export interface GLPostedEvent {
  eventType: "GL_POSTED"
  tenantId: string
  correlationId: string
  journalEntryId: string
  ref: string
  timestamp: string
}

export interface GLPostingFailedEvent {
  eventType: "GL_POSTING_FAILED"
  tenantId: string
  correlationId: string
  reason: string
  timestamp: string
}

export type GLEvent = GLPostingRequestedEvent | GLPostedEvent | GLPostingFailedEvent

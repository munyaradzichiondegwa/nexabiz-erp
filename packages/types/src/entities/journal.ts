export type JournalEntryStatus = "draft" | "posted" | "reversed"

export interface JournalLine {
  accountId: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description?: string
  entityId?: string
  entityType?: string
}

export interface JournalEntry {
  id: string
  tenantId: string
  ref: string
  date: string
  description: string
  lines: JournalLine[]
  totalDebit: number
  totalCredit: number
  status: JournalEntryStatus
  source: string
  sourceId?: string
  postedAt?: string
  postedBy?: string
  createdAt: string
}

export interface Account {
  id: string
  tenantId: string
  code: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
  subtype: string
  isControl: boolean
  parentId?: string
  balance: number
  currency: string
}

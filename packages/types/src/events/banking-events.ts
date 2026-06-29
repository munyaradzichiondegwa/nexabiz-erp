export interface BankTransactionImportedEvent {
  eventType: "BANK_TRANSACTION_IMPORTED"
  tenantId: string
  accountId: string
  transactionId: string
  amount: number
  type: "credit" | "debit"
  description: string
  date: string
  timestamp: string
}

export interface ReconciliationCompleteEvent {
  eventType: "RECONCILIATION_COMPLETE"
  tenantId: string
  accountId: string
  period: string
  matchedCount: number
  unmatchedCount: number
  timestamp: string
}

export type BankingEvent = BankTransactionImportedEvent | ReconciliationCompleteEvent

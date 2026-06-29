/**
 * GL Posting Rules Registry — PRD Section 17
 * Maps domain events to double-entry journal posting templates.
 * Every rule MUST produce balanced entries (DR = CR).
 */

export interface PostingLine {
  accountCode: string
  side: "debit" | "credit"
  /** amount as fraction of total, or "total" for exact amount */
  amount: "total" | number
  description?: string
}

export interface PostingRule {
  source: string
  eventType: string
  description: (event: any) => string
  ref: (event: any) => string
  lines: PostingLine[]
}

export const POSTING_RULES: PostingRule[] = [
  // ── POS Sale ──────────────────────────────────────────────────────────────
  {
    source: "pos-service",
    eventType: "SALE_COMPLETED",
    description: (e) => `POS Sale ${e.orderId}`,
    ref: (e) => `POS-${e.orderId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "1000", side: "debit",  amount: "total", description: "Cash received" },
      { accountCode: "4000", side: "credit", amount: "total", description: "Sales Revenue" },
    ],
  },

  // ── Payroll ───────────────────────────────────────────────────────────────
  {
    source: "hr-service",
    eventType: "PAYROLL_RUN_COMPLETED",
    description: (e) => `Payroll ${e.period} ${e.year}`,
    ref: (e) => `PAY-${e.payrollRunId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "6000", side: "debit",  amount: "total", description: "Salaries & Wages (Gross)" },
      { accountCode: "2300", side: "credit", amount: 0.25,    description: "PAYE & Deductions Payable" },
      { accountCode: "2000", side: "credit", amount: 0.75,    description: "Net Pay Payable" },
    ],
  },

  // ── AP Bill Payment ───────────────────────────────────────────────────────
  {
    source: "ap-service",
    eventType: "BILL_PAID",
    description: (e) => `AP Payment: ${e.billNumber}`,
    ref: (e) => `APY-${e.billId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "2000", side: "debit",  amount: "total", description: "Accounts Payable cleared" },
      { accountCode: "1010", side: "credit", amount: "total", description: "Bank payment" },
    ],
  },

  // ── GRN (Goods Received Note) ─────────────────────────────────────────────
  {
    source: "procurement-service",
    eventType: "GRN_RECEIVED",
    description: (e) => `GRN: ${e.poNumber}`,
    ref: (e) => `GRN-${e.grnId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "1300", side: "debit",  amount: "total", description: "Inventory received" },
      { accountCode: "2000", side: "credit", amount: "total", description: "Accounts Payable" },
    ],
  },

  // ── Asset Depreciation ────────────────────────────────────────────────────
  {
    source: "asset-service",
    eventType: "DEPRECIATION_RUN",
    description: (e) => `Monthly Depreciation ${e.period}`,
    ref: (e) => `DEP-${e.period?.replace("/", "-") ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "6400", side: "debit",  amount: "total", description: "Depreciation Expense" },
      { accountCode: "1510", side: "credit", amount: "total", description: "Accumulated Depreciation" },
    ],
  },

  // ── Customer Invoice ──────────────────────────────────────────────────────
  {
    source: "ar-service",
    eventType: "INVOICE_CREATED",
    description: (e) => `Invoice ${e.invoiceNumber} — ${e.customerName}`,
    ref: (e) => `INV-${e.invoiceId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "1100", side: "debit",  amount: "total", description: "Accounts Receivable" },
      { accountCode: "4000", side: "credit", amount: "total", description: "Sales Revenue" },
    ],
  },

  // ── Project Time Billing ──────────────────────────────────────────────────
  {
    source: "project-service",
    eventType: "TIME_BILLED",
    description: (e) => `Project Billing: ${e.projectName}`,
    ref: (e) => `PRJ-${e.projectId?.slice(-8)?.toUpperCase() ?? Date.now().toString(36)}`,
    lines: [
      { accountCode: "1100", side: "debit",  amount: "total", description: "Project AR" },
      { accountCode: "4100", side: "credit", amount: "total", description: "Service Revenue" },
    ],
  },
]

export function findRule(source: string, eventType: string): PostingRule | undefined {
  return POSTING_RULES.find(r => r.source === source && r.eventType === eventType)
}

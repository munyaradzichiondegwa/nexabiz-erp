import { apiClient } from "@/lib/api-client"

export interface GLEntry { id: string; date: string; ref: string; account: string; description: string; debit: number; credit: number; balance: number }
export interface JournalEntry { ref?: string; date: string; description: string; lines: { accountId: string; debit: number; credit: number }[] }
export interface ARInvoice { id: string; number: string; customer: string; amount: number; dueDate: string; status: "Current" | "Due Soon" | "Overdue" | "Paid" }
export interface APBill    { id: string; number: string; supplier: string; amount: number; dueDate: string; status: "Current" | "Due Soon" | "Overdue" | "Paid" }

export const accountingApi = {
  getGLEntries:  (params?: { page?: number; search?: string }) => apiClient.get<{ entries: GLEntry[]; total: number }>("/accounting/gl", { params }).then(r => r.data),
  postJournal:   (entry: JournalEntry) => apiClient.post<GLEntry[]>("/accounting/journal", entry).then(r => r.data),
  getARInvoices: () => apiClient.get<ARInvoice[]>("/accounting/ar/invoices").then(r => r.data),
  getAPBills:    () => apiClient.get<APBill[]>("/accounting/ap/bills").then(r => r.data),
  getChartOfAccounts: () => apiClient.get("/accounting/coa").then(r => r.data),
  payBill:       (billId: string) => apiClient.post(`/accounting/ap/bills/${billId}/pay`).then(r => r.data),
  sendReminder:  (invoiceId: string) => apiClient.post(`/accounting/ar/invoices/${invoiceId}/remind`).then(r => r.data),
}

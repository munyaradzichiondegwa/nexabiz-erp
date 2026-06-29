import { apiClient } from "@/lib/api-client"

export interface BankAccount { id: string; name: string; bank: string; balance: number; currency: string; status: "Reconciled" | "Pending" }
export interface BankTransaction { id: string; date: string; description: string; type: "Credit" | "Debit"; amount: number; balance: number; status: "Matched" | "Unmatched" }

export const bankingApi = {
  getAccounts: () => apiClient.get<BankAccount[]>("/banking/accounts").then(r => r.data),
  createAccount:(data: Partial<BankAccount>) => apiClient.post<BankAccount>("/banking/accounts", data).then(r => r.data),
  getTransactions:(accountId?: string) => apiClient.get<BankTransaction[]>("/banking/transactions", { params: { accountId } }).then(r => r.data),
  reconcile:   (accountId: string) => apiClient.post(`/banking/accounts/${accountId}/reconcile`).then(r => r.data),
  importStatement:(accountId: string, file: File, format: string) => {
    const fd = new FormData(); fd.append("file", file); fd.append("format", format)
    return apiClient.post(`/banking/accounts/${accountId}/import`, fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data)
  },
}

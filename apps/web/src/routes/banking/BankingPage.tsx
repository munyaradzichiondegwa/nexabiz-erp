import React, { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { bankingApi, type BankAccount, type BankTransaction } from "@/api/banking"
import { PageHeader } from "@/components/ui/PageHeader"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"
import { RefreshCw, Upload } from "lucide-react"

const MOCK_ACCOUNTS: BankAccount[] = [
  { id: "1", name: "Main Operating", bank: "FBC Bank",  balance: 18340, currency: "USD", status: "Reconciled" },
  { id: "2", name: "Petty Cash",     bank: "Cash",      balance: 1660,  currency: "USD", status: "Reconciled" },
  { id: "3", name: "USD Reserve",    bank: "Stanbic",   balance: 12000, currency: "USD", status: "Pending" },
]

const MOCK_TXN: BankTransaction[] = [
  { id: "1", date: "24/03", description: "POS Sale Batch",   type: "Credit", amount: 1240,  balance: 18340, status: "Matched" },
  { id: "2", date: "23/03", description: "Supplier Payment", type: "Debit",  amount: -850,  balance: 17100, status: "Matched" },
  { id: "3", date: "22/03", description: "Payroll Run",      type: "Debit",  amount: -4800, balance: 17950, status: "Matched" },
  { id: "4", date: "21/03", description: "Customer Receipt", type: "Credit", amount: 3200,  balance: 22750, status: "Unmatched" },
]

export default function BankingPage() {
  const qc = useQueryClient()
  const [addAccountModal, setAddAccountModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>()
  const [form, setForm] = useState({ name: "", bank: "", balance: "", currency: "USD" })
  const [importFormat, setImportFormat] = useState("CSV")
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: accounts = MOCK_ACCOUNTS } = useQuery({ queryKey: ["bank-accounts"], queryFn: bankingApi.getAccounts, placeholderData: MOCK_ACCOUNTS })
  const { data: transactions = MOCK_TXN } = useQuery({ queryKey: ["bank-transactions", selectedAccount], queryFn: () => bankingApi.getTransactions(selectedAccount), placeholderData: MOCK_TXN })

  const reconcileMutation = useMutation({
    mutationFn: (id: string) => bankingApi.reconcile(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bank-accounts"] }); showToast("Account reconciled", "success") },
    onError: () => showToast("Reconciliation failed", "error"),
  })

  const createAccountMutation = useMutation({
    mutationFn: (data: Partial<BankAccount>) => bankingApi.createAccount(data),
    onSuccess: (acc) => { qc.invalidateQueries({ queryKey: ["bank-accounts"] }); showToast(`🏦 ${acc.name} added`, "success"); setAddAccountModal(false) },
    onError: () => showToast("Failed to add account", "error"),
  })

  const importMutation = useMutation({
    mutationFn: ({ accountId, file, format }: { accountId: string; file: File; format: string }) => bankingApi.importStatement(accountId, file, format),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bank-transactions"] }); showToast("Statement imported — transactions matched automatically", "success"); setImportModal(false) },
    onError: () => showToast("Import failed", "error"),
  })

  return (
    <div>
      <PageHeader
        title="Banking & Cash"
        subtitle="MOD-05 · Multi-currency · Auto-reconciliation"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setImportModal(true)}><Upload size={14} /> Import Statement</button>
            <button className="btn btn-primary" onClick={() => setAddAccountModal(true)}>＋ Add Account</button>
          </>
        }
      />

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {accounts.map(acc => (
          <div key={acc.id} className="card cursor-pointer hover:border-teal transition-colors" onClick={() => setSelectedAccount(acc.id)}>
            <div className="text-3xl mb-2">🏦</div>
            <div className="font-bold text-base mb-0.5 text-navy">{acc.name}</div>
            <div className="text-xs text-muted-foreground mb-3">{acc.bank} · {acc.currency}</div>
            <div className="text-2xl font-bold text-teal mb-3">{formatCurrency(acc.balance)}</div>
            <div className="mb-3"><Badge variant={acc.status === "Reconciled" ? "ok" : "warn"}>{acc.status}</Badge></div>
            <button
              className={`btn btn-sm ${acc.status === "Reconciled" ? "btn-ghost" : "btn-primary"}`}
              onClick={e => { e.stopPropagation(); reconcileMutation.mutate(acc.id) }}
              disabled={reconcileMutation.isPending}
            >
              {acc.status === "Reconciled" ? "✓ Reconciled" : "Reconcile Now"}
            </button>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="!mb-0">Transaction History</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => { qc.invalidateQueries({ queryKey: ["bank-transactions"] }); showToast("Syncing…", "info") }}>
            <RefreshCw size={12} /> Sync Now
          </button>
        </div>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <td><Badge variant={t.type === "Credit" ? "ok" : "bad"}>{t.type}</Badge></td>
                <td className={`font-semibold ${t.type === "Credit" ? "text-green-700" : "text-red-700"}`}>
                  {t.type === "Credit" ? "+" : ""}{formatCurrency(Math.abs(t.amount))}
                </td>
                <td>{formatCurrency(t.balance)}</td>
                <td><Badge variant={t.status === "Matched" ? "ok" : "warn"}>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Account Modal */}
      <Modal
        open={addAccountModal} onClose={() => setAddAccountModal(false)} title="🏦 Add Bank Account"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddAccountModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={createAccountMutation.isPending}
              onClick={() => createAccountMutation.mutate({ name: form.name, bank: form.bank, balance: parseFloat(form.balance) || 0, currency: form.currency, status: "Pending" })}>
              {createAccountMutation.isPending ? "Adding…" : "Add Account"}
            </button>
          </>
        }
      >
        <FormGroup label="Account Name" required><input placeholder="e.g. Main Operating" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormGroup>
        <FormRow>
          <FormGroup label="Bank"><input placeholder="e.g. FBC Bank" value={form.bank} onChange={e => setForm(f => ({ ...f, bank: e.target.value }))} /></FormGroup>
          <FormGroup label="Currency">
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option>USD</option><option>ZWL</option><option>EUR</option><option>GBP</option>
            </select>
          </FormGroup>
        </FormRow>
        <FormGroup label="Opening Balance ($)"><input type="number" placeholder="0.00" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} /></FormGroup>
      </Modal>

      {/* Import Statement Modal */}
      <Modal
        open={importModal} onClose={() => setImportModal(false)} title="⬆ Import Bank Statement"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setImportModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={importMutation.isPending || !importFile}
              onClick={() => importFile && selectedAccount && importMutation.mutate({ accountId: selectedAccount, file: importFile, format: importFormat })}>
              {importMutation.isPending ? "Importing…" : "Import & Reconcile →"}
            </button>
          </>
        }
      >
        <FormGroup label="Account">
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Format">
          <select value={importFormat} onChange={e => setImportFormat(e.target.value)}>
            <option>CSV</option><option>OFX</option><option>MT940</option>
          </select>
        </FormGroup>
        <input ref={fileRef} type="file" accept=".csv,.ofx,.sta" className="hidden" onChange={e => setImportFile(e.target.files?.[0] ?? null)} />
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm cursor-pointer hover:border-teal transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {importFile ? <><div className="text-2xl mb-2">✅</div>{importFile.name}</> : <>
            <div className="text-2xl mb-2">📂</div>
            Click to select file or drag & drop<br />
            <span className="text-xs">Supported: CSV, OFX, MT940</span>
          </>}
        </div>
      </Modal>
    </div>
  )
}

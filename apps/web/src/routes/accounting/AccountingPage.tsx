import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { accountingApi, type JournalEntry } from "@/api/accounting"
import { PageHeader } from "@/components/ui/PageHeader"
import { Tabs } from "@/components/ui/Tabs"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

const MOCK_GL = [
  { id: "1", date: "24/03", ref: "INV01", account: "Sales Revenue",  description: "POS Sale",    debit: 0,    credit: 100, balance: 100 },
  { id: "2", date: "24/03", ref: "INV01", account: "Cash / AR",      description: "POS Sale",    debit: 100,  credit: 0,   balance: 200 },
  { id: "3", date: "24/03", ref: "PAY01", account: "Payroll Expense",description: "March payroll",debit: 4800, credit: 0,   balance: 5000 },
  { id: "4", date: "23/03", ref: "EXP01", account: "OpEx",           description: "Office supplies",debit: 250, credit: 0, balance: 250 },
]

const MOCK_AR = [
  { id: "1", number: "INV-001", customer: "Acme Corp",  amount: 2400, dueDate: "30/03/2025", status: "Due Soon" },
  { id: "2", number: "INV-002", customer: "Bright Ltd", amount: 800,  dueDate: "15/04/2025", status: "Current" },
]

const MOCK_AP = [
  { id: "1", number: "BILL-001", supplier: "Zim Supplies",  amount: 3200, dueDate: "28/03/2025", status: "Overdue" },
  { id: "2", number: "BILL-002", supplier: "Tech Parts Ltd",amount: 1100, dueDate: "10/04/2025", status: "Current" },
]

const arVariant = (s: string) => s === "Overdue" ? "bad" : s === "Due Soon" ? "warn" : "ok"

export default function AccountingPage() {
  const qc = useQueryClient()
  const [jeModal, setJeModal] = useState(false)
  const [jeForm, setJeForm] = useState({ ref: "", date: new Date().toISOString().split("T")[0], description: "", dr1: "", cr2: "", acc1: "4000", acc2: "1100" })

  const { data: glData } = useQuery({ queryKey: ["gl-entries"], queryFn: () => accountingApi.getGLEntries(), placeholderData: { entries: MOCK_GL, total: MOCK_GL.length } })
  const { data: arData } = useQuery({ queryKey: ["ar-invoices"], queryFn: accountingApi.getARInvoices, placeholderData: MOCK_AR })
  const { data: apData } = useQuery({ queryKey: ["ap-bills"],    queryFn: accountingApi.getAPBills,    placeholderData: MOCK_AP })

  const postJEMutation = useMutation({
    mutationFn: (entry: JournalEntry) => accountingApi.postJournal(entry),
    onSuccess: (_, entry) => {
      qc.invalidateQueries({ queryKey: ["gl-entries"] })
      qc.invalidateQueries({ queryKey: ["dashboard-kpis"] })
      showToast(`📒 ${entry.ref || "JE"} posted successfully`, "success")
      setJeModal(false)
    },
    onError: () => showToast("Journal entry failed", "error"),
  })

  const handlePostJE = () => {
    const dr = parseFloat(jeForm.dr1) || 0
    const cr = parseFloat(jeForm.cr2) || 0
    if (Math.abs(dr - cr) > 0.01) { showToast("Journal entry must balance (DR = CR)", "error"); return }
    postJEMutation.mutate({ ref: jeForm.ref || `JE-${Date.now()}`, date: jeForm.date, description: jeForm.description, lines: [{ accountId: jeForm.acc1, debit: dr, credit: 0 }, { accountId: jeForm.acc2, debit: 0, credit: cr }] })
  }

  const GL = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>Date</th><th>Ref</th><th>Account</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
        <tbody>
          {(glData?.entries ?? MOCK_GL).map(e => (
            <tr key={e.id}>
              <td>{e.date}</td><td><strong>{e.ref}</strong></td><td>{e.account}</td><td>{e.description}</td>
              <td>{e.debit ? formatCurrency(e.debit) : "—"}</td>
              <td>{e.credit ? formatCurrency(e.credit) : "—"}</td>
              <td className="text-muted-foreground">{e.balance ? formatCurrency(e.balance) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const AR = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(arData ?? MOCK_AR).map(inv => (
            <tr key={inv.id}>
              <td>{inv.number}</td><td>{inv.customer}</td><td>{formatCurrency(inv.amount)}</td>
              <td>{inv.dueDate}</td>
              <td><Badge variant={arVariant(inv.status)}>{inv.status}</Badge></td>
              <td><button className="btn btn-sm btn-ghost" onClick={() => accountingApi.sendReminder(inv.id).then(() => showToast(`Reminder sent to ${inv.customer}`, "success"))}>Send Reminder</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const AP = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>Bill</th><th>Supplier</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {(apData ?? MOCK_AP).map(bill => (
            <tr key={bill.id}>
              <td>{bill.number}</td><td>{bill.supplier}</td><td>{formatCurrency(bill.amount)}</td>
              <td>{bill.dueDate}</td>
              <td><Badge variant={arVariant(bill.status)}>{bill.status}</Badge></td>
              <td>
                <button className="btn btn-sm btn-primary" onClick={() => accountingApi.payBill(bill.id).then(() => showToast(`Payment scheduled for ${bill.supplier}`, "success"))}>
                  Pay Now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Accounting"
        subtitle="MOD-06 · Double-entry GL · GAAP / IFRS compliant"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => showToast("Exporting GL…", "success")}>⬇ Export</button>
            <button className="btn btn-primary" onClick={() => setJeModal(true)}>＋ Journal Entry</button>
          </>
        }
      />
      <Tabs tabs={[{ key: "gl", label: "General Ledger", content: GL }, { key: "ar", label: "Accounts Receivable", content: AR }, { key: "ap", label: "Accounts Payable", content: AP }]} />

      <Modal
        wide open={jeModal} onClose={() => setJeModal(false)} title="📒 New Journal Entry"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setJeModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={postJEMutation.isPending} onClick={handlePostJE}>
              {postJEMutation.isPending ? "Posting…" : "Post Entry →"}
            </button>
          </>
        }
      >
        <FormRow>
          <FormGroup label="Reference"><input placeholder="JE-001" value={jeForm.ref} onChange={e => setJeForm(f => ({ ...f, ref: e.target.value }))} /></FormGroup>
          <FormGroup label="Date"><input type="date" value={jeForm.date} onChange={e => setJeForm(f => ({ ...f, date: e.target.value }))} /></FormGroup>
        </FormRow>
        <FormGroup label="Description"><input placeholder="Journal entry description…" value={jeForm.description} onChange={e => setJeForm(f => ({ ...f, description: e.target.value }))} /></FormGroup>
        <table style={{ marginTop: 10 }} className="data-table">
          <thead><tr><th>Account</th><th>Debit ($)</th><th>Credit ($)</th></tr></thead>
          <tbody>
            <tr>
              <td><select className="w-full border border-border rounded px-2 py-1 text-sm" value={jeForm.acc1} onChange={e => setJeForm(f => ({ ...f, acc1: e.target.value }))}>
                <option value="4000">4000 – Sales Revenue</option><option value="1100">1100 – AR</option>
                <option value="5000">5000 – COGS</option><option value="1300">1300 – Inventory</option>
              </select></td>
              <td><input type="number" placeholder="0.00" className="w-full border border-border rounded px-2 py-1 text-sm" value={jeForm.dr1} onChange={e => setJeForm(f => ({ ...f, dr1: e.target.value }))} /></td>
              <td><input type="number" placeholder="0.00" className="w-full border border-border rounded px-2 py-1 text-sm" disabled /></td>
            </tr>
            <tr>
              <td><select className="w-full border border-border rounded px-2 py-1 text-sm" value={jeForm.acc2} onChange={e => setJeForm(f => ({ ...f, acc2: e.target.value }))}>
                <option value="1100">1100 – AR</option><option value="4000">4000 – Sales Revenue</option>
                <option value="5000">5000 – COGS</option><option value="1300">1300 – Inventory</option>
              </select></td>
              <td><input type="number" placeholder="0.00" className="w-full border border-border rounded px-2 py-1 text-sm" disabled /></td>
              <td><input type="number" placeholder="0.00" className="w-full border border-border rounded px-2 py-1 text-sm" value={jeForm.cr2} onChange={e => setJeForm(f => ({ ...f, cr2: e.target.value }))} /></td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </div>
  )
}

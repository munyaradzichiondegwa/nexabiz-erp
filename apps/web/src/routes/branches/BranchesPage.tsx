import { branchesApi } from "@/api/branches"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { formatCurrency } from "@/utils/currency"

const MOCK = [
  { id:"1", name:"HQ – Harare CBD",     manager:"Alice Moyo",   sales:28400, status:"active" },
  { id:"2", name:"Bulawayo Branch",     manager:"Bob Chirwa",   sales:12600, status:"active" },
  { id:"3", name:"Mutare Branch",       manager:"Carol Dube",   sales:8100,  status:"active" },
  { id:"4", name:"Masvingo Outlet",     manager:"Dave Ncube",   sales:4200,  status:"inactive" },
]

export default function BranchesPage() {
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ name:"", manager:"", address:"" })

  return (
    <div>
      <PageHeader title="Multi-Branch Management" subtitle="MOD-12 · Consolidated reporting · Branch KPIs · Inter-branch transfers"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Branch</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Total Branches" value={String(MOCK.filter(b => b.status === "active").length)} sub="Active locations" color="bg-navy" />
        <KPICard label="Consolidated Sales" value={formatCurrency(MOCK.reduce((s,b) => s + b.sales, 0))} sub="All branches" color="bg-teal" />
        <KPICard label="Top Branch" value="HQ – Harare CBD" sub={`${formatCurrency(28400)} this month`} color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Branch</th><th>Manager</th><th>Sales (MTD)</th><th>% of Total</th><th>Status</th></tr></thead>
          <tbody>
            {MOCK.map(b => {
              const total = MOCK.reduce((s,x) => s + x.sales, 0)
              const pct = ((b.sales / total) * 100).toFixed(1)
              return (
                <tr key={b.id}>
                  <td><strong>{b.name}</strong></td>
                  <td>{b.manager}</td>
                  <td>{formatCurrency(b.sales)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress w-20"><div className="progress-bar" style={{ width:`${pct}%` }} /></div>
                      <span className="text-xs">{pct}%</span>
                    </div>
                  </td>
                  <td><Badge variant={b.status === "active" ? "ok" : "warn"} className="capitalize">{b.status}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Branch"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast(`Branch "${form.name}" created`, "success"); setAddModal(false) }}>Add Branch</button>
        </>}>
        <FormGroup label="Branch Name" required><input placeholder="e.g. Bulawayo Branch" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></FormGroup>
        <FormGroup label="Branch Manager"><input placeholder="Full name" value={form.manager} onChange={e => setForm(f => ({ ...f, manager:e.target.value }))} /></FormGroup>
        <FormGroup label="Address"><input placeholder="Physical address" value={form.address} onChange={e => setForm(f => ({ ...f, address:e.target.value }))} /></FormGroup>
      </Modal>
    </div>
  )
}

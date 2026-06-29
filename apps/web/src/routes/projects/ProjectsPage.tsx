import { projectsApi } from "@/api/projects"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

const MOCK = [
  { id:"1", name:"ERP Implementation", customer:"Acme Corp",  budget:15000, spent:8400, status:"active", billingType:"fixed", endDate:"30/06/2025" },
  { id:"2", name:"Website Redesign",   customer:"Bright Ltd", budget:5000,  spent:3200, status:"active", billingType:"time_material", endDate:"15/05/2025" },
  { id:"3", name:"Audit Support",      customer:"Delta Inc",  budget:3000,  spent:3000, status:"completed", billingType:"retainer", endDate:"31/03/2025" },
]
const statusVariant = (s: string) => s === "completed" ? "ok" : s === "active" ? "blue" : "warn"

export default function ProjectsPage() {
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ name:"", customer:"", budget:"", billingType:"fixed" })

  return (
    <div>
      <PageHeader title="Project Accounting" subtitle="MOD-18 · Project cost tracking · Time logging · Milestone billing"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ New Project</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Active Projects" value={String(MOCK.filter(p => p.status === "active").length)} sub="In progress" color="bg-navy" />
        <KPICard label="Total Budget" value={formatCurrency(MOCK.reduce((s,p) => s + p.budget, 0))} sub="Across all projects" color="bg-teal" />
        <KPICard label="Total Spent" value={formatCurrency(MOCK.reduce((s,p) => s + p.spent, 0))} sub="Cost to date" color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Project</th><th>Customer</th><th>Budget</th><th>Spent</th><th>Utilisation</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {MOCK.map(p => {
              const pct = Math.round((p.spent / p.budget) * 100)
              return (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><span className="text-xs text-muted-foreground capitalize">{p.billingType.replace("_"," ")}</span></td>
                  <td>{p.customer}</td>
                  <td>{formatCurrency(p.budget)}</td>
                  <td>{formatCurrency(p.spent)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress flex-1 w-20"><div className="progress-bar" style={{ width:`${Math.min(pct,100)}%`, background: pct > 90 ? "#E05252" : "#2DB89E" }} /></div>
                      <span className="text-xs font-semibold">{pct}%</span>
                    </div>
                  </td>
                  <td>{p.endDate}</td>
                  <td><Badge variant={statusVariant(p.status)} className="capitalize">{p.status}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Project"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast(`Project "${form.name}" created`, "success"); setAddModal(false) }}>Create</button>
        </>}>
        <FormGroup label="Project Name" required><input placeholder="e.g. ERP Implementation" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} /></FormGroup>
        <FormRow>
          <FormGroup label="Customer"><input placeholder="Client name" value={form.customer} onChange={e => setForm(f => ({ ...f, customer:e.target.value }))} /></FormGroup>
          <FormGroup label="Budget ($)"><input type="number" placeholder="15000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget:e.target.value }))} /></FormGroup>
        </FormRow>
        <FormGroup label="Billing Type">
          <select value={form.billingType} onChange={e => setForm(f => ({ ...f, billingType:e.target.value }))}>
            <option value="fixed">Fixed Price</option>
            <option value="time_material">Time & Material</option>
            <option value="retainer">Retainer</option>
          </select>
        </FormGroup>
      </Modal>
    </div>
  )
}

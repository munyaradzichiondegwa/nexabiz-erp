import { serviceMgmtApi } from "@/api/service-mgmt"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"

const MOCK = [
  { id:"1", number:"TKT-001", subject:"POS terminal not printing receipts", customer:"Acme Corp",  priority:"high",     status:"in_progress", assigned:"Tech Team" },
  { id:"2", number:"TKT-002", subject:"Slow Wi-Fi in warehouse",            customer:"Bright Ltd", priority:"medium",   status:"open",        assigned:"IT Support" },
  { id:"3", number:"TKT-003", subject:"AC unit servicing due",              customer:"Internal",   priority:"low",      status:"resolved",    assigned:"Facilities" },
]
const priorityVariant = (p: string) => p === "critical" ? "bad" : p === "high" ? "warn" : p === "medium" ? "blue" : "default"
const statusVariant   = (s: string) => s === "resolved" || s === "closed" ? "ok" : s === "in_progress" ? "blue" : "warn"

export default function ServicePage() {
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ subject:"", customer:"", priority:"medium" })

  return (
    <div>
      <PageHeader title="Service Management" subtitle="MOD-20 · Service desk · Asset maintenance · SLA tracking"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ New Ticket</button>}
      />
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KPICard label="Open" value={String(MOCK.filter(t => t.status === "open").length)} sub="Awaiting action" color="bg-navy" />
        <KPICard label="In Progress" value={String(MOCK.filter(t => t.status === "in_progress").length)} sub="Being worked on" color="bg-teal" />
        <KPICard label="Resolved" value={String(MOCK.filter(t => t.status === "resolved").length)} sub="This week" color="bg-green-700" />
        <KPICard label="Avg Resolution" value="4.2h" sub="SLA target: 8h" color="bg-blue-700" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Ticket</th><th>Subject</th><th>Customer</th><th>Priority</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
          <tbody>
            {MOCK.map(t => (
              <tr key={t.id}>
                <td><strong>{t.number}</strong></td>
                <td>{t.subject}</td>
                <td>{t.customer}</td>
                <td><Badge variant={priorityVariant(t.priority)} className="capitalize">{t.priority}</Badge></td>
                <td><Badge variant={statusVariant(t.status)}>{t.status.replace("_"," ")}</Badge></td>
                <td>{t.assigned}</td>
                <td className="flex gap-2">
                  {t.status !== "resolved" && t.status !== "closed" && (
                    <button className="btn btn-sm btn-primary" onClick={() => showToast(`${t.number} resolved`, "success")}>Resolve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Service Ticket"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast("Ticket created", "success"); setAddModal(false) }}>Create Ticket</button>
        </>}>
        <FormGroup label="Subject" required><input placeholder="Describe the issue..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject:e.target.value }))} /></FormGroup>
        <FormRow>
          <FormGroup label="Customer / Location"><input placeholder="Customer or internal" value={form.customer} onChange={e => setForm(f => ({ ...f, customer:e.target.value }))} /></FormGroup>
          <FormGroup label="Priority">
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </FormGroup>
        </FormRow>
      </Modal>
    </div>
  )
}

import { manufacturingApi } from "@/api/manufacturing"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { Tabs } from "@/components/ui/Tabs"
import { Modal } from "@/components/ui/Modal"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"

const MOCK_WO = [
  { id:"1", number:"WO-001", bom:"Product Alpha BOM", qty:50, status:"In Progress", scheduledEnd:"28/03/2025" },
  { id:"2", number:"WO-002", bom:"Widget Deluxe BOM", qty:100, status:"Planned",     scheduledEnd:"05/04/2025" },
  { id:"3", number:"WO-003", bom:"Standard Unit BOM", qty:25,  status:"Completed",   scheduledEnd:"20/03/2025" },
]
const MOCK_BOM = [
  { id:"1", name:"Product Alpha BOM", product:"Product Alpha", components:3 },
  { id:"2", name:"Widget Deluxe BOM", product:"Widget Deluxe",  components:5 },
  { id:"3", name:"Standard Unit BOM", product:"Standard Unit",  components:2 },
]
const statusVariant = (s: string) => s === "Completed" ? "ok" : s === "In Progress" ? "blue" : "default"

export default function ManufacturingPage() {
  const [woModal, setWoModal] = useState(false)
  const [form, setForm] = useState({ bom:"", qty:"" })

  const WO = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>WO Number</th><th>BOM</th><th>Qty</th><th>Scheduled End</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {MOCK_WO.map(wo => (
            <tr key={wo.id}>
              <td><strong>{wo.number}</strong></td><td>{wo.bom}</td><td>{wo.qty}</td>
              <td>{wo.scheduledEnd}</td>
              <td><Badge variant={statusVariant(wo.status)}>{wo.status}</Badge></td>
              <td>
                {wo.status === "In Progress" && <button className="btn btn-sm btn-primary" onClick={() => showToast(`${wo.number} marked complete. Inventory updated, GL posted.`, "success")}>Complete</button>}
                {wo.status === "Planned" && <button className="btn btn-sm btn-ghost" onClick={() => showToast(`${wo.number} started`, "success")}>Start</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const BOM = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>BOM Name</th><th>Finished Product</th><th>Components</th><th>Actions</th></tr></thead>
        <tbody>
          {MOCK_BOM.map(bom => (
            <tr key={bom.id}>
              <td><strong>{bom.name}</strong></td><td>{bom.product}</td>
              <td>{bom.components} items</td>
              <td><button className="btn btn-sm btn-ghost" onClick={() => showToast(`${bom.name} opened`, "info")}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <PageHeader title="Manufacturing" subtitle="MOD-17 · Bill of Materials · Work orders · Routing · Auto GL costing"
        actions={<button className="btn btn-primary" onClick={() => setWoModal(true)}>+ New Work Order</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Active WOs" value={String(MOCK_WO.filter(w => w.status === "In Progress").length)} sub="In production" color="bg-navy" />
        <KPICard label="Planned" value={String(MOCK_WO.filter(w => w.status === "Planned").length)} sub="Awaiting start" color="bg-teal" />
        <KPICard label="Completed" value={String(MOCK_WO.filter(w => w.status === "Completed").length)} sub="This month" color="bg-green-700" />
      </div>
      <Tabs tabs={[{ key:"wo", label:"Work Orders", content:WO }, { key:"bom", label:"Bill of Materials", content:BOM }]} />
      <Modal open={woModal} onClose={() => setWoModal(false)} title="New Work Order"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setWoModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast("Work order created", "success"); setWoModal(false) }}>Create</button>
        </>}>
        <FormGroup label="Bill of Materials">
          <select value={form.bom} onChange={e => setForm(f => ({ ...f, bom:e.target.value }))}>
            <option value="">Select BOM...</option>
            {MOCK_BOM.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Quantity to Produce"><input type="number" placeholder="e.g. 50" value={form.qty} onChange={e => setForm(f => ({ ...f, qty:e.target.value }))} /></FormGroup>
      </Modal>
    </div>
  )
}

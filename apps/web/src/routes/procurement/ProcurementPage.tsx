import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { procurementApi, type PurchaseOrder } from "@/api/procurement"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { Tabs } from "@/components/ui/Tabs"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

const MOCK_PO: PurchaseOrder[] = [
  { id:"1", number:"PO-001", supplier:"Zim Supplies Ltd", total:3200, status:"Sent", date:"22/03/2025" },
  { id:"2", number:"PO-002", supplier:"Tech Parts Ltd",   total:1100, status:"Received", date:"18/03/2025" },
  { id:"3", number:"PO-003", supplier:"Office World",     total:450,  status:"Draft", date:"24/03/2025" },
]

const statusVariant = (s: string) => s === "Matched" ? "ok" : s === "Received" ? "blue" : s === "Sent" ? "warn" : "default"

export default function ProcurementPage() {
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ supplier: "", lines: [{ description: "", qty: "1", unitCost: "" }] })

  const { data } = useQuery({
    queryKey: ["procurement-orders"],
    queryFn: () => procurementApi.listPOs(),
    placeholderData: { orders: MOCK_PO, total: MOCK_PO.length },
  })

  const createMutation = useMutation({
    mutationFn: procurementApi.createPO,
    onSuccess: (po) => { qc.invalidateQueries({ queryKey: ["procurement-orders"] }); showToast(`PO ${po.number} created`, "success"); setAddModal(false) },
    onError: () => showToast("Failed to create PO", "error"),
  })

  const orders = data?.orders ?? MOCK_PO

  const POList = (
    <div className="card">
      <table className="data-table">
        <thead><tr><th>PO Number</th><th>Supplier</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map(po => (
            <tr key={po.id}>
              <td><strong>{po.number}</strong></td>
              <td>{po.supplier}</td>
              <td>{formatCurrency(po.total)}</td>
              <td>{po.date}</td>
              <td><Badge variant={statusVariant(po.status)}>{po.status}</Badge></td>
              <td className="flex gap-2">
                {po.status === "Sent" && <button className="btn btn-sm btn-primary" onClick={() => procurementApi.receiveGRN(po.id, []).then(() => { qc.invalidateQueries({ queryKey: ["procurement-orders"] }); showToast("GRN recorded", "success") })}>Receive GRN</button>}
                {po.status === "Received" && <button className="btn btn-sm btn-ghost" onClick={() => procurementApi.matchInvoice(po.id, po.id).then(() => { qc.invalidateQueries({ queryKey: ["procurement-orders"] }); showToast("3-way match complete", "success") })}>Match Invoice</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <PageHeader title="Procurement" subtitle="MOD-09 · Purchase orders · GRN · 3-way match · Supplier management"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ New PO</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Open POs" value={String(orders.filter(p => p.status !== "Matched").length)} sub="Pending receipt or match" color="bg-navy" />
        <KPICard label="GRN Pending" value={String(orders.filter(p => p.status === "Received").length)} sub="Awaiting 3-way match" color="bg-teal" />
        <KPICard label="Total Committed" value={formatCurrency(orders.reduce((s,p) => s + p.total, 0))} sub="Outstanding PO value" color="bg-teal-dark" />
      </div>
      <Tabs tabs={[{ key:"pos", label:"Purchase Orders", content:POList }, { key:"suppliers", label:"Suppliers", content:<div className="card"><p className="text-sm text-muted-foreground">Supplier directory — connect to procurement-service.</p></div> }]} />
      <Modal open={addModal} onClose={() => setAddModal(false)} title="New Purchase Order"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={createMutation.isPending}
            onClick={() => createMutation.mutate({ supplier: form.supplier, lines: form.lines.map(l => ({ productId:"", description:l.description, qty:parseFloat(l.qty)||1, unitCost:parseFloat(l.unitCost)||0 })) } as any)}>
            {createMutation.isPending ? "Creating..." : "Create PO"}
          </button>
        </>}>
        <FormGroup label="Supplier" required><input placeholder="Supplier name" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier:e.target.value }))} /></FormGroup>
        {form.lines.map((line, i) => (
          <div key={i} className="border border-border rounded-lg p-3 mb-2">
            <FormGroup label={`Item ${i+1}`}><input placeholder="Description" value={line.description} onChange={e => setForm(f => ({ ...f, lines:f.lines.map((l,j) => j===i ? {...l,description:e.target.value} : l) }))} /></FormGroup>
            <FormRow>
              <FormGroup label="Qty"><input type="number" value={line.qty} onChange={e => setForm(f => ({ ...f, lines:f.lines.map((l,j) => j===i ? {...l,qty:e.target.value} : l) }))} /></FormGroup>
              <FormGroup label="Unit Cost ($)"><input type="number" value={line.unitCost} onChange={e => setForm(f => ({ ...f, lines:f.lines.map((l,j) => j===i ? {...l,unitCost:e.target.value} : l) }))} /></FormGroup>
            </FormRow>
          </div>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => setForm(f => ({ ...f, lines:[...f.lines,{description:"",qty:"1",unitCost:""}] }))}>+ Add Line</button>
      </Modal>
    </div>
  )
}

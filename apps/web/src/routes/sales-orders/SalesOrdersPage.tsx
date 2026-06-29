import { salesOrdersApi } from "@/api/sales-orders"
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
  { id:"1", number:"SO-001", type:"sales_order", customer:"Acme Corp",  total:2400, status:"Confirmed", date:"22/03" },
  { id:"2", number:"QT-001", type:"quote",        customer:"Bright Ltd", total:800,  status:"Draft",     date:"23/03" },
  { id:"3", number:"SO-002", type:"sales_order", customer:"Delta Inc",  total:1200, status:"Invoiced",  date:"20/03" },
]
const statusVariant = (s: string) => s === "Invoiced" ? "ok" : s === "Confirmed" ? "blue" : "default"

export default function SalesOrdersPage() {
  const [addModal, setAddModal] = useState(false)
  const [type, setType] = useState<"quote"|"sales_order">("sales_order")
  const [form, setForm] = useState({ customer:"", item:"", qty:"1", price:"" })

  return (
    <div>
      <PageHeader title="Quotes & Sales Orders" subtitle="MOD-16 · Quote-to-cash pipeline · Convert quotes to orders to invoices"
        actions={<>
          <button className="btn btn-ghost" onClick={() => { setType("quote"); setAddModal(true) }}>+ New Quote</button>
          <button className="btn btn-primary" onClick={() => { setType("sales_order"); setAddModal(true) }}>+ Sales Order</button>
        </>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Open Orders" value={String(MOCK.filter(o => o.status !== "Invoiced").length)} sub="Awaiting fulfillment" color="bg-navy" />
        <KPICard label="Quotes Pending" value={String(MOCK.filter(o => o.type === "quote").length)} sub="Awaiting confirmation" color="bg-teal" />
        <KPICard label="Order Value" value={formatCurrency(MOCK.reduce((s,o) => s + o.total, 0))} sub="Total pipeline" color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Number</th><th>Type</th><th>Customer</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {MOCK.map(o => (
              <tr key={o.id}>
                <td><strong>{o.number}</strong></td>
                <td><Badge variant="blue">{o.type === "quote" ? "Quote" : "Sales Order"}</Badge></td>
                <td>{o.customer}</td>
                <td>{formatCurrency(o.total)}</td>
                <td>{o.date}</td>
                <td><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                <td className="flex gap-2">
                  {o.type === "quote" && o.status === "Draft" && <button className="btn btn-sm btn-primary" onClick={() => showToast(`${o.number} converted to Sales Order`, "success")}>Convert</button>}
                  {o.type === "sales_order" && o.status === "Confirmed" && <button className="btn btn-sm btn-ghost" onClick={() => showToast(`Invoice created for ${o.number}`, "success")}>Invoice</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title={type === "quote" ? "New Quote" : "New Sales Order"}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast(`${type === "quote" ? "Quote" : "Sales Order"} created`, "success"); setAddModal(false) }}>Create</button>
        </>}>
        <FormGroup label="Customer" required><input placeholder="Customer name" value={form.customer} onChange={e => setForm(f => ({ ...f, customer:e.target.value }))} /></FormGroup>
        <FormRow>
          <FormGroup label="Item"><input placeholder="Product/Service" value={form.item} onChange={e => setForm(f => ({ ...f, item:e.target.value }))} /></FormGroup>
          <FormGroup label="Qty"><input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty:e.target.value }))} /></FormGroup>
        </FormRow>
        <FormGroup label="Unit Price ($)"><input type="number" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price:e.target.value }))} /></FormGroup>
      </Modal>
    </div>
  )
}

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { crmApi, type Customer } from "@/api/crm"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

const MOCK: Customer[] = [
  { id: "1", name: "Acme Corp",  email: "acme@example.com",  totalSpend: 12400, lastOrderDate: "22 Mar 2025", segment: "Champion", creditLimit: 50000, phone: "" },
  { id: "2", name: "Bright Ltd", email: "bright@example.com", totalSpend: 4200,  lastOrderDate: "10 Mar 2025", segment: "Loyal",    creditLimit: 20000, phone: "" },
  { id: "3", name: "Delta Inc",  email: "delta@example.com",  totalSpend: 890,   lastOrderDate: "01 Feb 2025", segment: "At Risk",  creditLimit: 5000,  phone: "" },
]
const segmentVariant = (s: string) => s === "Champion" ? "ok" : s === "Loyal" ? "blue" : "warn"

export default function CrmPage() {
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", creditLimit: "" })

  const { data } = useQuery({ queryKey: ["crm-customers"], queryFn: () => crmApi.list(), placeholderData: { customers: MOCK, total: MOCK.length } })
  const customers = data?.customers ?? MOCK

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => crmApi.create(data),
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["crm-customers"] }); showToast("Customer " + c.name + " added", "success"); setAddModal(false) },
    onError: () => showToast("Failed to add customer", "error"),
  })

  return (
    <div>
      <PageHeader title="CRM" subtitle="MOD-10 - Customer profiles - RFM segmentation - Loyalty"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Customer</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Total Customers" value={String(data?.total ?? 1284)} sub="8 new this week" color="bg-teal" />
        <KPICard label="Active Leads" value="47" sub="12 closing this month" color="bg-navy" />
        <KPICard label="Avg Order Value" value={formatCurrency(189)} sub="6% vs last month" color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Customer</th><th>Email</th><th>Total Spend</th><th>Last Order</th><th>Segment</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.email}</td>
                <td>{formatCurrency(c.totalSpend)}</td>
                <td>{c.lastOrderDate}</td>
                <td><Badge variant={segmentVariant(c.segment)}>{c.segment}</Badge></td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => showToast(c.name + " profile opened", "info")}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Customer"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={createMutation.isPending}
            onClick={() => createMutation.mutate({ ...form, creditLimit: parseFloat(form.creditLimit) || 0 } as any)}>
            {createMutation.isPending ? "Saving..." : "Save Customer"}
          </button>
        </>}>
        <FormRow>
          <FormGroup label="Company Name" required><input placeholder="Acme Corp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormGroup>
          <FormGroup label="Email"><input type="email" placeholder="info@acme.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Phone"><input placeholder="+263 77..." value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></FormGroup>
          <FormGroup label="Credit Limit ($)"><input type="number" placeholder="5000" value={form.creditLimit} onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))} /></FormGroup>
        </FormRow>
      </Modal>
    </div>
  )
}

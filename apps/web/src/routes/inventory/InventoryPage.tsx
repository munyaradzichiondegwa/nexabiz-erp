/**
 * MOD-04 — Inventory Engine
 * Multi-warehouse, FIFO/WAC/Standard costing, restock workflows.
 */
import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventoryApi } from "@/api/inventory"
import { PageHeader } from "@/components/ui/PageHeader"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { DataTable, type Column } from "@/components/ui/DataTable"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

type InvItem = { id: string; sku: string; name: string; category: string; qty: number; cost: number; reorderLevel: number; costingMethod: string }

const statusLabel = (qty: number, reorder: number) => qty === 0 ? "Out of Stock" : qty <= reorder ? "Low Stock" : "In Stock"
const statusVariant = (qty: number, reorder: number): "bad" | "warn" | "ok" => qty === 0 ? "bad" : qty <= reorder ? "warn" : "ok"

const MOCK: InvItem[] = [
  { id: "1", sku: "001", name: "Item A", category: "Electronics",  qty: 35, cost: 120, reorderLevel: 10, costingMethod: "FIFO" },
  { id: "2", sku: "002", name: "Item B", category: "Apparel",      qty: 4,  cost: 45,  reorderLevel: 10, costingMethod: "WAC" },
  { id: "3", sku: "003", name: "Item C", category: "Food & Bev",   qty: 0,  cost: 8,   reorderLevel: 20, costingMethod: "FIFO" },
  { id: "4", sku: "004", name: "Item D", category: "Stationery",   qty: 88, cost: 3,   reorderLevel: 25, costingMethod: "Standard" },
]

export default function InventoryPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [addModal, setAddModal] = useState(false)
  const [restockModal, setRestockModal] = useState<InvItem | null>(null)
  const [restockQty, setRestockQty] = useState("")
  const [form, setForm] = useState({ sku: "", name: "", category: "Electronics", qty: "", cost: "", reorderLevel: "10", costingMethod: "FIFO" })

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", search, statusFilter],
    queryFn: () => inventoryApi.list({ search, page: 1 }),
    placeholderData: { items: MOCK, total: MOCK.length },
  })

  const createMutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: (item) => { qc.invalidateQueries({ queryKey: ["inventory"] }); showToast(`📦 ${item.name} added`, "success"); setAddModal(false) },
    onError: () => showToast("Failed to add item", "error"),
  })

  const restockMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => inventoryApi.restock(id, { type: "IN", qty, reason: "Manual restock" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); showToast("Item restocked", "success"); setRestockModal(null); setRestockQty("") },
    onError: () => showToast("Restock failed", "error"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); showToast("Item deleted", "info") },
    onError: () => showToast("Delete failed", "error"),
  })

  const items: InvItem[] = (data?.items ?? MOCK).filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.includes(search)
    const matchStatus = !statusFilter || statusLabel(item.qty, item.reorderLevel) === statusFilter
    return matchSearch && matchStatus
  })

  const columns: Column<InvItem>[] = [
    { key: "sku",     header: "SKU",      sortable: true },
    { key: "name",    header: "Name",     sortable: true, render: r => <strong>{r.name}</strong> },
    { key: "category",header: "Category" },
    { key: "qty",     header: "Qty",      sortable: true, render: r => <strong>{r.qty}</strong> },
    { key: "cost",    header: "Cost",     render: r => formatCurrency(r.cost) },
    { key: "status",  header: "Status",   render: r => <Badge variant={statusVariant(r.qty, r.reorderLevel)}>{statusLabel(r.qty, r.reorderLevel)}</Badge> },
    { key: "actions", header: "Actions",  render: r => (
      <div className="flex gap-2">
        <button className="btn btn-sm btn-ghost" onClick={() => setRestockModal(r)}>+ Restock</button>
        <button className="btn btn-sm btn-danger" onClick={() => { if (confirm("Delete this item?")) deleteMutation.mutate(r.id) }}>Delete</button>
      </div>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="MOD-04 · Multi-warehouse · FIFO / WAC / Standard costing"
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => inventoryApi.export().then(() => showToast("Exporting CSV…", "success"))}>⬇ Export</button>
            <button className="btn btn-primary" onClick={() => setAddModal(true)}>＋ Add Item</button>
          </>
        }
      />

      <div className="card">
        <div className="flex gap-3 mb-4">
          <input
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
            placeholder="Search inventory, SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:border-teal"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
          </select>
        </div>
        <DataTable columns={columns} data={items} keyField="id" isLoading={isLoading} emptyMessage="No inventory items found" />
      </div>

      {/* Add Item Modal */}
      <Modal
        open={addModal} onClose={() => setAddModal(false)} title="📦 Add Inventory Item"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={createMutation.isPending}
              onClick={() => createMutation.mutate({ ...form, qty: parseInt(form.qty) || 0, cost: parseFloat(form.cost) || 0, reorderLevel: parseInt(form.reorderLevel) || 10 } as any)}>
              {createMutation.isPending ? "Saving…" : "Save Item"}
            </button>
          </>
        }
      >
        <FormRow>
          <FormGroup label="SKU"><input placeholder="SKU-001" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></FormGroup>
          <FormGroup label="Category">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option>Electronics</option><option>Apparel</option><option>Food &amp; Bev</option><option>Stationery</option><option>Other</option>
            </select>
          </FormGroup>
        </FormRow>
        <FormGroup label="Product Name" required><input placeholder="Product name…" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></FormGroup>
        <FormRow>
          <FormGroup label="Quantity"><input type="number" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} /></FormGroup>
          <FormGroup label="Unit Cost ($)"><input type="number" placeholder="0.00" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Reorder Level"><input type="number" placeholder="10" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))} /></FormGroup>
          <FormGroup label="Costing Method">
            <select value={form.costingMethod} onChange={e => setForm(f => ({ ...f, costingMethod: e.target.value }))}>
              <option>FIFO</option><option>WAC</option><option>Standard</option>
            </select>
          </FormGroup>
        </FormRow>
      </Modal>

      {/* Restock Modal */}
      <Modal
        open={!!restockModal} onClose={() => setRestockModal(null)} title={`+ Restock: ${restockModal?.name ?? ""}`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setRestockModal(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={restockMutation.isPending}
              onClick={() => restockModal && restockMutation.mutate({ id: restockModal.id, qty: parseInt(restockQty) || 0 })}>
              {restockMutation.isPending ? "Saving…" : "Restock"}
            </button>
          </>
        }
      >
        <FormGroup label="Quantity to add">
          <input type="number" placeholder="e.g. 50" value={restockQty} onChange={e => setRestockQty(e.target.value)} min={1} />
        </FormGroup>
        {restockModal && <p className="text-sm text-muted-foreground">Current stock: <strong>{restockModal.qty}</strong></p>}
      </Modal>
    </div>
  )
}

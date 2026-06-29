import { workflowsApi } from "@/api/workflows"
import React from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { showToast } from "@/components/ui/Toast"

const MOCK_PENDING = [
  { id:"1", workflow:"PO Approval", entity:"PO-001 · Zim Supplies $3,200", submittedBy:"Bob Chirwa", submittedAt:"2h ago" },
  { id:"2", workflow:"Leave Request", entity:"Carol Dube · Annual Leave 3 days", submittedBy:"Carol Dube", submittedAt:"4h ago" },
  { id:"3", workflow:"Journal Entry Approval", entity:"JE-Mar-042 · $4,800 payroll adj", submittedBy:"Alice Moyo", submittedAt:"1d ago" },
]

export default function WorkflowsPage() {
  return (
    <div>
      <PageHeader title="Approval Workflows" subtitle="MOD-19 · Multi-level approval engine · Auto-route by amount and role" />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Pending My Approval" value={String(MOCK_PENDING.length)} sub="Action required" color="bg-navy" />
        <KPICard label="Approved Today" value="7" sub="All workflows" color="bg-teal" />
        <KPICard label="SLA Compliance" value="94%" sub="Within target time" color="bg-green-700" />
      </div>
      <div className="card">
        <h3>Pending Approvals</h3>
        {!MOCK_PENDING.length ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No pending approvals. You are all caught up! ✅</div>
        ) : MOCK_PENDING.map(item => (
          <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <div className="font-semibold text-sm">{item.workflow}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.entity}</div>
              <div className="text-xs text-muted-foreground">Submitted by {item.submittedBy} · {item.submittedAt}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={() => showToast(`Approved: ${item.entity}`, "success")}>✓ Approve</button>
              <button className="btn btn-sm btn-danger" onClick={() => showToast(`Rejected: ${item.entity}`, "warning")}>✗ Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

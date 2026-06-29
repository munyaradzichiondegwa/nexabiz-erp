import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { hrApi, type Employee } from "@/api/hr"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Modal } from "@/components/ui/Modal"
import { Badge } from "@/components/ui/Badge"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { formatCurrency } from "@/utils/currency"

const MOCK: Employee[] = [
  { id: "1", firstName: "Alice", lastName: "Moyo",   role: "CFO",      department: "Finance",     salary: 6500, status: "Active",    startDate: "2020-01-01", email: "alice@example.com" },
  { id: "2", firstName: "Bob",   lastName: "Chirwa", role: "Dev Lead",  department: "Engineering", salary: 4800, status: "Active",    startDate: "2021-06-01", email: "bob@example.com" },
  { id: "3", firstName: "Carol", lastName: "Dube",   role: "Sales Mgr", department: "Sales",       salary: 3900, status: "On Leave", startDate: "2019-03-15", email: "carol@example.com" },
]
const statusVariant = (s: string) => s === "Active" ? "ok" : s === "On Leave" ? "warn" : "bad"

export default function HrPage() {
  const qc = useQueryClient()
  const [addModal, setAddModal] = useState(false)
  const [runPayrollLoading, setRunPayrollLoading] = useState(false)
  const [form, setForm] = useState({ firstName: "", lastName: "", role: "", department: "Engineering", salary: "" })

  const { data } = useQuery({ queryKey: ["hr-employees"], queryFn: () => hrApi.listEmployees(), placeholderData: { employees: MOCK, total: MOCK.length } })
  const employees = data?.employees ?? MOCK

  const createMutation = useMutation({
    mutationFn: (data: Partial<Employee>) => hrApi.createEmployee(data),
    onSuccess: (e) => { qc.invalidateQueries({ queryKey: ["hr-employees"] }); showToast(e.firstName + " " + e.lastName + " added", "success"); setAddModal(false) },
    onError: () => showToast("Failed to add employee", "error"),
  })

  const handleRunPayroll = async () => {
    setRunPayrollLoading(true)
    try {
      await hrApi.runPayroll("March", 2025)
      showToast("Payroll run complete for March 2025 - GL posted automatically", "success")
    } catch { showToast("Payroll run failed", "error") }
    finally { setRunPayrollLoading(false) }
  }

  return (
    <div>
      <PageHeader title="HR & Payroll" subtitle="MOD-11 - Employee master - Payroll engine - Leave management"
        actions={<>
          <button className="btn btn-ghost" onClick={handleRunPayroll} disabled={runPayrollLoading}>
            {runPayrollLoading ? "Running..." : "Run Payroll"}
          </button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Add Employee</button>
        </>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Employees" value={String(data?.total ?? 24)} sub="2 on leave today" color="bg-navy" />
        <KPICard label="Payroll This Month" value={formatCurrency(48200)} sub="GL posted automatically" color="bg-teal" />
        <KPICard label="Leave Requests" value="3" sub="Pending approval" color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Salary</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id}>
                <td><strong>{e.firstName} {e.lastName}</strong></td>
                <td>{e.role}</td><td>{e.department}</td><td>{formatCurrency(e.salary)}</td>
                <td><Badge variant={statusVariant(e.status)}>{e.status}</Badge></td>
                <td><button className="btn btn-sm btn-ghost" onClick={() => hrApi.getPayslip(e.id, "current").then(() => showToast(e.firstName + " payslip generated", "success"))}>Payslip</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Employee"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={createMutation.isPending}
            onClick={() => createMutation.mutate({ ...form, salary: parseFloat(form.salary) || 0, status: "Active" as const, startDate: new Date().toISOString().split("T")[0], email: "" })}>
            {createMutation.isPending ? "Adding..." : "Add Employee"}
          </button>
        </>}>
        <FormRow>
          <FormGroup label="First Name" required><input placeholder="Alice" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></FormGroup>
          <FormGroup label="Last Name" required><input placeholder="Moyo" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Role"><input placeholder="Software Developer" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></FormGroup>
          <FormGroup label="Department">
            <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              <option>Engineering</option><option>Finance</option><option>Sales</option><option>HR</option><option>Operations</option>
            </select>
          </FormGroup>
        </FormRow>
        <FormGroup label="Monthly Salary ($)"><input type="number" placeholder="2500" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} /></FormGroup>
      </Modal>
    </div>
  )
}

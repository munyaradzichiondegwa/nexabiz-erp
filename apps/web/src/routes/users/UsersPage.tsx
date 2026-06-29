import { usersApi } from "@/api/users"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"

const MOCK_USERS = [
  { id:"1", name:"Alice Moyo",   email:"alice@demo.com",   role:"Admin",        mfa:true,  active:true,  lastLogin:"5m ago" },
  { id:"2", name:"Bob Chirwa",   email:"bob@demo.com",     role:"Accountant",   mfa:true,  active:true,  lastLogin:"2h ago" },
  { id:"3", name:"Carol Dube",   email:"carol@demo.com",   role:"Cashier",      mfa:false, active:true,  lastLogin:"1d ago" },
  { id:"4", name:"Dave Ncube",   email:"dave@demo.com",    role:"HR Manager",   mfa:false, active:false, lastLogin:"7d ago" },
  { id:"5", name:"Eve Mutasa",   email:"eve@demo.com",     role:"Warehouse",    mfa:false, active:true,  lastLogin:"3h ago" },
]

const ROLES = ["Super Admin","Admin","Accountant","HR Manager","Cashier","Warehouse","Sales","Viewer"]

export default function UsersPage() {
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", role:"Viewer" })

  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="MOD-13 · RBAC · Permissions · MFA management · Audit logs"
        actions={<button className="btn btn-primary" onClick={() => setAddModal(true)}>+ Invite User</button>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Total Users" value={String(MOCK_USERS.length)} sub={`${MOCK_USERS.filter(u => u.active).length} active`} color="bg-navy" />
        <KPICard label="MFA Enabled" value={String(MOCK_USERS.filter(u => u.mfa).length)} sub={`${Math.round((MOCK_USERS.filter(u => u.mfa).length / MOCK_USERS.length) * 100)}% adoption`} color="bg-teal" />
        <KPICard label="Roles Defined" value={String(ROLES.length)} sub="Custom + system roles" color="bg-teal-dark" />
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>MFA</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {MOCK_USERS.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><Badge variant="blue">{u.role}</Badge></td>
                <td><Badge variant={u.mfa ? "ok" : "warn"}>{u.mfa ? "Enabled" : "Disabled"}</Badge></td>
                <td className="text-muted-foreground text-sm">{u.lastLogin}</td>
                <td><Badge variant={u.active ? "ok" : "bad"}>{u.active ? "Active" : "Inactive"}</Badge></td>
                <td className="flex gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => showToast(`${u.name} updated`, "info")}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => showToast(`${u.name} ${u.active ? "deactivated" : "activated"}`, "warning")}>{u.active ? "Deactivate" : "Activate"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Invite New User"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast(`Invitation sent to ${form.email}`, "success"); setAddModal(false) }}>Send Invite</button>
        </>}>
        <FormRow>
          <FormGroup label="First Name" required><input placeholder="Alice" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName:e.target.value }))} /></FormGroup>
          <FormGroup label="Last Name" required><input placeholder="Moyo" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName:e.target.value }))} /></FormGroup>
        </FormRow>
        <FormGroup label="Email Address" required><input type="email" placeholder="alice@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} /></FormGroup>
        <FormGroup label="Role">
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role:e.target.value }))}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </FormGroup>
        <p className="text-xs text-muted-foreground mt-2">A temporary password will be sent to the email address. The user must enable MFA on first login.</p>
      </Modal>
    </div>
  )
}

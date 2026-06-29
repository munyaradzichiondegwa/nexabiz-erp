import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi, modulesApi, type ModuleStatus } from "@/api/modules"
import { PageHeader } from "@/components/ui/PageHeader"
import { Tabs } from "@/components/ui/Tabs"
import { showToast } from "@/components/ui/Toast"
import { FormGroup } from "@/components/forms/FormGroup"
import { FormRow } from "@/components/forms/FormRow"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { toggle as toggleModuleAction } from "@/store/slices/moduleRegistrySlice"

const MOCK_MODULES: ModuleStatus[] = [
  { code: "MOD-01", name: "Authentication & Security", desc: "MFA, SSO, RBAC", isCore: true, isActive: true },
  { code: "MOD-02", name: "Dashboard & KPI Hub",       desc: "Widgets, real-time KPIs", isCore: true, isActive: true },
  { code: "MOD-03", name: "POS / Sales Engine",        desc: "Touch POS, offline mode", isCore: false, isActive: true },
  { code: "MOD-04", name: "Inventory Engine",          desc: "Multi-warehouse, FIFO/WAC", isCore: false, isActive: true },
  { code: "MOD-05", name: "Banking & Cash",            desc: "Reconciliation, forecasting", isCore: false, isActive: true },
  { code: "MOD-06", name: "Accounting Engine",         desc: "Double-entry GL, AR, AP", isCore: true, isActive: true },
  { code: "MOD-07", name: "Financial Reporting",       desc: "GAAP/IFRS reports", isCore: true, isActive: true },
  { code: "MOD-08", name: "AI Analytics",              desc: "Forecasting, anomaly detection", isCore: false, isActive: true },
  { code: "MOD-09", name: "Procurement",               desc: "PO, GRN, 3-way match", isCore: false, isActive: false },
  { code: "MOD-10", name: "CRM",                       desc: "RFM, loyalty, pipeline", isCore: false, isActive: true },
  { code: "MOD-11", name: "HR & Payroll",              desc: "Payroll, leave, time tracking", isCore: false, isActive: true },
  { code: "MOD-12", name: "Multi-Branch",              desc: "Consolidated statements", isCore: false, isActive: false },
  { code: "MOD-13", name: "Users & Roles",             desc: "RBAC, permissions, MFA", isCore: true, isActive: true },
  { code: "MOD-14", name: "Settings & Integrations",   desc: "Company, modules, APIs", isCore: true, isActive: true },
  { code: "MOD-15", name: "Budgeting",                 desc: "Budget vs actual, AI assist", isCore: false, isActive: false },
  { code: "MOD-16", name: "Sales Orders & Quotes",     desc: "Quote-to-cash pipeline", isCore: false, isActive: false },
  { code: "MOD-17", name: "Manufacturing",             desc: "BOM, work orders, routing", isCore: false, isActive: false },
  { code: "MOD-18", name: "Project Accounting",        desc: "Cost tracking, billing", isCore: false, isActive: false },
  { code: "MOD-19", name: "Approval Workflows",        desc: "Multi-level engine", isCore: false, isActive: false },
  { code: "MOD-20", name: "Service Management",        desc: "Service desk, asset maintenance", isCore: false, isActive: false },
]

const MOCK_INTEGRATIONS = [
  { name: "Stripe",       icon: "💳", desc: "Payment gateway",          connected: true },
  { name: "Flutterwave",  icon: "🌍", desc: "African payment gateway",  connected: false },
  { name: "Paynow",       icon: "📱", desc: "Zimbabwe mobile payments", connected: false },
  { name: "Xero",         icon: "📊", desc: "Accounting sync",          connected: false },
  { name: "Shopify",      icon: "🛍️", desc: "eCommerce connector",     connected: false },
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const dispatch = useAppDispatch()
  const [company, setCompany] = useState({ name: "NexaBiz Demo Co", currency: "USD", taxNumber: "TX-12345678", fyEnd: "December", address: "123 Business Park, Harare, Zimbabwe" })
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS)

  const { data: modules = MOCK_MODULES } = useQuery({ queryKey: ["module-status"], queryFn: modulesApi.getStatus, placeholderData: MOCK_MODULES })

  const toggleMutation = useMutation({
    mutationFn: ({ code, activate }: { code: string; activate: boolean }) => modulesApi.toggle(code, activate),
    onSuccess: (_, { code, activate }) => {
      qc.invalidateQueries({ queryKey: ["module-status"] })
      dispatch(toggleModuleAction(code))
      showToast(code + " " + (activate ? "enabled" : "disabled"), "info")
    },
    onError: () => showToast("Failed to toggle module", "error"),
  })

  const Company = (
    <div className="card">
      <FormRow>
        <FormGroup label="Company Name"><input value={company.name} onChange={e => setCompany(f => ({ ...f, name: e.target.value }))} /></FormGroup>
        <FormGroup label="Currency"><select value={company.currency} onChange={e => setCompany(f => ({ ...f, currency: e.target.value }))}><option>USD</option><option>ZWL</option><option>EUR</option><option>GBP</option></select></FormGroup>
      </FormRow>
      <FormRow>
        <FormGroup label="Tax Number"><input value={company.taxNumber} onChange={e => setCompany(f => ({ ...f, taxNumber: e.target.value }))} /></FormGroup>
        <FormGroup label="Financial Year End"><select value={company.fyEnd} onChange={e => setCompany(f => ({ ...f, fyEnd: e.target.value }))}><option>December</option><option>March</option><option>June</option><option>September</option></select></FormGroup>
      </FormRow>
      <FormGroup label="Address"><textarea rows={2} value={company.address} onChange={e => setCompany(f => ({ ...f, address: e.target.value }))} /></FormGroup>
      <button className="btn btn-primary" onClick={() => showToast("Company settings saved", "success")}>Save Changes</button>
    </div>
  )

  const Modules = (
    <div className="card">
      <p className="text-sm text-muted-foreground mb-4">Core modules cannot be disabled. Toggle optional modules on/off per your subscription.</p>
      <div className="flex flex-col">
        {modules.map(m => (
          <div key={m.code} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">
                {m.code} - {m.name}
                {m.isCore && <span className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 font-semibold">CORE</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
            </div>
            <label className="toggle" title={m.isCore ? "Core module cannot be disabled" : "Toggle module"}>
              <input type="checkbox" checked={m.isActive} disabled={m.isCore || toggleMutation.isPending}
                onChange={e => !m.isCore && toggleMutation.mutate({ code: m.code, activate: e.target.checked })} />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const Integrations = (
    <div className="card">
      <div className="flex flex-col gap-0">
        {integrations.map(intg => (
          <div key={intg.name} className="flex items-center gap-4 py-3 border-b border-border last:border-b-0">
            <div className="text-2xl w-9 text-center">{intg.icon}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{intg.name}</div>
              <div className="text-xs text-muted-foreground">{intg.desc}</div>
            </div>
            <button className={`btn btn-sm ${intg.connected ? "btn-ghost" : "btn-primary"}`}
              onClick={() => { setIntegrations(prev => prev.map(i => i.name === intg.name ? { ...i, connected: !i.connected } : i)); showToast(intg.name + " " + (intg.connected ? "disconnected" : "connected"), "success") }}>
              {intg.connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Settings" subtitle="MOD-14 - Company info - Module manager - Integrations" />
      <Tabs tabs={[{ key: "company", label: "Company", content: Company }, { key: "modules", label: "Modules", content: Modules }, { key: "integrations", label: "Integrations", content: Integrations }]} />
    </div>
  )
}

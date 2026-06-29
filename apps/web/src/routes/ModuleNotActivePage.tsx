import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'

interface Props { moduleCode?: string }

const MODULE_NAMES: Record<string, string> = {
  'MOD-03': 'POS / Sales Engine',
  'MOD-04': 'Inventory Engine',
  'MOD-05': 'Banking & Cash Management',
  'MOD-06': 'Accounting Engine',
  'MOD-07': 'Financial Reporting Suite',
  'MOD-08': 'AI Analytics & Intelligence',
  'MOD-09': 'Procurement & Supplier Management',
  'MOD-10': 'CRM',
  'MOD-11': 'HR & Payroll',
  'MOD-12': 'Multi-Branch Management',
  'MOD-13': 'User & Role Management',
  'MOD-14': 'Settings & Integrations',
  'MOD-15': 'Budgeting',
  'MOD-16': 'Quotes & Sales Orders',
  'MOD-17': 'Manufacturing',
  'MOD-18': 'Project Accounting',
  'MOD-19': 'Approval Workflow Engine',
  'MOD-20': 'Service Management & Asset Maintenance',
}

export const ModuleNotActivePage: React.FC<Props> = ({ moduleCode }) => {
  const navigate = useNavigate()
  const name = moduleCode ? (MODULE_NAMES[moduleCode] ?? moduleCode) : 'This module'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Lock className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold mb-2">{name} is not active</h1>
        <p className="text-muted-foreground max-w-md">
          This module is available on your plan but has not been activated.
          Contact your administrator to enable it.
        </p>
        {moduleCode && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">{moduleCode}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/dashboard')} className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors">
          Go to Dashboard
        </button>
        <button onClick={() => navigate('/settings')} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
          Manage Modules <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

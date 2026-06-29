import { budgetingApi } from "@/api/budgeting"
import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { KPICard } from "@/components/ui/KPICard"
import { AIBar } from "@/components/ui/AIBar"
import { showToast } from "@/components/ui/Toast"
import { formatCurrency } from "@/utils/currency"

const MOCK_BUDGET = [
  { account: "4000 – Sales Revenue",     budgeted:50000, actual:54200, variance:4200 },
  { account: "5000 – COGS",             budgeted:30000, actual:28500, variance:1500 },
  { account: "6000 – Salaries & Wages", budgeted:14400, actual:14400, variance:0 },
  { account: "6100 – Rent",             budgeted:1500,  actual:1200,  variance:300 },
  { account: "6200 – Utilities",        budgeted:600,   actual:450,   variance:150 },
  { account: "6300 – Marketing",        budgeted:2000,  actual:1800,  variance:200 },
]

export default function BudgetingPage() {
  const [year, setYear] = useState("2025")
  const totalBudget  = MOCK_BUDGET.reduce((s,r) => s + r.budgeted, 0)
  const totalActual  = MOCK_BUDGET.reduce((s,r) => s + r.actual, 0)
  const totalVariance = totalBudget - totalActual

  return (
    <div>
      <PageHeader title="Budgeting" subtitle="MOD-15 · Budget vs actual · Variance analysis · AI-assisted forecasting"
        actions={<>
          <select className="border border-border rounded-lg px-3 py-2 text-sm bg-white" value={year} onChange={e => setYear(e.target.value)}>
            {["2023","2024","2025","2026"].map(y => <option key={y}>{y}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => showToast("Exporting budget report...", "success")}>⬇ Export</button>
          <button className="btn btn-primary" onClick={() => showToast("Budget template saved", "success")}>Save Budget</button>
        </>}
      />
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Total Budget" value={formatCurrency(totalBudget)} sub={`FY ${year}`} color="bg-navy" />
        <KPICard label="Actual Spend" value={formatCurrency(totalActual)} sub="Year to date" color="bg-teal" />
        <KPICard label="Net Variance" value={formatCurrency(Math.abs(totalVariance))} sub={totalVariance >= 0 ? "Under budget ✅" : "Over budget ⚠️"} color={totalVariance >= 0 ? "bg-green-700" : "bg-red-700"} />
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="!mb-0">Budget vs Actual — {year}</h3>
        </div>
        <AIBar>AI Insight: Revenue exceeded budget by 8.4% ({formatCurrency(4200)}). Marketing spend is 10% under budget — consider increasing Q2 campaigns. Payroll on target.</AIBar>
        <table className="data-table mt-4">
          <thead><tr><th>Account</th><th>Budget</th><th>Actual</th><th>Variance</th><th>%</th></tr></thead>
          <tbody>
            {MOCK_BUDGET.map(row => {
              const pct = row.budgeted > 0 ? ((row.actual / row.budgeted) * 100).toFixed(1) : "0"
              const varColor = row.variance >= 0 ? "text-green-700" : "text-red-700"
              return (
                <tr key={row.account}>
                  <td>{row.account}</td>
                  <td>{formatCurrency(row.budgeted)}</td>
                  <td>{formatCurrency(row.actual)}</td>
                  <td className={`font-semibold ${varColor}`}>{row.variance >= 0 ? "+" : ""}{formatCurrency(row.variance)}</td>
                  <td className={`text-sm ${varColor}`}>{pct}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

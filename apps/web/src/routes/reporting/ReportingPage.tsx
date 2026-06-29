import React, { useState } from "react"
import { PageHeader } from "@/components/ui/PageHeader"
import { Tabs } from "@/components/ui/Tabs"
import { showToast } from "@/components/ui/Toast"
import { formatCurrency } from "@/utils/currency"

export default function ReportingPage() {
  const [period, setPeriod] = useState("This Month")
  const BS = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="card"><h3>Assets</h3>
        <table className="data-table"><thead><tr><th>Account</th><th>Amount</th></tr></thead><tbody>
          <tr><td><strong>Current Assets</strong></td><td></td></tr>
          <tr><td className="pl-6">Cash & Bank</td><td>{formatCurrency(20000)}</td></tr>
          <tr><td className="pl-6">Accounts Receivable</td><td>{formatCurrency(12500)}</td></tr>
          <tr><td className="pl-6">Inventory</td><td>{formatCurrency(30000)}</td></tr>
          <tr><td><strong>Total Current Assets</strong></td><td><strong>{formatCurrency(62500)}</strong></td></tr>
          <tr><td className="pl-6">Fixed Assets (net)</td><td>{formatCurrency(85000)}</td></tr>
          <tr><td><strong>TOTAL ASSETS</strong></td><td><strong className="text-teal">{formatCurrency(147500)}</strong></td></tr>
        </tbody></table>
      </div>
      <div className="card"><h3>Liabilities & Equity</h3>
        <table className="data-table"><thead><tr><th>Account</th><th>Amount</th></tr></thead><tbody>
          <tr><td className="pl-6">Accounts Payable</td><td>{formatCurrency(8200)}</td></tr>
          <tr><td className="pl-6">VAT Payable</td><td>{formatCurrency(3100)}</td></tr>
          <tr><td><strong>Total Liabilities</strong></td><td><strong>{formatCurrency(11300)}</strong></td></tr>
          <tr><td className="pl-6">Share Capital</td><td>{formatCurrency(100000)}</td></tr>
          <tr><td className="pl-6">Retained Earnings</td><td>{formatCurrency(36200)}</td></tr>
          <tr><td><strong>TOTAL EQUITY</strong></td><td><strong className="text-teal">{formatCurrency(136200)}</strong></td></tr>
        </tbody></table>
      </div>
    </div>
  )
  const PL = (
    <div className="card">
      <table className="data-table"><thead><tr><th>Account</th><th>This Month</th><th>Budget</th><th>Variance</th></tr></thead><tbody>
        <tr><td><strong>Revenue</strong></td><td>{formatCurrency(50000)}</td><td>{formatCurrency(45000)}</td><td className="text-green-700">+ {formatCurrency(5000)}</td></tr>
        <tr><td><strong>COGS</strong></td><td>{formatCurrency(28500)}</td><td>{formatCurrency(27000)}</td><td className="text-red-700">- {formatCurrency(1500)}</td></tr>
        <tr><td><strong>Gross Profit</strong></td><td><strong>{formatCurrency(21500)}</strong></td><td>{formatCurrency(18000)}</td><td className="text-green-700"><strong>+ {formatCurrency(3500)}</strong></td></tr>
        <tr><td><strong>Operating Expenses</strong></td><td>{formatCurrency(13000)}</td><td>{formatCurrency(14000)}</td><td className="text-green-700">Saved {formatCurrency(1000)}</td></tr>
        <tr><td><strong>Net Profit</strong></td><td><strong className="text-teal">{formatCurrency(8500)}</strong></td><td>{formatCurrency(4000)}</td><td className="text-green-700"><strong>+ {formatCurrency(4500)}</strong></td></tr>
      </tbody></table>
    </div>
  )
  const CF = (
    <div className="card">
      <table className="data-table"><thead><tr><th>Activity</th><th>Amount</th></tr></thead><tbody>
        <tr><td>Net Income</td><td>{formatCurrency(8500)}</td></tr>
        <tr><td>Depreciation</td><td>{formatCurrency(1200)}</td></tr>
        <tr><td>Working Capital Changes</td><td>({formatCurrency(2300)})</td></tr>
        <tr><td><strong>Net Cash from Operations</strong></td><td><strong className="text-teal">{formatCurrency(7400)}</strong></td></tr>
      </tbody></table>
    </div>
  )
  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="MOD-07 - GAAP/IFRS - Balance Sheet - P&L - Cash Flow"
        actions={<>
          <select className="border border-border rounded-lg px-3 py-2 text-sm bg-white" value={period} onChange={e => setPeriod(e.target.value)}>
            {["This Month","Last Month","Q1 2025","YTD 2025"].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="btn btn-ghost" onClick={() => showToast("Exporting PDF...", "success")}>Export PDF</button>
        </>}
      />
      <Tabs tabs={[{key:"bs",label:"Balance Sheet",content:BS},{key:"pl",label:"P&L",content:PL},{key:"cf",label:"Cash Flow",content:CF}]} />
    </div>
  )
}

import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Dashboard    from "@/routes/dashboard/DashboardPage";
import POS          from "@/routes/pos/PosPage";
import Inventory    from "@/routes/inventory/InventoryPage";
import Banking      from "@/routes/banking/BankingPage";
import Accounting   from "@/routes/accounting/AccountingPage";
import Reports      from "@/routes/reports/ReportsPage";
import AiInsights   from "@/routes/ai-insights/AiInsightsPage";
import Crm          from "@/routes/crm/CrmPage";
import HrPayroll    from "@/routes/hr-payroll/HrPayrollPage";
import Settings     from "@/routes/settings/SettingsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/"                element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"       element={<Dashboard />} />
        <Route path="/pos"             element={<POS />} />
        <Route path="/inventory"       element={<Inventory />} />
        <Route path="/banking"         element={<Banking />} />
        <Route path="/accounting"      element={<Accounting />} />
        <Route path="/reports"         element={<Reports />} />
        <Route path="/ai-insights"     element={<AiInsights />} />
        <Route path="/crm"             element={<Crm />} />
        <Route path="/hr-payroll"      element={<HrPayroll />} />
        <Route path="/settings"        element={<Settings />} />
      </Routes>
    </AppShell>
  );
}
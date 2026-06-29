import React, { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/Toaster"
import { AppShell } from "@/components/AppShell/AppShell"
import { ModuleGuard } from "@/lib/module-guard"
import { AuthGuard } from "@/lib/auth-guard"
import { PageLoader } from "@/components/ui/PageLoader"
import { ErrorBoundary } from "@/components/ui/ErrorBoundary"
import { LoginPage } from "@/routes/auth/LoginPage"
import { MFAPage } from "@/routes/auth/MFAPage"
import { NotFoundPage } from "@/routes/NotFoundPage"
import { ModuleNotActivePage } from "@/routes/ModuleNotActivePage"

// Core eagerly loaded
import DashboardPage from "@/routes/dashboard/DashboardPage"

// Lazy-loaded module bundles
const POSRoutes          = lazy(() => import("@/routes/pos"))
const InventoryRoutes    = lazy(() => import("@/routes/inventory"))
const BankingRoutes      = lazy(() => import("@/routes/banking"))
const AccountingRoutes   = lazy(() => import("@/routes/accounting"))
const ReportingRoutes    = lazy(() => import("@/routes/reporting"))
const AIRoutes           = lazy(() => import("@/routes/ai"))
const ProcurementRoutes  = lazy(() => import("@/routes/procurement"))
const CRMRoutes          = lazy(() => import("@/routes/crm"))
const HRRoutes           = lazy(() => import("@/routes/hr"))
const BranchRoutes       = lazy(() => import("@/routes/branches"))
const UsersRoutes        = lazy(() => import("@/routes/users"))
const SettingsRoutes     = lazy(() => import("@/routes/settings"))
const BudgetingRoutes    = lazy(() => import("@/routes/budgeting"))
const SalesOrderRoutes   = lazy(() => import("@/routes/sales-orders"))
const ManufacturingRoutes = lazy(() => import("@/routes/manufacturing"))
const ProjectRoutes      = lazy(() => import("@/routes/projects"))
const WorkflowRoutes     = lazy(() => import("@/routes/workflows"))
const ServiceRoutes      = lazy(() => import("@/routes/service"))

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
)

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mfa"   element={<MFAPage />} />

          <Route element={<AuthGuard><AppShell /></AuthGuard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="pos/*"         element={<ModuleGuard moduleCode="MOD-03"><S><POSRoutes /></S></ModuleGuard>} />
            <Route path="inventory/*"   element={<ModuleGuard moduleCode="MOD-04"><S><InventoryRoutes /></S></ModuleGuard>} />
            <Route path="banking/*"     element={<ModuleGuard moduleCode="MOD-05"><S><BankingRoutes /></S></ModuleGuard>} />
            <Route path="accounting/*"  element={<ModuleGuard moduleCode="MOD-06"><S><AccountingRoutes /></S></ModuleGuard>} />
            <Route path="reporting/*"   element={<ModuleGuard moduleCode="MOD-07"><S><ReportingRoutes /></S></ModuleGuard>} />
            <Route path="ai/*"          element={<ModuleGuard moduleCode="MOD-08"><S><AIRoutes /></S></ModuleGuard>} />
            <Route path="procurement/*" element={<ModuleGuard moduleCode="MOD-09"><S><ProcurementRoutes /></S></ModuleGuard>} />
            <Route path="crm/*"         element={<ModuleGuard moduleCode="MOD-10"><S><CRMRoutes /></S></ModuleGuard>} />
            <Route path="hr/*"          element={<ModuleGuard moduleCode="MOD-11"><S><HRRoutes /></S></ModuleGuard>} />
            <Route path="branches/*"    element={<ModuleGuard moduleCode="MOD-12"><S><BranchRoutes /></S></ModuleGuard>} />
            <Route path="users/*"       element={<ModuleGuard moduleCode="MOD-13"><S><UsersRoutes /></S></ModuleGuard>} />
            <Route path="settings/*"    element={<ModuleGuard moduleCode="MOD-14"><S><SettingsRoutes /></S></ModuleGuard>} />
            <Route path="budgeting/*"   element={<ModuleGuard moduleCode="MOD-15"><S><BudgetingRoutes /></S></ModuleGuard>} />
            <Route path="sales-orders/*" element={<ModuleGuard moduleCode="MOD-16"><S><SalesOrderRoutes /></S></ModuleGuard>} />
            <Route path="manufacturing/*" element={<ModuleGuard moduleCode="MOD-17"><S><ManufacturingRoutes /></S></ModuleGuard>} />
            <Route path="projects/*"    element={<ModuleGuard moduleCode="MOD-18"><S><ProjectRoutes /></S></ModuleGuard>} />
            <Route path="workflows/*"   element={<ModuleGuard moduleCode="MOD-19"><S><WorkflowRoutes /></S></ModuleGuard>} />
            <Route path="service/*"     element={<ModuleGuard moduleCode="MOD-20"><S><ServiceRoutes /></S></ModuleGuard>} />
            <Route path="module-not-active" element={<ModuleNotActivePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ErrorBoundary>
  )
}

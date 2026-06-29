import { Routes, Route } from "react-router-dom"
import BudgetingPage from "./BudgetingPage"
export default function BudgetingRoutes() {
  return <Routes><Route index element={<BudgetingPage />} /></Routes>
}

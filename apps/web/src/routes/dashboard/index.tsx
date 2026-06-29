import { Routes, Route } from "react-router-dom"
import DashboardPage from "./DashboardPage"
export default function DashboardRoutes() {
  return <Routes><Route index element={<DashboardPage />} /></Routes>
}

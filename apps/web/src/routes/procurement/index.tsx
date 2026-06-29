import { Routes, Route } from "react-router-dom"
import ProcurementPage from "./ProcurementPage"
export default function ProcurementRoutes() {
  return <Routes><Route index element={<ProcurementPage />} /></Routes>
}

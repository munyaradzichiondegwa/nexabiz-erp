import { Routes, Route } from "react-router-dom"
import ManufacturingPage from "./ManufacturingPage"
export default function ManufacturingRoutes() {
  return <Routes><Route index element={<ManufacturingPage />} /></Routes>
}

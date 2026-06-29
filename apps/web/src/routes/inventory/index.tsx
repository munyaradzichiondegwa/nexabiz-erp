import { Routes, Route } from "react-router-dom"
import InventoryPage from "./InventoryPage"
export default function InventoryRoutes() {
  return <Routes><Route index element={<InventoryPage />} /></Routes>
}

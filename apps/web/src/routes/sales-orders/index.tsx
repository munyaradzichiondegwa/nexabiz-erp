import { Routes, Route } from "react-router-dom"
import SalesOrdersPage from "./SalesOrdersPage"
export default function SalesOrderRoutes() {
  return <Routes><Route index element={<SalesOrdersPage />} /></Routes>
}

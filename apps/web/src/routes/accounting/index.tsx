import { Routes, Route } from "react-router-dom"
import AccountingPage from "./AccountingPage"
export default function AccountingRoutes() {
  return <Routes><Route index element={<AccountingPage />} /></Routes>
}

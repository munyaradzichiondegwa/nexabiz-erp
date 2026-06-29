import { Routes, Route } from "react-router-dom"
import BankingPage from "./BankingPage"
export default function BankingRoutes() {
  return <Routes><Route index element={<BankingPage />} /></Routes>
}

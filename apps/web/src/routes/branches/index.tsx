import { Routes, Route } from "react-router-dom"
import BranchesPage from "./BranchesPage"
export default function BranchRoutes() {
  return <Routes><Route index element={<BranchesPage />} /></Routes>
}

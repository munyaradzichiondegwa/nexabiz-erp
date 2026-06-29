import { Routes, Route } from "react-router-dom"
import HrPage from "./HrPage"
export default function HRRoutes() {
  return <Routes><Route index element={<HrPage />} /></Routes>
}

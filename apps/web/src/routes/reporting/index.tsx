import { Routes, Route } from "react-router-dom"
import ReportingPage from "./ReportingPage"
export default function ReportingRoutes() {
  return <Routes><Route index element={<ReportingPage />} /></Routes>
}

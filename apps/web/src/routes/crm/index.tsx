import { Routes, Route } from "react-router-dom"
import CrmPage from "./CrmPage"
export default function CRMRoutes() {
  return <Routes><Route index element={<CrmPage />} /></Routes>
}

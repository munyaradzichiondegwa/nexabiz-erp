import { Routes, Route } from "react-router-dom"
import PosPage from "./PosPage"
export default function POSRoutes() {
  return <Routes><Route index element={<PosPage />} /></Routes>
}

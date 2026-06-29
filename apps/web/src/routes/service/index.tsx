import { Routes, Route } from "react-router-dom"
import ServicePage from "./ServicePage"
export default function ServiceRoutes() {
  return <Routes><Route index element={<ServicePage />} /></Routes>
}

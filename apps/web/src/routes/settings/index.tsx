import { Routes, Route } from "react-router-dom"
import SettingsPage from "./SettingsPage"
export default function SettingsRoutes() {
  return <Routes><Route index element={<SettingsPage />} /></Routes>
}

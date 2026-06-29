import { Routes, Route } from "react-router-dom"
import AiInsightsPage from "./AiInsightsPage"
export default function AIRoutes() {
  return <Routes><Route index element={<AiInsightsPage />} /></Routes>
}

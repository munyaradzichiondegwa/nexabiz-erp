import { Routes, Route } from "react-router-dom"
import WorkflowsPage from "./WorkflowsPage"
export default function WorkflowRoutes() {
  return <Routes><Route index element={<WorkflowsPage />} /></Routes>
}

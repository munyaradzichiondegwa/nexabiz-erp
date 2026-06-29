import { Routes, Route } from "react-router-dom"
import ProjectsPage from "./ProjectsPage"
export default function ProjectRoutes() {
  return <Routes><Route index element={<ProjectsPage />} /></Routes>
}

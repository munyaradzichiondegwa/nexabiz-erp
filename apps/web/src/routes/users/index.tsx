import { Routes, Route } from "react-router-dom"
import UsersPage from "./UsersPage"
export default function UsersRoutes() {
  return <Routes><Route index element={<UsersPage />} /></Routes>
}

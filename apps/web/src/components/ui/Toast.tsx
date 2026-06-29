/**
 * Toast system — wraps our existing Toaster but adds the showToast() imperative API
 * that mirrors the index.html prototype so migrated code works identically.
 */
import { toast } from "@/components/ui/Toaster"
export { Toaster } from "@/components/ui/Toaster"

export function showToast(msg: string, type: "success" | "error" | "warning" | "info" = "info") {
  toast[type](msg)
}

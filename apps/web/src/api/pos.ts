import { apiClient } from "@/lib/api-client"

export interface Product { id: string; name: string; price: number; stock: number; icon: string; sku: string; category: string }
export interface CartItem extends Product { qty: number }
export interface CheckoutPayload { items: { productId: string; qty: number }[]; paymentMethod: string; discount?: number }
export interface CheckoutResult  { receiptId: string; total: number; change?: number; glRef: string }

export const posApi = {
  getProducts:   (search?: string) => apiClient.get<Product[]>("/pos/products", { params: { search } }).then(r => r.data),
  checkout:      (payload: CheckoutPayload) => apiClient.post<CheckoutResult>("/pos/checkout", payload).then(r => r.data),
  printReceipt:  (receiptId: string) => apiClient.post(`/pos/receipt/${receiptId}/print`).then(r => r.data),
  openCashDrawer:() => apiClient.post("/pos/cash-drawer/open").then(r => r.data),
  getZReport:    () => apiClient.get("/pos/z-report").then(r => r.data),
}

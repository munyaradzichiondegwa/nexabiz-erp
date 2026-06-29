export { MODULE_CODES, CORE_MODULES, GL_EVENT_TOPICS } from "@/lib/constants"

export const CURRENCY = "USD"
export const DATE_FORMAT = "dd MMM yyyy"
export const DATETIME_FORMAT = "dd MMM yyyy HH:mm"

export const PAYMENT_METHODS = ["cash", "card", "mobile", "bank_transfer", "credit", "split"] as const
export const ORDER_STATUSES   = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const
export const INVOICE_STATUSES = ["draft", "sent", "partial", "paid", "overdue", "cancelled"] as const

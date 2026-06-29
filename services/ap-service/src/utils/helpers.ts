/**
 * Utility helpers — shared across this service
 */

/** Paginate helper: returns offset for SQL LIMIT/OFFSET */
export function paginate(page: number, limit: number) {
  return { offset: Math.max(0, page) * Math.max(1, limit), limit: Math.min(200, Math.max(1, limit)) }
}

/** Sanitise a string for safe use in LIKE queries */
export function safeLike(search: string) {
  return `%${search.replace(/[%_]/g, "\$&")}%`
}

/** Format a PostgreSQL TIMESTAMPTZ for display */
export function formatDate(ts: string | Date | null): string {
  if (!ts) return "—"
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

/** Round to 4 decimal places (matches DB precision) */
export function round4(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

/** Generate a human-readable reference code */
export function genRef(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

/** Assert an object is not null/undefined or throw 404 */
export function assertFound<T>(obj: T | null | undefined, message = "Resource not found"): T {
  if (obj == null) {
    const err = new Error(message) as any
    err.statusCode = 404
    throw err
  }
  return obj
}

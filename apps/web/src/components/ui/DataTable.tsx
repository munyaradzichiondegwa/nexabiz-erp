import React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  emptyMessage?: string
  onSort?: (key: string, dir: "asc" | "desc") => void
  sortKey?: string
  sortDir?: "asc" | "desc"
}

export function DataTable<T>({ columns, data, keyField, isLoading, emptyMessage = "No records found", onSort, sortKey, sortDir }: Props<T>) {
  return (
    <div className="overflow-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && onSort?.(String(col.key), sortKey === String(col.key) && sortDir === "asc" ? "desc" : "asc")}
                className={col.sortable ? "cursor-pointer select-none" : ""}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === String(col.key) && (
                    sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={columns.length} className="text-center py-8 text-muted-foreground text-sm">Loading…</td></tr>
          ) : !data.length ? (
            <tr><td colSpan={columns.length} className="text-center py-8 text-muted-foreground text-sm">{emptyMessage}</td></tr>
          ) : (
            data.map(row => (
              <tr key={String(row[keyField])}>
                {columns.map(col => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

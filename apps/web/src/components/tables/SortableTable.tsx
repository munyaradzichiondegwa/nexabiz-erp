/**
 * SortableTable — wrapper around DataTable with built-in sort state management
 */
import React, { useState } from "react"
import { DataTable, type Column } from "@/components/ui/DataTable"

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  isLoading?: boolean
  defaultSort?: { key: string; dir: "asc" | "desc" }
}

export function SortableTable<T>({ columns, data, keyField, isLoading, defaultSort }: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSort?.key)
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSort?.dir ?? "asc")

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as any)[sortKey]
        const bv = (b as any)[sortKey]
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
    : data

  const handleSort = (key: string, dir: "asc" | "desc") => { setSortKey(key); setSortDir(dir) }

  return <DataTable columns={columns} data={sorted} keyField={keyField} isLoading={isLoading}
    onSort={handleSort} sortKey={sortKey} sortDir={sortDir} />
}

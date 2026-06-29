import React from "react"
import { cn } from "@/utils/cn"

interface Props {
  label: string
  value: string
  sub?: string
  color?: string
  onClick?: () => void
  className?: string
}

export const KPICard: React.FC<Props> = ({ label, value, sub, color = "bg-teal", onClick, className }) => (
  <div className={cn("kpi", color, className)} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
    <div className="k-label">{label}</div>
    <div className="k-val">{value}</div>
    {sub && <div className="k-sub">{sub}</div>}
  </div>
)

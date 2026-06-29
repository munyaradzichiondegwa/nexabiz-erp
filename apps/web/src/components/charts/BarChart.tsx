import React from "react"

interface BarData { label: string; value: number }
interface Props { data: BarData[]; height?: number; color?: string; className?: string }

export const BarChart: React.FC<Props> = ({ data, height = 120, color = "#2DB89E", className = "" }) => {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value)) || 1

  return (
    <div className={`flex items-end gap-1 ${className}`} style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div className="w-full rounded-t-sm transition-all duration-300"
               style={{ height: `${(d.value / max) * (height - 24)}px`, background: color }} />
          <span className="text-[9px] text-muted-foreground truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

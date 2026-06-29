/**
 * SparklineChart — Exact port of the index.html SVG chart logic
 * into a reusable React component. Same area-fill + data-point hover.
 */
import React, { useRef, useEffect, useState } from "react"

interface Props {
  data: number[]
  labels?: string[]
  color?: string
  height?: number
  className?: string
}

export const SparklineChart: React.FC<Props> = ({
  data, labels, color = "#2DB89E", height = 90, className = ""
}) => {
  const ref = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null)
  const [width, setWidth] = useState(400)

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setWidth(entries[0]?.contentRect.width ?? 400)
    })
    if (wrapRef.current) observer.observe(wrapRef.current)
    return () => observer.disconnect()
  }, [])

  if (!data.length) return null

  const pad = 10
  const n = data.length
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const xs = data.map((_, i) => pad + (i * (width - pad * 2)) / (n - 1))
  const ys = data.map(v => height - pad - ((v - min) / range) * (height - pad * 2))
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ")
  const area = `${xs[0]},${height} ${pts} ${xs[n - 1]},${height}`
  const gradId = `grad-${color.replace("#", "")}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ height }}>
      <svg ref={ref} viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gradId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle
            key={i} cx={xs[i]} cy={ys[i]} r={4}
            fill={color} stroke="#fff" strokeWidth={2}
            className="cursor-pointer"
            onMouseEnter={e => {
              const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
              const wrapRect = wrapRef.current!.getBoundingClientRect()
              setTooltip({ x: rect.left - wrapRect.left + 8, y: rect.top - wrapRect.top - 28, label: labels?.[i] ?? `${v.toLocaleString()}` })
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>
      {tooltip && (
        <div
          className="absolute bg-navy text-white text-xs px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-10"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  )
}

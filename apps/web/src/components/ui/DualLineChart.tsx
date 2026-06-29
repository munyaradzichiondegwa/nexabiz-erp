import React, { useRef, useEffect, useState } from "react"

interface Props {
  dataA: number[]; dataB: number[]
  colorA?: string; colorB?: string
  labelA?: string; labelB?: string
  height?: number
}

export const DualLineChart: React.FC<Props> = ({
  dataA, dataB, colorA = "#2DB89E", colorB = "#F5A623",
  labelA = "Income", labelB = "Expenses", height = 90
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(400)

  useEffect(() => {
    const ob = new ResizeObserver(e => setWidth(e[0]?.contentRect.width ?? 400))
    if (wrapRef.current) ob.observe(wrapRef.current)
    return () => ob.disconnect()
  }, [])

  const pad = 10, n = dataA.length
  const max = Math.max(...dataA, ...dataB) || 1
  const xs = dataA.map((_, i) => pad + (i * (width - pad * 2)) / (n - 1))
  const pts = (arr: number[]) => xs.map((x, i) => `${x},${height - pad - (arr[i] / max) * (height - pad * 2)}`).join(" ")

  return (
    <div ref={wrapRef} style={{ height }} className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <polyline points={pts(dataA)} fill="none" stroke={colorA} strokeWidth={2.5} strokeLinejoin="round" />
        <polyline points={pts(dataB)} fill="none" stroke={colorB} strokeWidth={2.5} strokeLinejoin="round" />
        <text x={width - 65} y={14} fill={colorA} fontSize={10}>{labelA}</text>
        <text x={width - 65} y={28} fill={colorB} fontSize={10}>{labelB}</text>
      </svg>
    </div>
  )
}

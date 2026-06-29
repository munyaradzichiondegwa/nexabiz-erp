import React, { useState } from "react"
import { cn } from "@/utils/cn"

interface Tab { key: string; label: string; content: React.ReactNode }
interface Props { tabs: Tab[]; defaultTab?: string; className?: string }

export const Tabs: React.FC<Props> = ({ tabs, defaultTab, className }) => {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key)
  const current = tabs.find(t => t.key === active)

  return (
    <div className={className}>
      <div className="tabs" role="tablist">
        {tabs.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={cn("tab", active === t.key && "active")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{current?.content}</div>
    </div>
  )
}

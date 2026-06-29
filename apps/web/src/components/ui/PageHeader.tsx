import React from "react"

interface Props {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const PageHeader: React.FC<Props> = ({ title, subtitle, actions }) => (
  <div className="ph">
    <div>
      <h1>{title}</h1>
      {subtitle && <div className="sub">{subtitle}</div>}
    </div>
    {actions && <div className="actions">{actions}</div>}
  </div>
)

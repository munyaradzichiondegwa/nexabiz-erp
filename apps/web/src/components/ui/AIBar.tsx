import React from "react"

interface Props { children: React.ReactNode }

export const AIBar: React.FC<Props> = ({ children }) => (
  <div className="ai-bar" role="status">
    <span className="text-base" aria-hidden>🤖</span>
    <span>{children}</span>
  </div>
)

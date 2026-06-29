import React from "react"
import { cn } from "@/utils/cn"

interface Props {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
  required?: boolean
}

export const FormGroup: React.FC<Props> = ({ label, error, children, className, required }) => (
  <div className={cn("form-group", className)}>
    <label>
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
)

import React from "react"
import { cn } from "@/utils/cn"

type Variant = "ok" | "warn" | "bad" | "blue" | "default"

const variantClass: Record<Variant, string> = {
  ok:      "b-ok",
  warn:    "b-warn",
  bad:     "b-bad",
  blue:    "b-blue",
  default: "bg-gray-100 text-gray-800",
}

interface Props { children: React.ReactNode; variant?: Variant; className?: string }

export const Badge: React.FC<Props> = ({ children, variant = "default", className }) => (
  <span className={cn("badge", variantClass[variant], className)}>{children}</span>
)
